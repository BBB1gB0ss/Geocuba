import { useState, useEffect } from "react";
import { FiMap, FiUsers, FiLayers, FiMessageSquare } from "react-icons/fi";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import Loading from "../../components/ui/Loading";
import { getLayers } from "../../services/layerService";
import { getUsers } from "../../services/userService";
import { getComments } from "../../services/commentService";

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
          <div
            className={`h-12 w-12 rounded-full flex items-center justify-center ${color}`}
          >
            {icon}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalLayers: 0,
    myLayers: 0,
    totalUsers: 0,
    totalComments: 0,
  });
  const [recentLayers, setRecentLayers] = useState([]);
  const [recentComments, setRecentComments] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const [layers, users, comments] = await Promise.all([
          getLayers(),
          user?.role === "admin" ? getUsers() : Promise.resolve([]),
          getComments(),
        ]);

        setStats({
          totalLayers: layers.length,
          myLayers: layers.filter((l) => l.userId === user?.id).length,
          totalUsers: users.length,
          totalComments: comments.length,
        });

        const sortedLayers = [...layers].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setRecentLayers(sortedLayers.slice(0, 3));

        const sortedComments = [...comments].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setRecentComments(sortedComments.slice(0, 3));
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (isLoading) {
    return <Loading />;
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
          icon={<FiLayers size={24} className="text-white" />}
          color="bg-secondary-500"
        />
        {user?.role === "admin" && (
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
            <p className="text-gray-500 p-4 text-center">
              No hay capas recientes
            </p>
          ) : (
            recentLayers.map((layer) => (
              <Link
                key={layer.id || layer._id}
                to={`/layers/${layer.id || layer._id}`}
                className="block hover:bg-gray-50 transition-colors"
              >
                <div className="px-4 py-3">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium text-dark">{layer.name}</p>
                      <p className="text-sm text-gray-500">
                        Creado por:{" "}
                        {layer.userName || layer.user?.name || "Desconocido"}
                      </p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(layer.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
          <Link
            to="/layers"
            className="text-secondary-600 hover:text-secondary-800 text-sm font-medium"
          >
            Ver todas las capas →
          </Link>
        </div>
      </div>

      {/* Recent Comments */}
    </div>
  );
};

export default Dashboard;
