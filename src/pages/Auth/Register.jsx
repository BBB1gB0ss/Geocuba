import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { FiUser, FiMail, FiLock, FiUserCheck } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/ui/Button'
import Alert from '../../components/ui/Alert'

const Register = () => {
  const { register: registerUser } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()
  
  const onSubmit = async (data) => {
    setIsLoading(true)
    setError(null)
    setSuccess(false)
    
    try {
      const result = await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role
      })
      
      if (result.success) {
        setSuccess(true)
        reset() // Clear form
      } else {
        setError(result.message || 'Error al registrar usuario')
      }
    } catch (err) {
      setError('Error de conexión al registrar usuario')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Registrar Nuevo Usuario</h1>
        <p className="text-gray-600">Crea una nueva cuenta de usuario con acceso al sistema.</p>
      </div>
      
      {success && (
        <Alert 
          type="success" 
          message="Usuario registrado con éxito" 
          onClose={() => setSuccess(false)} 
          className="mb-4"
        />
      )}
      
      {error && (
        <Alert 
          type="error" 
          message={error} 
          onClose={() => setError(null)} 
          className="mb-4"
        />
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre Completo
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiUser className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="name"
              type="text"
              className={`block w-full pl-10 pr-3 py-2 border ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              } rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500`}
              placeholder="Juan Pérez"
              {...register('name', { 
                required: 'El nombre es requerido',
                minLength: {
                  value: 3,
                  message: 'El nombre debe tener al menos 3 caracteres'
                }
              })}
            />
          </div>
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Correo Electrónico
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiMail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="email"
              type="email"
              className={`block w-full pl-10 pr-3 py-2 border ${
                errors.email ? 'border-red-300' : 'border-gray-300'
              } rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500`}
              placeholder="ejemplo@geodesa.com"
              {...register('email', { 
                required: 'El correo electrónico es requerido',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Dirección de correo inválida'
                }
              })}
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Contraseña
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiLock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="password"
              type="password"
              className={`block w-full pl-10 pr-3 py-2 border ${
                errors.password ? 'border-red-300' : 'border-gray-300'
              } rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500`}
              placeholder="••••••••"
              {...register('password', { 
                required: 'La contraseña es requerida',
                minLength: {
                  value: 6,
                  message: 'La contraseña debe tener al menos 6 caracteres'
                }
              })}
            />
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
            Rol de Usuario
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiUserCheck className="h-5 w-5 text-gray-400" />
            </div>
            <select
              id="role"
              className={`block w-full pl-10 pr-3 py-2 border ${
                errors.role ? 'border-red-300' : 'border-gray-300'
              } rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500`}
              {...register('role', { 
                required: 'El rol es requerido' 
              })}
            >
              <option value="">Seleccionar rol</option>
              <option value="admin">Administrador</option>
              <option value="specialist">Especialista</option>
              <option value="user">Usuario General</option>
            </select>
          </div>
          {errors.role && (
            <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
          )}
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => reset()}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isLoading}
          >
            Registrar Usuario
          </Button>
        </div>
      </form>
    </div>
  )
}

export default Register