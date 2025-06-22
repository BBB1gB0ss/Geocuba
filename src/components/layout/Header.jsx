import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FiMenu,
  FiX,
  FiUser,
  FiLogOut,
  FiMap,
  FiHome,
  FiUsers,
} from "react-icons/fi";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import Logo from "../../assets/Logo";

const Header = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const location = useLocation();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        !e.target.closest(".user-dropdown") &&
        !e.target.closest(".user-menu")
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Get current page title
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/dashboard") return "Dashboard";
    if (path === "/layers") return "Capas Geográficas";
    if (path.includes("/layers/upload")) return "Subir Nueva Capa";
    if (path.includes("/layers/")) return "Detalle de Capa";
    if (path === "/users") return "Gestión de Usuarios";
    if (path === "/register") return "Registrar Usuario";
    return "GEODESA";
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled ? "bg-white shadow-md" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Mobile menu button */}
        <button
          className="menu-button md:hidden p-2 rounded-md text-dark focus:outline-none"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label={sidebarOpen ? "Close menu" : "Open menu"}
        >
          {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>

        {/* Logo */}
        <div className="flex items-center">
          <Link to="/dashboard" className="flex items-center">
            <Logo width={120} />
          </Link>
        </div>

        {/* Page title (mobile only) */}
        <div className="md:hidden font-bold text-lg">{getPageTitle()}</div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-6">
          <Link
            to="/dashboard"
            className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors ${
              location.pathname === "/dashboard"
                ? "bg-primary-100 text-primary-800"
                : "hover:bg-primary-50"
            }`}
          >
            <FiHome />
            <span>Menu Principal</span>
          </Link>

          <Link
            to="/layers"
            className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors ${
              location.pathname.includes("/layers")
                ? "bg-primary-100 text-primary-800"
                : "hover:bg-primary-50"
            }`}
          >
            <FiMap />
            <span>Capas</span>
          </Link>

          {user?.role === "admin" && (
            <Link
              to="/users"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors ${
                location.pathname.includes("/users")
                  ? "bg-primary-100 text-primary-800"
                  : "hover:bg-primary-50"
              }`}
            >
              <FiUsers />
              <span>Usuarios</span>
            </Link>
          )}
        </nav>

        {/* User menu */}
        <div className="relative user-menu">
          <button
            className="flex items-center space-x-2 focus:outline-none"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div className="w-8 h-8 rounded-full bg-secondary-500 text-white flex items-center justify-center">
              <FiUser />
            </div>
            <span className="hidden md:block">{user?.name}</span>
          </button>

          {/* Dropdown */}
          {showDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="user-dropdown absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50"
            >
              <div className="px-4 py-2 text-sm text-gray-500">
                <div>{user?.name}</div>
                <div className="text-xs">{user?.email}</div>
                <div className="text-xs mt-1 uppercase font-semibold text-primary-600">
                  {user?.role === "admin"
                    ? "Administrador"
                    : user?.role === "specialist"
                    ? "Especialista"
                    : "Usuario General"}
                </div>
              </div>
              <hr className="my-1" />
              <button
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                onClick={logout}
              >
                <FiLogOut className="mr-2" />
                Cerrar Sesión
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
