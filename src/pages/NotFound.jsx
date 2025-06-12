import { Link } from 'react-router-dom'
import { FiHome, FiAlertTriangle } from 'react-icons/fi'
import Button from '../components/ui/Button'

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <FiAlertTriangle className="h-16 w-16 text-primary-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">Página no encontrada</h1>
        <p className="text-gray-600 mb-6 max-w-md">
          Lo sentimos, la página que estás buscando no existe o ha sido movida.
        </p>
        <Button
          to="/dashboard"
          variant="primary"
          icon={<FiHome />}
        >
          Volver al inicio
        </Button>
      </div>
    </div>
  )
}

export default NotFound