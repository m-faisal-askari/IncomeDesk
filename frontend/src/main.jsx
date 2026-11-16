import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider, MutationCache } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider, useToast } from './contexts/ToastContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { ThemeProvider } from './contexts/ThemeContext';
import App from './App';
import './index.css';

// Global error handler for all TanStack Query mutations
let globalShowError = null;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => error?.status !== 401 && failureCount < 1,
      staleTime: 1000 * 30, // 30 seconds
    },
    mutations: {
      onError: (error) => {
        if (globalShowError && error.status !== 401) {
          globalShowError(error.message || 'Operation failed');
        }
      }
    }
  },
  mutationCache: new MutationCache({
    onError: (error) => {
      if (globalShowError && error.status !== 401) {
        globalShowError(error.message || 'Action could not be completed');
      }
    }
  })
});

function ToastBridge({ children }) {
  const { showError } = useToast();
  React.useEffect(() => {
    globalShowError = showError;
    return () => {
      globalShowError = null;
    };
  }, [showError]);

  return children;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <ThemeProvider>
            <CurrencyProvider>
              <ToastProvider>
                <ToastBridge>
                  <App />
                </ToastBridge>
              </ToastProvider>
            </CurrencyProvider>
          </ThemeProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
