import { useState, useEffect } from 'react'
import { FiMap, FiUsers, FiLayers, FiMessageSquare } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import Loading from '../../components/ui/Loading'
import { getLayers } from '../../services/layerService'
import { getUsers } from '../../services/userService'

// Mock data for demonstration
const MOCK_DATA = {
  recentLayers: [
    { id: 1, name: 'Mapa de Relieve', date: '2023-11-15', user: 'Carlos Mendoza' },
    { id: 2, name: 'Distribución Urbana 2023', date: '2023-11-10', user: 'María García' },
    { id: 3, name: 'Densidad Poblacional', date: '2023-11-05', user: 'José Pérez' },
  ],
  recentComments: [
    { id: 1, layerId: 1, layerName: 'Mapa de Relieve', content: 'La precisión de los datos de elevación es excelente.', user: 'Laura Martínez', role: 'specialist', date: '2023-11-14' },
    { id: 2, layerId: 2, layerName: 'Distribución Urbana 2023', content: 'Se recomienda actualizar con los datos del último censo.', user: 'Daniel Rodríguez', role: 'specialist', date: '2023-11-09' },
    { id: 3, layerId: 1, layerName: 'Mapa de Relieve', content: 'Excelente trabajo, muy útil para nuestro proyecto.', user: 'Ana López', role: 'user', date: '2023-11-12' },
  ]
}

const StatsCard = ({ title, value, icon, color }) => {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white rounded-lg shadow-md overflow-hidden"
    >
      <div className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
          </div>
          <div className={`h-12 w-12 rounded-full flex items-center justify-center ${color}`}>
            {icon}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

const Dashboard = () => {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalLayers: 0,
    myLayers: 0,
    totalUsers: 0,
    totalComments: 0
  })
  const [recentLayers, setRecentLayers] = useState([])
  const [recentComments, setRecentComments] = useState([])
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // In a real app, this would make API calls
        // For demo purposes, we're using mock data
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Set stats
        setStats({
          totalLayers: 24,
          myLayers: user?.role === 'admin' ? 8 : 4,
          totalUsers: 12,
          totalComments: 35
        })
        
        setRecentLayers(MOCK_DATA.recentLayers)
        setRecentComments(MOCK_DATA.recentComments)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchDashboardData()
  }, [user])
  
  if (isLoading) {
    return <Loading />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Bienvenido, {user?.name}</h1>
        <p className="text-gray-600 mt-1">
          Panel de control y estadísticas de la plataforma geográfica.
        </p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          title="Total de Capas" 
          value={stats.totalLayers} 
          icon={<FiLayers size={24} className="text-white" />}
          color="bg-primary-500"
        />
        <StatsCard 
          title="Mis Capas" 
          value={stats.myLayers} 
          icon={<FiMap size={24} className="text-white" />}
          color="bg-secondary-500"
        />
        {user?.role === 'admin' && (
          <StatsCard 
            title="Usuarios" 
            value={stats.totalUsers} 
            icon={<FiUsers size={24} className="text-white" />}
            color="bg-green-500"
          />
        )}
        <StatsCard 
          title="Comentarios" 
          value={stats.totalComments} 
          icon={<FiMessageSquare size={24} className="text-white" />}
          color="bg-purple-500"
        />
      </div>
      
      {/* Recent Layers */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h2 className="text-lg font-medium">Capas Recientes</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {recentLayers.length === 0 ? (
            <p className="text-gray-500 p-4 text-center">No hay capas recientes</p>
          ) : (
            recentLayers.map(layer => (
              <Link 
                key={layer.id}
                to={`/layers/${layer.id}`}
                className="block hover:bg-gray-50 transition-colors"
              >
                <div className="px-4 py-3">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium text-dark">{layer.name}</p>
                      <p className="text-sm text-gray-500">Creado por: {layer.user}</p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(layer.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
          <Link to="/layers" className="text-secondary-600 hover:text-secondary-800 text-sm font-medium">
            Ver todas las capas →
          </Link>
        </div>
      </div>
      
      {/* Recent Comments */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h2 className="text-lg font-medium">Comentarios Recientes</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {recentComments.length === 0 ? (
            <p className="text-gray-500 p-4 text-center">No hay comentarios recientes</p>
          ) : (
            recentComments.map(comment => (
              <div key={comment.id} className="px-4 py-3">
                <div className="flex justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-white">
                        {comment.user.charAt(0)}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-dark">{comment.user}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          comment.role === 'specialist' 
                            ? 'bg-secondary-100 text-secondary-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {comment.role === 'specialist' ? 'Especialista' : 'Usuario'}
                        </span>
                      </div>
                      <Link to={`/layers/${comment.layerId}`} className="text-sm text-secondary-600 hover:underline">
                        Re: {comment.layerName}
                      </Link>
                      <p className="mt-1 text-gray-600">{comment.content}</p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(comment.date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard