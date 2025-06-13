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

  // File dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/tiff": [".tif", ".tiff"],
      "application/octet-stream": [".shp"],
      "application/json": [".json", ".geojson"],
    },
    maxSize: 1024 * 1024 * 500, // 500MB max
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0]);
        // Auto-detect format from file extension
        const extension = acceptedFiles[0].name.split(".").pop().toLowerCase();
        let format = "";
        if (["tif", "tiff"].includes(extension)) {
          format = "GeoTIFF";
        } else if (extension === "shp") {
          format = "Shapefile";
        } else if (["json", "geojson"].includes(extension)) {
          format = "GeoJSON";
        }
        setValue("format", format);
      }
    },
    onDropRejected: (fileRejections) => {
      const rejection = fileRejections[0];
      if (rejection.errors[0].code === "file-too-large") {
        setError(
          "El archivo es demasiado grande. El tamaño máximo permitido es 500MB."
        );
      } else {
        setError(
          "Formato de archivo no soportado. Por favor, suba un archivo GeoTIFF, Shapefile o GeoJSON."
        );
      }
    },
  });

  const onSubmit = async (data) => {
    if (!file) {
      setError("Por favor, seleccione un archivo para subir.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    // Prepara las palabras clave
    const keywordsArray = data.keywords
      .split(",")
      .map((keyword) => keyword.trim())
      .filter((keyword) => keyword.length > 0);

    // Aquí puedes subir el archivo real y obtener la URL si tienes endpoint para archivos
    // Por ahora, solo guardamos el nombre del archivo como ejemplo:
    //const file_url = file ? `/uploads/${file.name}` : null;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("owner_id", 1); // Cambia por el id del usuario logueado si lo tienes
    formData.append("palabras_clave", keywordsArray.join(", "));
    formData.append("resolucion", data.resolution);
    formData.append("updatedAt", new Date().toISOString());
    formData.append("lat", 0);
    formData.append("lng", 0);

    try {
      await api.post("/layers", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percent);
        },
      });

      setUploadProgress(100);
      setTimeout(() => {
        navigate("/layers", {
          state: {
            alert: {
              type: "success",
              message: `La capa "${data.name}" ha sido subida correctamente.`,
            },
          },
        });
      }, 1000);
    } catch (error) {
      console.error("Error uploading layer:", error);
      setError("Error al subir la capa. Por favor, inténtelo de nuevo.");
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Subir Nueva Capa Geográfica</h1>
        <p className="text-gray-600">
          Complete el formulario y suba el archivo para añadir una nueva capa al
          sistema.
        </p>
      </div>

      {error && (
        <Alert
          type="error"
          message={error}
          onClose={() => setError(null)}
          className="mb-6"
        />
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            {/* File upload dropzone */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Archivo de Capa Geográfica
              </label>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center ${
                  isDragActive
                    ? "border-primary-500 bg-primary-50"
                    : "border-gray-300 hover:border-primary-500"
                } transition-colors cursor-pointer`}
              >
                <input {...getInputProps()} />

                {file ? (
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                    <div className="flex items-center">
                      <FiFile className="h-8 w-8 text-primary-500 mr-3" />
                      <div className="text-left">
                        <p
                          className="text-sm font-medium text-gray-900 truncate"
                          title={file.name}
                        >
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile();
                      }}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <FiX className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <FiUpload className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-700">
                      Arrastre y suelte el archivo aquí, o haga clic para
                      seleccionarlo
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Formatos aceptados: GeoTIFF, Shapefile, GeoJSON
                    </p>
                    <p className="text-xs text-gray-500">
                      Tamaño máximo: 500MB
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Layer name */}
              <div className="md:col-span-2">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Nombre de la Capa
                </label>
                <input
                  id="name"
                  type="text"
                  className={`block w-full rounded-md shadow-sm ${
                    errors.name
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                  }`}
                  {...register("name", {
                    required: "El nombre es obligatorio",
                  })}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Descripción
                </label>
                <textarea
                  id="description"
                  rows="3"
                  className={`block w-full rounded-md shadow-sm ${
                    errors.description
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                  }`}
                  {...register("description", {
                    required: "La descripción es obligatoria",
                  })}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* Date */}
              <div>
                <label
                  htmlFor="date"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Fecha
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiCalendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="date"
                    type="date"
                    className={`block w-full pl-10 rounded-md shadow-sm ${
                      errors.date
                        ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                    }`}
                    {...register("date", {
                      required: "La fecha es obligatoria",
                    })}
                  />
                </div>
                {errors.date && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.date.message}
                  </p>
                )}
              </div>

              {/* Format */}
              <div>
                <label
                  htmlFor="format"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Formato
                </label>
                <select
                  id="format"
                  className={`block w-full rounded-md shadow-sm ${
                    errors.format
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                  }`}
                  {...register("format", {
                    required: "El formato es obligatorio",
                  })}
                >
                  <option value="">Seleccionar formato</option>
                  <option value="GeoTIFF">GeoTIFF</option>
                  <option value="Shapefile">Shapefile</option>
                  <option value="GeoJSON">GeoJSON</option>
                </select>
                {errors.format && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.format.message}
                  </p>
                )}
              </div>

              {/* Keywords */}
              <div className="md:col-span-2">
                <label
                  htmlFor="keywords"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Palabras Clave (separadas por coma)
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiTag className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="keywords"
                    type="text"
                    className={`block w-full pl-10 rounded-md shadow-sm ${
                      errors.keywords
                        ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                    }`}
                    placeholder="Ej: topografía, relieve, elevación"
                    {...register("keywords", {
                      required: "Las palabras clave son obligatorias",
                    })}
                  />
                </div>
                {errors.keywords && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.keywords.message}
                  </p>
                )}
              </div>

              <h3 className="text-lg font-medium text-gray-900 md:col-span-2 border-b border-gray-200 pb-2 mt-4">
                Información Técnica
              </h3>

              {/* Resolution */}
              <div>
                <label
                  htmlFor="resolution"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Resolución
                </label>
                <input
                  id="resolution"
                  type="text"
                  className="block w-full rounded-md shadow-sm border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Ej: 10m, 30m, 1km"
                  {...register("resolution")}
                />
              </div>

              {/* Projection */}
              <div>
                <label
                  htmlFor="projection"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Proyección
                </label>
                <input
                  id="projection"
                  type="text"
                  className="block w-full rounded-md shadow-sm border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Ej: UTM Zone 18S, WGS84"
                  {...register("projection")}
                />
              </div>

              {/* Source */}
              <div className="md:col-span-2">
                <label
                  htmlFor="source"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Fuente de Datos
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiInfo className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="source"
                    type="text"
                    className="block w-full pl-10 rounded-md shadow-sm border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Ej: Instituto Geográfico Nacional"
                    {...register("source")}
                  />
                </div>
              </div>
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
              disabled={isUploading}
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
