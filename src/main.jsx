import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import './index.css'
import { router } from './router.jsx'
import { useAuthStore } from './store'
import { ServiceProvider } from './infrastructure/di'

// Initialize auth on app load
function AppWithAuth() {
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return <RouterProvider router={router} />;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ServiceProvider>
      <AppWithAuth />
    </ServiceProvider>
  </StrictMode>,
)


