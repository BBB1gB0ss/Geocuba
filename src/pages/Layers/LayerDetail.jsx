import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  FiCalendar,
  FiUser,
  FiFile,
  FiDownload,
  FiEdit,
  FiArrowLeft,
  FiMessageSquare,
  FiTrash2,
} from "react-icons/fi";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/ui/Button";
import Loading from "../../components/ui/Loading";
import Modal from "../../components/ui/Modal";
import Alert from "../../components/ui/Alert";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {
  deleteComment,
  editComment,
  getLayerById,
  deleteLayer,
  addComment,
  getLayerComments,
} from "../../services/layerService";

const LayerDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [layer, setLayer] = useState(null);
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [geojsonData, setGeojsonData] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    const fetchLayerData = async () => {
      try {
        setIsLoading(true);
        const layerData = await getLayerById(id); // Llama a la API real
        setLayer(layerData);

        // Si tienes comentarios en la API, descomenta la siguiente línea:
        const commentsData = await getLayerComments(id);
        setComments(commentsData);

        // Si no tienes comentarios en la API, puedes dejar setComments([]) o usar mocks
        //setComments([]);
      } catch (error) {
        console.error("Error fetching layer details:", error);
        setError("Error al cargar los detalles de la capa geográfica");
      } finally {
        setIsLoading(false);
      }
    };
    fetchLayerData();
  }, [id]);

  // Cargar GeoJSON
  useEffect(() => {
    if (layer && layer.file_url) {
      fetch(layer.file_url)
        .then((res) => res.json())
        .then((data) => setGeojsonData(data))
        .catch(() => setGeojsonData(null));
    }
  }, [layer]);

  const handleEditComment = async (commentId, newText) => {
    try {
      console.log(
        "Editando comentario ID:",
        commentId,
        "Nuevo texto:",
        newText
      );
      const updatedComment = await editComment(commentId, { text: newText });
      setComments(
        comments.map((c) => (c.id === commentId ? updatedComment : c))
      );
    } catch (error) {
      setError("Error al editar el comentario");
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(commentId);
      setComments(comments.filter((c) => c.id !== commentId));
    } catch (error) {
      setError("Error al eliminar el comentario");
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();

    if (!commentText.trim()) return;

    setIsSubmitting(true);

    try {
      // Llama a la API real para guardar el comentario
      const newComment = await addComment(id, {
        text: commentText,
        // Puedes agregar más campos si tu backend los requiere
      });

      setComments([newComment, ...comments]);
      setCommentText("");
    } catch (error) {
      console.error("Error adding comment:", error);
      setError("Error al añadir el comentario");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    try {
      setIsLoading(true);
      await deleteLayer(layer.id); // Llama a la API real
      navigate("/layers", {
        state: {
          alert: {
            type: "success",
            message: `La capa "${layer.name}" ha sido eliminada correctamente.`,
          },
        },
      });
    } catch (error) {
      console.error("Error deleting layer:", error);
      setError("Error al eliminar la capa geográfica");
      setDeleteModalOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (!layer) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-700">Capa no encontrada</h2>
        <p className="mt-2 text-gray-500">
          La capa que estás buscando no existe o no tienes permisos para verla.
        </p>
        <Button to="/layers" variant="primary" className="mt-4">
          Volver a la lista
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert type="error" message={error} onClose={() => setError(null)} />
      )}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button
            to="/layers"
            variant="ghost"
            icon={<FiArrowLeft />}
            aria-label="Volver"
          />
          <h1 className="text-2xl font-bold">{layer.name}</h1>
        </div>

        {user?.role === "admin" && (
          <div className="flex space-x-3">
            <Button
              variant="outline"
              icon={<FiEdit />}
              to={`/layers/${layer.id}/edit`}
            >
              Editar
            </Button>
            <Button
              variant="danger"
              icon={<FiTrash2 />}
              onClick={() => setDeleteModalOpen(true)}
            >
              Eliminar
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Layer preview */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="aspect-w-16 aspect-h-9 bg-gray-200">
              {geojsonData ? (
                <MapContainer
                  style={{ height: "400px", width: "100%" }}
                  center={[20, -75]} // Cambia el centro si lo deseas
                  zoom={5}
                  scrollWheelZoom={true}
                >
                  <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <GeoJSON data={geojsonData} />
                </MapContainer>
              ) : (
                <div className="w-full h-64 flex items-center justify-center bg-gray-100 text-gray-400">
                  No se pudo cargar el GeoJSON
                </div>
              )}
            </div>
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-3">Descripción</h2>
              <p className="text-gray-700">{layer.description}</p>

              <div className="mt-4 flex flex-wrap gap-1">
                {(
                  layer.keywords ||
                  (layer.palabras_clave ? layer.palabras_clave.split(",") : [])
                ).map((keyword, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                  >
                    {keyword.trim()}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Comments section */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h2 className="text-lg font-medium">
                Comentarios y Observaciones
              </h2>
            </div>

            {/* Comment form */}
            {user && (
              <div className="p-4 border-b border-gray-200">
                <form onSubmit={handleSubmitComment}>
                  <label
                    htmlFor="comment"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    {user.role === "specialist"
                      ? "Añadir comentario técnico"
                      : "Añadir observación general"}
                  </label>
                  <textarea
                    id="comment"
                    rows="3"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    placeholder={
                      user.role === "specialist"
                        ? "Escriba su comentario técnico..."
                        : "Escriba su observación general..."
                    }
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    required
                  />
                  <div className="mt-2 flex justify-end">
                    <Button
                      type="submit"
                      variant="primary"
                      loading={isSubmitting}
                      disabled={!commentText.trim()}
                    >
                      Publicar
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Comments list */}
            <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
              {comments.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No hay comentarios para esta capa.
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div
                          className={`h-10 w-10 rounded-full flex items-center justify-center text-white ${
                            comment.role === "specialist"
                              ? "bg-secondary-500"
                              : comment.role === "admin"
                              ? "bg-primary-500"
                              : "bg-gray-500"
                          }`}
                        >
                          {comment.author_name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium text-dark">
                            {comment.author_name}
                          </p>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              comment.author_role === "specialist"
                                ? "bg-secondary-100 text-secondary-800"
                                : comment.author_role === "admin"
                                ? "bg-primary-100 text-primary-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {comment.role === "specialist"
                              ? "Especialista"
                              : comment.role === "admin"
                              ? "Administrador"
                              : "Usuario"}
                          </span>
                        </div>
                        {/* Si está en modo edición, muestra el formulario */}
                        {editingId === comment.id ? (
                          <form
                            className="mt-2 flex gap-2"
                            onSubmit={(e) => {
                              e.preventDefault();
                              console.log(
                                "Submit edit for comment ID:",
                                comment.id
                              );
                              handleEditComment(comment.id, editText);
                              setEditingId(null);
                            }}
                          >
                            <input
                              className="flex-1 border rounded px-2 py-1"
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              autoFocus
                            />
                            <button
                              type="submit"
                              className="text-green-600 font-semibold"
                            >
                              Guardar
                            </button>
                            <button
                              type="button"
                              className="text-gray-500"
                              onClick={() => setEditingId(null)}
                            >
                              Cancelar
                            </button>
                          </form>
                        ) : (
                          <>
                            <p className="mt-1 text-gray-700">{comment.text}</p>
                            <p className="mt-1 text-xs text-gray-500">
                              {new Date(
                                layer.updatedAt || layer.created_at
                              ).toLocaleDateString()}
                            </p>
                            {/* Botones solo para el autor o admin */}
                            {user &&
                              (user.id === comment.userId ||
                                user.role === "admin") && (
                                <div className="flex gap-2 mt-1">
                                  <button
                                    className="text-red-500 text-xs flex items-center gap-1"
                                    onClick={() =>
                                      handleDeleteComment(comment.id)
                                    }
                                  >
                                    <FiTrash2 /> Eliminar
                                  </button>
                                  <button
                                    className="text-blue-500 text-xs flex items-center gap-1"
                                    onClick={() => {
                                      console.log("=== CLICK EDITAR ===");
                                      console.log("Comment object:", comment);
                                      console.log("Comment ID:", comment.id);
                                      console.log(
                                        "Comment text:",
                                        comment.text
                                      );
                                      console.log(
                                        "Type of ID:",
                                        typeof comment.id
                                      );
                                      console.log("=== FIN CLICK EDITAR ===");
                                      setEditingId(comment.id);
                                      setEditText(comment.content);
                                    }}
                                  >
                                    <FiEdit /> Editar
                                  </button>
                                </div>
                              )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Layer metadata */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h2 className="text-lg font-medium">Información de la Capa</h2>
            </div>
            <div className="p-4">
              <dl className="space-y-4">
                <div className="flex items-center">
                  <dt className="w-8 flex-shrink-0 text-gray-500">
                    <FiCalendar className="h-5 w-5" />
                  </dt>
                  <dd className="ml-2">
                    <span className="text-sm font-medium text-gray-700">
                      Fecha:
                    </span>
                    <span className="ml-2 text-sm text-gray-900">
                      {new Date(
                        layer.updatedAt || layer.created_at
                      ).toLocaleDateString()}
                    </span>
                  </dd>
                </div>

                <div className="flex items-center">
                  <dt className="w-8 flex-shrink-0 text-gray-500">
                    <FiUser className="h-5 w-5" />
                  </dt>
                  <dd className="ml-2">
                    <span className="text-sm font-medium text-gray-700">
                      Autor:
                    </span>
                    <span className="ml-2 text-sm text-gray-900">
                      {layer.owner_name || layer.owner_id || "Desconocido"}
                    </span>
                  </dd>
                </div>

                <div className="flex items-center">
                  <dt className="w-8 flex-shrink-0 text-gray-500">
                    <FiFile className="h-5 w-5" />
                  </dt>
                  <dd className="ml-2">
                    <span className="text-sm font-medium text-gray-700">
                      Formato:
                    </span>
                    <span className="ml-2 text-sm text-gray-900">
                      {layer.format ||
                        (layer.file_url
                          ? layer.file_url.split(".").pop().toUpperCase()
                          : "Desconocido")}
                    </span>
                  </dd>
                </div>

                <div className="flex items-start">
                  <dt className="w-8 flex-shrink-0 text-gray-500 pt-0.5">
                    <FiMessageSquare className="h-5 w-5" />
                  </dt>
                  <dd className="ml-2">
                    <span className="text-sm font-medium text-gray-700">
                      Comentarios:
                    </span>
                    <span className="ml-2 text-sm text-gray-900">
                      {comments.length}
                    </span>
                  </dd>
                </div>

                <div className="pt-2 mt-4 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Detalles Técnicos
                  </h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex justify-between">
                      <span className="text-gray-500">Tamaño:</span>
                      <span className="text-gray-900">
                        {layer.fileSize || "-"}
                      </span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-500">Resolución:</span>
                      <span className="text-gray-900">
                        {layer.resolution || "-"}
                      </span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-500">Proyección:</span>
                      <span className="text-gray-900">
                        {layer.projection || "-"}
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="pt-2 mt-4 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Metadatos
                  </h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex justify-between">
                      <span className="text-gray-500">Fuente:</span>
                      <span className="text-gray-900">
                        {layer.source || "-"}
                      </span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-500">Fecha de captura:</span>
                      <span className="text-gray-900">
                        {layer.dataCaptureDate || "-"}
                      </span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-500">
                        Nivel de procesamiento:
                      </span>
                      <span className="text-gray-900">
                        {layer.processingLevel || "-"}
                      </span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-500">Control de calidad:</span>
                      <span className="text-gray-900">
                        {layer.qualityControl || "-"}
                      </span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-500">Precisión:</span>
                      <span className="text-gray-900">
                        {layer.accuracy || "-"}
                      </span>
                    </li>
                  </ul>
                </div>
              </dl>

              <div className="mt-6">
                <Button
                  as="a"
                  href={layer.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="primary"
                  fullWidth
                  icon={<FiDownload />}
                >
                  Descargar Capa
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirmar Eliminación"
      >
        <div className="p-4">
          <p className="mb-4">
            ¿Está seguro que desea eliminar la capa "{layer.name}"? Esta acción
            no se puede deshacer.
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

export default LayerDetail;
