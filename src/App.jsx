import { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

// Layouts
import MainLayout from './components/layout/MainLayout'
import AuthLayout from './components/layout/AuthLayout'

// Regular imports for initial load
import Loading from './components/ui/Loading'
import Login from './pages/Auth/Login'

// Lazy loaded routes
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'))
const LayersList = lazy(() => import('./pages/Layers/LayersList'))
const LayerDetail = lazy(() => import('./pages/Layers/LayerDetail'))
const LayerUpload = lazy(() => import('./pages/Layers/LayerUpload'))
const UsersList = lazy(() => import('./pages/Users/UsersList'))
const Register = lazy(() => import('./pages/Auth/Register'))
const NotFound = lazy(() => import('./pages/NotFound'))

// Protected route component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated } = useAuth()
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }
  
  return children
}

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        {/* Auth routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
        </Route>
        
        {/* Protected routes */}
        <Route element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route path="/" element={<Navigate to="/dashboard\" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/layers" element={<LayersList />} />
          <Route path="/layers/:id" element={<LayerDetail />} />
          <Route 
            path="/layers/upload" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'specialist']}>
                <LayerUpload />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/users" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <UsersList />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/register" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Register />
              </ProtectedRoute>
            } 
          />
        </Route>
        
        {/* 404 route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}

export default App