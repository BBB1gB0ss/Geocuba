import api from "../../services/api";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import {
  FiUpload,
  FiFile,
  FiX,
  FiTag,
  FiCalendar,
  FiInfo,
} from "react-icons/fi";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import Button from "../../components/ui/Button";
import Alert from "../../components/ui/Alert";

const LayerUpload = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      keywords: "",
      format: "",
      resolution: "",
      projection: "",
      source: "",
    },
  });
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [alert, setAlert] = useState(null); // Nuevo estado para las alertas

  // File dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    // Aceptar ZIP (para Shapefiles) y GeoJSON
    accept: {
      "application/zip": [".zip"], // Aceptar archivos .zip
      "application/json": [".json", ".geojson"], // Aceptar GeoJSON
      "application/x-shapefile": [".shp"], // Aunque el backend espera .zip para shapefiles, esto da una idea al usuario
      "application/vnd.google-earth.kml+xml": [".kml"], // Opcional: si quieres KML/KMZ
      "application/vnd.google-earth.kmz": [".kmz"], // Opcional: si quieres KML/KMZ
      "text/csv": [".csv"], // Opcional: si quieres CSV
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const selectedFile = acceptedFiles[0];
        setFile(selectedFile);
        setError(null); // Limpiar errores previos si se selecciona un archivo
      }
    },
  });

  const onSubmit = async (data) => {
    if (!file) {
      setError("Por favor, selecciona un archivo de capa.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);
    setAlert(null); // Limpiar alertas antes de iniciar

    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("description", data.description);
      formData.append("date", data.date);
      formData.append("keywords", data.keywords);
      formData.append("format", data.format);
      formData.append("resolution", data.resolution);
      formData.append("projection", data.projection);
      formData.append("source", data.source);
      formData.append("file", file); // Añadir el archivo aquí

      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      };

      await api.post("/layers", formData, config);
      setAlert({ message: "¡Capa subida con éxito!", type: "success" });
      setTimeout(() => navigate("/layers"), 2000); // Redirigir después de 2 segundos
    } catch (err) {
      console.error("Error al subir la capa:", err);
      // Extrae el mensaje de error de la respuesta si está disponible
      const errorMessage =
        err.response?.data?.message ||
        "Error al subir la capa. Inténtalo de nuevo.";
      setError(errorMessage);
      setAlert({ message: errorMessage, type: "error" });
    } finally {
      setIsUploading(false);
    }
  };

  const selectedFileName = file ? file.name : "Ningún archivo seleccionado";

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Subir Nueva Capa
      </h1>

      {alert && (
        <div className="mb-4">
          <Alert message={alert.message} type={alert.type} />
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Layer Details Section */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nombre de la Capa
              </label>
              <input
                type="text"
                id="name"
                {...register("name", { required: "El nombre es requerido" })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Descripción
              </label>
              <textarea
                id="description"
                {...register("description")}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              ></textarea>
            </div>

            <div>
              <label
                htmlFor="date"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Fecha
              </label>
              <input
                type="date"
                id="date"
                {...register("date")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label
                htmlFor="keywords"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Palabras Clave (separadas por comas)
              </label>
              <input
                type="text"
                id="keywords"
                {...register("keywords")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Nuevos campos de metadatos */}
            <div>
              <label
                htmlFor="format"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Formato
              </label>
              <input
                type="text"
                id="format"
                {...register("format")}
                placeholder="Ej: Shapefile, GeoJSON, KML"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* File Upload Section */}
            <div className="md:col-span-2 mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Archivo de Capa
              </label>
              <div
                {...getRootProps()}
                className={`flex justify-center items-center h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200
                  ${
                    isDragActive
                      ? "border-primary-500 bg-primary-50"
                      : "border-gray-300 bg-gray-50 hover:bg-gray-100"
                  }`}
              >
                <input {...getInputProps()} />
                <div className="text-center">
                  <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">
                    Arrastra y suelta el archivo aquí, o haz clic para
                    seleccionar
                  </p>
                  <em className="text-xs text-gray-500">
                    (Solo archivos .zip, .json, .geojson, .shp, .kml, .kmz,
                    .csv)
                  </em>
                </div>
              </div>
              {file && (
                <div className="mt-3 flex items-center justify-between text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <FiFile className="h-5 w-5 text-primary-500" />
                    <span>{selectedFileName}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      setError(null);
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FiX />
                  </button>
                </div>
              )}
              {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
            </div>
          </div>

          {/* Upload progress */}
          {isUploading && (
            <div className="px-6 pb-6">
              <div className="mb-1 flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">
                  Subiendo...
                </span>
                <span className="text-sm font-medium text-gray-700">
                  {Math.round(uploadProgress)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <motion.div
                  className="bg-primary-500 h-2.5 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          )}

          {/* Form actions */}
          <div className="bg-gray-50 px-6 py-3 flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/layers")}
              disabled={isUploading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              icon={<FiUpload />}
              loading={isUploading}
              disabled={isUploading || !file} // Deshabilitar si no hay archivo
            >
              Subir Capa
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default LayerUpload;
