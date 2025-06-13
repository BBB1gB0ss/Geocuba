import { NavLink } from "react-router-dom";
import { FiHome, FiMap, FiUsers, FiUpload, FiPlusCircle } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";

const Sidebar = () => {
  const { user } = useAuth();

  // Menu items based on user role
  const menuItems = [
    {
      title: "Dashboard",
      path: "/dashboard",
      icon: <FiHome size={20} />,
      roles: ["admin", "specialist", "user"],
    },
    {
      title: "Mapa",
      path: "/Map",
      icon: <FiMap size={20} />,
      roles: ["admin", "specialist", "user"],
    },
    {
      title: "Capas Geográficas",
      path: "/layers",
      icon: <FiMap size={20} />,
      roles: ["admin", "specialist", "user"],
    },
    {
      title: "Subir Nueva Capa",
      path: "/layers/upload",
      icon: <FiUpload size={20} />,
      roles: ["admin", "specialist"],
    },
    {
      title: "Gestión de Usuarios",
      path: "/users",
      icon: <FiUsers size={20} />,
      roles: ["admin"],
    },
    {
      title: "Registrar Usuario",
      path: "/register",
      icon: <FiPlusCircle size={20} />,
      roles: ["admin"],
    },
  ];

  // Filter menu items by user role
  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(user?.role || "user")
  );

  return (
    <aside className="sidebar h-full w-64 bg-white shadow-lg">
      <div className="px-4 py-6">
        <h2 className="text-xl font-bold text-dark mb-6">Navegación</h2>

        <nav className="space-y-1">
          {filteredMenuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center px-4 py-3 text-sm rounded-md transition-colors
                ${
                  isActive
                    ? "bg-primary-50 text-primary-700 font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }
              `}
            >
              <span className="mr-3">{item.icon}</span>
              <span>{item.title}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
