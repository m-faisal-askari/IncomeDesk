export function isDemoPath(pathname = window.location.pathname) {
  return pathname === '/demo' || pathname.startsWith('/demo/');
}

export function appPath(path, isDemo = isDemoPath()) {
  if (!isDemo || path.startsWith('/demo')) return path;
  return `/demo${path === '/' ? '' : path}`;
}
