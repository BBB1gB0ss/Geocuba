import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import  {jwtDecode}  from 'jwt-decode'
import { loginUser, registerUser, logoutUser } from '../services/authService'

const AuthContext = createContext(null)

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token')
      
      if (token) {
        try {
          // Verify token expiration
          const decoded = jwtDecode(token)
          const currentTime = Date.now() / 1000
          
          if (decoded.exp > currentTime) {
            setUser({
              id: decoded.sub,
              name: decoded.name,
              email: decoded.email,
              role: decoded.role
            })
            setIsAuthenticated(true)
          } else {
            // Token expired
            localStorage.removeItem('token')
          }
        } catch (error) {
          // Invalid token
          localStorage.removeItem('token')
        }
      }
      
      setIsLoading(false)
    }
    
    checkAuth()
  }, [])

  // Login function
  const login = async (email, password) => {
    setIsLoading(true)
    try {
      const { token, user } = await loginUser(email, password)
      
      localStorage.setItem('token', token)
      setUser(user)
      setIsAuthenticated(true)
      navigate('/dashboard')
      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Register function (admin only)
  const register = async (userData) => {
    try {
      const result = await registerUser(userData)
      return { success: true, data: result }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      }
    }
  }

  // Logout function
  const logout = async () => {
    try {
      await logoutUser()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('token')
      setUser(null)
      setIsAuthenticated(false)
      navigate('/login')
    }
  }

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}