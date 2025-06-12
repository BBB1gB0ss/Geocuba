import { Outlet } from 'react-router-dom'
import Logo from '../../assets/Logo'

const AuthLayout = () => {
  return (
    <div className="grid-pattern min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo width={200} />
        </div>
        
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <Outlet />
        </div>
        
        <p className="text-center mt-6 text-sm text-white">
          © {new Date().getFullYear()} GEODESA. Todos los derechos reservados.
        </p>
      </div>
    </div>
  )
}

export default AuthLayout