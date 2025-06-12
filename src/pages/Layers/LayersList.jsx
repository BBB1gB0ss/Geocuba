import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiSearch,
  FiFilter,
  FiUpload,
  FiMap,
  FiCalendar,
  FiTrash2,
  FiEdit,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/ui/Button";
import Loading from "../../components/ui/Loading";
import Modal from "../../components/ui/Modal";
import Alert from "../../components/ui/Alert";
import { getLayers, deleteLayer } from "../../services/layerService";

// Mock data for demonstration
const MOCK_LAYERS = [
  {
    id: 1,
    name: "Mapa de Relieve Nacional",
    description:
      "Representación del relieve topográfico con detalle de elevaciones.",
    thumbnail:
      "https://images.pexels.com/photos/440731/pexels-photo-440731.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    date: "2023-11-15",
    user: "Carlos Mendoza",
    userId: 1,
    keywords: ["relieve", "topografía", "elevación"],
    format: "GeoTIFF",
  },
  {
    id: 2,
    name: "Distribución Urbana 2023",
    description: "Mapa de distribución de áreas urbanas y rurales actualizado.",
    thumbnail:
      "https://images.pexels.com/photos/417344/pexels-photo-417344.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    date: "2023-11-10",
    user: "María García",
    userId: 2,
    keywords: ["urbano", "ciudad", "rural"],
    format: "Shapefile",
  },
  {
    id: 3,
    name: "Densidad Poblacional",
    description: "Representación de la densidad poblacional por regiones.",
    thumbnail:
      "https://images.pexels.com/photos/577585/pexels-photo-577585.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    date: "2023-11-05",
    user: "José Pérez",
    userId: 3,
    keywords: ["población", "demografía", "densidad"],
    format: "GeoJSON",
  },
  {
    id: 4,
    name: "Red Hidrográfica",
    description: "Mapa completo de ríos, lagos y cuerpos de agua.",
    thumbnail:
      "https://images.pexels.com/photos/6157226/pexels-photo-6157226.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    date: "2023-10-28",
    user: "Laura Martínez",
    userId: 4,
    keywords: ["hidrografía", "ríos", "lagos"],
    format: "GeoTIFF",
  },
  {
    id: 5,
    name: "Zonas de Riesgo Sísmico",
    description: "Clasificación de zonas según su nivel de riesgo sísmico.",
    thumbnail:
      "https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    date: "2023-10-20",
    user: "Daniel Rodríguez",
    userId: 5,
    keywords: ["sismicidad", "riesgo", "geología"],
    format: "Shapefile",
  },
  {
    id: 6,
    name: "Uso de Suelos 2023",
    description:
      "Categorización detallada del uso de suelos en todo el territorio.",
    thumbnail:
      "https://images.pexels.com/photos/3609832/pexels-photo-3609832.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    date: "2023-10-15",
    user: "Ana López",
    userId: 6,
    keywords: ["suelo", "territorio", "clasificación"],
    format: "GeoJSON",
  },
];

const LayersList = () => {
  const { user } = useAuth();
  const [layers, setLayers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    format: "",
    keywords: "",
  });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [layerToDelete, setLayerToDelete] = useState(null);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    const fetchLayers = async () => {
      try {
        // In a real app, this would call the API
        // For demo purposes, we're using mock data

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setLayers(MOCK_LAYERS);
      } catch (error) {
        console.error("Error fetching layers:", error);
        setAlert({
          type: "error",
          message: "Error al cargar las capas geográficas",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLayers();
  }, []);

  // Filter and search layers
  const filteredLayers = layers.filter((layer) => {
    // Search term filter
    if (
      searchTerm &&
      !layer.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !layer.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !layer.keywords.some((keyword) =>
        keyword.toLowerCase().includes(searchTerm.toLowerCase())
      )
    ) {
      return false;
    }

    // Date from filter
    if (filters.dateFrom && new Date(layer.date) < new Date(filters.dateFrom)) {
      return false;
    }

    // Date to filter
    if (filters.dateTo && new Date(layer.date) > new Date(filters.dateTo)) {
      return false;
    }

    // Format filter
    if (filters.format && layer.format !== filters.format) {
      return false;
    }

    // Keywords filter
    if (filters.keywords) {
      const keywordArray = filters.keywords
        .toLowerCase()
        .split(",")
        .map((k) => k.trim());
      if (
        !layer.keywords.some((keyword) =>
          keywordArray.some((k) => keyword.toLowerCase().includes(k))
        )
      ) {
        return false;
      }
    }

    return true;
  });

  const handleDeleteClick = (layer) => {
    setLayerToDelete(layer);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!layerToDelete) return;

    try {
      setIsLoading(true);

      // In a real app, this would call the API
      // For demo purposes, we're just updating the state

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Remove from state
      setLayers(layers.filter((layer) => layer.id !== layerToDelete.id));

      setAlert({
        type: "success",
        message: `La capa "${layerToDelete.name}" ha sido eliminada correctamente.`,
      });
    } catch (error) {
      console.error("Error deleting layer:", error);
      setAlert({
        type: "error",
        message: "Error al eliminar la capa geográfica",
      });
    } finally {
      setIsLoading(false);
      setDeleteModalOpen(false);
      setLayerToDelete(null);
    }
  };

  const resetFilters = () => {
    setFilters({
      dateFrom: "",
      dateTo: "",
      format: "",
      keywords: "",
    });
    setSearchTerm("");
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Capas Geográficas</h1>
          <p className="text-gray-600 mt-1">
            Explora y gestiona las capas geográficas disponibles.
          </p>
        </div>

        {(user?.role === "admin" || user?.role === "specialist") && (
          <Button to="/layers/upload" variant="primary" icon={<FiUpload />}>
            Subir Nueva Capa
          </Button>
        )}
      </div>

      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="w-full md:w-1/2">
            <label
              htmlFor="search"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Buscar Capas
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="search"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="Nombre, descripción o palabras clave..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <Button
            variant="outline"
            icon={<FiFilter />}
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
          </Button>

          {(showFilters ||
            Object.values(filters).some((value) => value !== "")) && (
            <Button variant="ghost" onClick={resetFilters}>
              Limpiar Filtros
            </Button>
          )}
        </div>

        {/* Expanded filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
                <div>
                  <label
                    htmlFor="dateFrom"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Fecha Desde
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiCalendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="date"
                      id="dateFrom"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      value={filters.dateFrom}
                      onChange={(e) =>
                        setFilters({ ...filters, dateFrom: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="dateTo"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Fecha Hasta
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiCalendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="date"
                      id="dateTo"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      value={filters.dateTo}
                      onChange={(e) =>
                        setFilters({ ...filters, dateTo: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="format"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Formato
                  </label>
                  <select
                    id="format"
                    className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    value={filters.format}
                    onChange={(e) =>
                      setFilters({ ...filters, format: e.target.value })
                    }
                  >
                    <option value="">Todos los formatos</option>
                    <option value="GeoTIFF">GeoTIFF</option>
                    <option value="Shapefile">Shapefile</option>
                    <option value="GeoJSON">GeoJSON</option>
                  </select>
                </div>

                <div className="md:col-span-3">
                  <label
                    htmlFor="keywords"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Palabras Clave (separadas por coma)
                  </label>
                  <input
                    type="text"
                    id="keywords"
                    className="block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Ej: topografía, hidrografía, urbano"
                    value={filters.keywords}
                    onChange={(e) =>
                      setFilters({ ...filters, keywords: e.target.value })
                    }
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Layers Grid */}
      {filteredLayers.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <FiMap className="h-12 w-12 mx-auto text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            No se encontraron capas
          </h3>
          <p className="mt-1 text-gray-500">
            No hay capas que coincidan con los criterios de búsqueda.
          </p>
          <Button variant="outline" className="mt-4" onClick={resetFilters}>
            Limpiar Filtros
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLayers.map((layer) => (
            <motion.div
              key={layer.id}
              whileHover={{ y: -5 }}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="h-48 bg-gray-200 relative">
                <img
                  src={layer.thumbnail}
                  alt={layer.name}
                  className="h-full w-full object-cover"
                />
                <div className="absolute top-2 right-2">
                  <span className="px-2 py-1 bg-white bg-opacity-90 rounded-md text-xs font-medium">
                    {layer.format}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold">{layer.name}</h3>
                  {user?.role === "admin" && (
                    <div className="flex space-x-1">
                      <button
                        className="p-1 text-gray-500 hover:text-secondary-600"
                        onClick={() => handleDeleteClick(layer)}
                        title="Eliminar capa"
                      >
                        <FiTrash2 size={18} />
                      </button>
                      <Link
                        to={`/layers/${layer.id}/edit`}
                        className="p-1 text-gray-500 hover:text-primary-600"
                        title="Editar capa"
                      >
                        <FiEdit size={18} />
                      </Link>
                    </div>
                  )}
                </div>
                <p className="text-gray-500 text-sm mt-1">
                  {layer.description}
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {layer.keywords.map((keyword, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <div className="text-xs text-gray-500">
                    {new Date(layer.date).toLocaleDateString()}
                  </div>
                  <Button
                    to={`/layers/${layer.id}`}
                    variant="outline"
                    size="sm"
                  >
                    Ver Detalle
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirmar Eliminación"
      >
        <div className="p-4">
          <p className="mb-4">
            ¿Está seguro que desea eliminar la capa "{layerToDelete?.name}"?
            Esta acción no se puede deshacer.
          </p>
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
              loading={isLoading}
            >
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default LayersList;
