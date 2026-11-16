from functools import lru_cache
import logging
from typing import Optional
from uuid import UUID

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt.exceptions import (
    ExpiredSignatureError,
    InvalidAudienceError,
    InvalidIssuerError,
    InvalidSignatureError,
    InvalidTokenError,
    PyJWKClientConnectionError,
    PyJWKClientError,
)
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from backend.app.core.config import settings
from backend.app.core.database import get_db

security = HTTPBearer(auto_error=False)
_ASYMMETRIC_ALGORITHMS = {"ES256", "RS256", "EdDSA"}
logger = logging.getLogger(__name__)

# This public demo credential is deliberately limited to one fixed sample user.
# It must never resolve to a real authenticated account.
DEMO_ACCESS_TOKEN = "incomedesk-public-demo"
DEMO_USER_ID = "incomedesk-public-demo"
DEMO_EMAIL = "alex.morgan@example.com"
DEMO_NAME = "Alex Morgan"


@lru_cache(maxsize=4)
def _jwk_client(jwks_url: str) -> jwt.PyJWKClient:
    return jwt.PyJWKClient(jwks_url, cache_jwk_set=True, lifespan=300, timeout=5)


def verify_token(token: str) -> dict:
    """Verify a Supabase user access token; never trust decoded unsigned claims."""
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No access token was sent. Please sign in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if settings.DEV_AUTH_ENABLED and (
        token.startswith("dev-user-") or token.startswith("auth-tester-")
    ):
        prefix = "dev-user-" if token.startswith("dev-user-") else "auth-tester-"
        user_id = token[len(prefix):]
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="The development sign-in token is incomplete. Please sign in again.",
            )
        user_name = user_id.replace("-", " ").replace("_", " ").title()
        return {
            "sub": user_id,
            "email": f"{user_id}@freelancefinance.local",
            "name": user_name,
            "user_metadata": {"full_name": user_name},
            "role": "authenticated",
            "_dev_auth": True,
        }

    supabase_url = (settings.SUPABASE_URL or "").rstrip("/")
    if not supabase_url:
        logger.error("Supabase token verification is unavailable: SUPABASE_URL is not configured")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="IncomeDesk authentication is not configured on the server. Contact the app administrator.",
        )
    issuer = f"{supabase_url}/auth/v1"

    try:
        header = jwt.get_unverified_header(token)
        algorithm = header.get("alg")

        if algorithm == "HS256":
            # For legacy Supabase projects, require the explicitly configured secret.
            # No built-in development key is accepted.
            if not settings.SUPABASE_JWT_SECRET:
                logger.error("Supabase uses HS256 but SUPABASE_JWT_SECRET is not configured")
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail="The server is missing the Supabase JWT secret required to verify this sign-in. Contact the app administrator.",
                )
            payload = jwt.decode(
                token,
                settings.SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                issuer=issuer,
                audience="authenticated",
            )
        elif algorithm in _ASYMMETRIC_ALGORITHMS:
            jwks_url = f"{issuer}/.well-known/jwks.json"
            signing_key = _jwk_client(jwks_url).get_signing_key_from_jwt(token)
            payload = jwt.decode(
                token,
                signing_key.key,
                algorithms=[algorithm],
                issuer=issuer,
                audience="authenticated",
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="The sign-in token uses an unsupported signing algorithm. Sign in again and contact the app administrator if this continues.",
            )
    except HTTPException:
        raise
    except ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Your Supabase sign-in session has expired. Please sign in again.",
            headers={"WWW-Authenticate": 'Bearer error="invalid_token"'},
        )
    except InvalidIssuerError:
        logger.warning("Rejected Supabase access token with a different issuer")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="This sign-in token belongs to a different Supabase project. Check that the frontend and backend use the same project URL.",
            headers={"WWW-Authenticate": 'Bearer error="invalid_token"'},
        )
    except InvalidAudienceError:
        logger.warning("Rejected Supabase access token with an unexpected audience")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Supabase returned a token with an unexpected audience. Check the backend Supabase project and auth configuration.",
            headers={"WWW-Authenticate": 'Bearer error="invalid_token"'},
        )
    except InvalidSignatureError:
        logger.warning("Rejected Supabase access token with an invalid signature")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="The sign-in token signature is invalid. Check that the frontend and backend use the same Supabase project and signing settings.",
            headers={"WWW-Authenticate": 'Bearer error="invalid_token"'},
        )
    except PyJWKClientConnectionError:
        logger.exception("Could not reach Supabase JWKS endpoint %s", f"{issuer}/.well-known/jwks.json")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="IncomeDesk could not reach Supabase to verify your sign-in. Your session was kept; please retry in a moment.",
        )
    except PyJWKClientError:
        logger.warning("Supabase signing key was not found for the presented token")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Supabase's signing key did not match this token. Sign in again; if this continues, check that both app environments use the same Supabase project.",
            headers={"WWW-Authenticate": 'Bearer error="invalid_token"'},
        )
    except InvalidTokenError as exc:
        logger.info("Rejected malformed Supabase access token: %s", type(exc).__name__)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="The Supabase access token is malformed or could not be verified. Please sign in again.",
            headers={"WWW-Authenticate": 'Bearer error="invalid_token"'},
        )
    except Exception:
        # A verifier bug or unexpected upstream failure is a server problem, not
        # proof that the user's browser session has expired.
        logger.exception("Unexpected error while verifying a Supabase access token")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="IncomeDesk could not verify your sign-in right now. Your session was kept; please retry in a moment.",
        )

    if payload.get("role") != "authenticated" or payload.get("is_anonymous"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="This Supabase session is not an authenticated user session. Please sign in again.",
            headers={"WWW-Authenticate": 'Bearer error="invalid_token"'},
        )
    if not payload.get("sub") or not payload.get("email"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="The Supabase session is missing its user ID or email. Check Google email/profile access and sign in again.",
            headers={"WWW-Authenticate": 'Bearer error="invalid_token"'},
        )
    return payload


def _resolve_user(payload: dict, db: Session) -> dict:
    """Map verified Supabase identities to one local account and preserve its data ID."""
    from backend.app.models.models import UserAccount

    subject = str(payload["sub"])
    try:
        UUID(subject)
    except (ValueError, TypeError, AttributeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Supabase returned an invalid user ID in this session. Please sign in again.",
            headers={"WWW-Authenticate": 'Bearer error="invalid_token"'},
        )

    email = str(payload["email"]).strip().lower()
    if "@" not in email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Supabase did not provide a valid email for this account. Allow Google email access and sign in again.",
            headers={"WWW-Authenticate": 'Bearer error="invalid_token"'},
        )

    account = db.query(UserAccount).filter(UserAccount.provider_id == subject).first()
    if account is None:
        account = db.query(UserAccount).filter(UserAccount.email == email).first()

    app_metadata = payload.get("app_metadata") or {}
    providers = app_metadata.get("providers") or []
    provider = "google" if "google" in providers else app_metadata.get("provider", "email")
    if provider not in {"email", "google"}:
        provider = "supabase"
    metadata = payload.get("user_metadata") or {}
    full_name = metadata.get("full_name") or metadata.get("name") or payload.get("name")

    changed = False
    if account is None:
        account = UserAccount(
            id=subject,
            email=email,
            full_name=full_name,
            auth_provider=provider,
            provider_id=subject,
            password_hash=None,
        )
        db.add(account)
        changed = True
    else:
        if account.email != email:
            account.email = email
            changed = True
        if account.provider_id != subject:
            account.provider_id = subject
            changed = True
        if account.auth_provider != provider:
            account.auth_provider = provider
            changed = True
        # Supabase is now the only password authority; discard any legacy app hash
        # when that account is next used with a verified Supabase session.
        if account.password_hash is not None:
            account.password_hash = None
            changed = True
        if full_name and account.full_name != full_name:
            account.full_name = full_name
            changed = True

    if changed:
        try:
            db.commit()
        except IntegrityError:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="This sign-in identity is already linked to another account.",
            )

    return {
        "user_id": account.id,
        "email": email,
        "full_name": full_name or account.full_name,
        "is_guest": False,
        "auth_provider": provider,
    }


def get_current_user_claims(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db),
) -> dict:
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No access token was sent to the API. Please sign in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if credentials.credentials == DEMO_ACCESS_TOKEN:
        from backend.app.seed import ensure_demo_data

        ensure_demo_data(db)
        return {
            "sub": DEMO_USER_ID,
            "user_id": DEMO_USER_ID,
            "email": DEMO_EMAIL,
            "name": DEMO_NAME,
            "full_name": DEMO_NAME,
            "is_guest": False,
            "is_demo": True,
            "auth_provider": "demo",
            "role": "authenticated",
        }

    payload = verify_token(credentials.credentials)

    if payload.get("_dev_auth"):
        user_id = str(payload["sub"])
        return {
            **payload,
            "user_id": user_id,
            "full_name": (payload.get("user_metadata") or {}).get("full_name") or payload.get("name"),
            "is_guest": False,
        }

    return {**payload, **_resolve_user(payload, db)}


def get_current_user_id(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db),
) -> str:
    return get_current_user_claims(credentials, db)["user_id"]
