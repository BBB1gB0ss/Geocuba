import React, { useState, useRef, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  LayersControl,
  GeoJSON,
} from "react-leaflet";
import { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import osm from "./osm-providers.js";
import { FiXCircle, FiCheckCircle, FiTrash2 } from "react-icons/fi";
import shp from "shpjs"; // Import shpjs para procesar shapefiles ZIP
import { getAllLayers } from "../../services/layerService"; // Asegúrate de que la ruta sea correcta a tu servicio

// Componente para manejar clicks en el mapa
function ManejadorClicksMapa({ alHacerClick }) {
  const mapa = useMapEvents({
    click: (e) => {
      alHacerClick(e.latlng);
    },
  });
  return null;
}

const MapaBasico = () => {
  const [centro] = useState([23.1136, -82.3666]); // Centro inicial del mapa (Cuba)
  const [marcadores, setMarcadores] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [comentario, setComentario] = useState("");
  const [posicionClick, setPosicionClick] = useState(null);
  const NIVEL_ZOOM = 9;
  const referenciaMapa = useRef();
  const [capas, setCapas] = useState([]); // Estado para almacenar los datos GeoJSON de todas las capas

  // Define un ícono personalizado para los marcadores (opcional)
  const customIcon = new Icon({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    shadowSize: [41, 41],
  });

  // Función para cargar todas las capas (locales y subidas) desde el backend
  const cargarShapefiles = async () => {
    try {
      const allLayers = await getAllLayers(); // Obtiene todas las capas de la base de datos
      const loadedGeoJSONs = [];

      for (const layer of allLayers) {
        if (layer.file_url) {
          try {
            const response = await fetch(layer.file_url);
            if (!response.ok) {
              console.error(
                `Error al cargar el archivo de la capa ${layer.name}: ${response.statusText}`
              );
              continue; // Saltar a la siguiente capa si hay un error
            }
            const arrayBuffer = await response.arrayBuffer();

            let geojson;
            // Comprobamos si la URL termina en .zip (para Shapefiles ZIP)
            if (layer.file_url.endsWith(".zip")) {
              // shpjs puede procesar un ArrayBuffer de un archivo ZIP que contiene shapefiles
              geojson = await shp(arrayBuffer);
            } else {
              // Asumimos que es un GeoJSON directo si no es un ZIP
              // Es importante decodificar ArrayBuffer a texto antes de JSON.parse
              geojson = JSON.parse(new TextDecoder().decode(arrayBuffer));
            }
            loadedGeoJSONs.push({
              id: layer.id,
              name: layer.name,
              data: geojson,
            });
          } catch (fileError) {
            console.error(
              `Error al procesar el archivo de la capa ${layer.name}:`,
              fileError
            );
          }
        }
      }
      setCapas(loadedGeoJSONs);
      console.log("Capas geográficas cargadas y procesadas:", loadedGeoJSONs);
    } catch (error) {
      console.error("Error al cargar las capas desde el backend:", error);
    }
  };

  // Se ejecuta solo una vez al montar el componente para cargar las capas
  useEffect(() => {
    cargarShapefiles();
  }, []);

  // Función para guardar comentario de marcador
  const guardarComentario = () => {
    if (comentario && posicionClick) {
      setMarcadores([
        ...marcadores,
        { posicion: posicionClick, comentario: comentario },
      ]);
      setMostrarModal(false);
      setComentario("");
      setPosicionClick(null);
    }
  };

  // Función para eliminar marcador
  const eliminarMarcador = (indexAEliminar) => {
    setMarcadores(marcadores.filter((_, index) => index !== indexAEliminar));
  };

  return (
    <>
      <MapContainer
        center={centro}
        zoom={NIVEL_ZOOM}
        whenCreated={(mapa) => (referenciaMapa.current = mapa)}
        style={{ height: "calc(100vh - 100px)", width: "100%" }}
      >
        <ManejadorClicksMapa alHacerClick={setPosicionClick} />

        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="OpenStreetMap">
            <TileLayer
              url={osm.maptiler.url}
              attribution={osm.maptiler.attribution}
            />
          </LayersControl.BaseLayer>
          {/* Aquí se añaden las capas dinámicamente desde el estado 'capas' */}
          {capas.map((capa) => (
            <LayersControl.Overlay key={capa.id} name={capa.name}>
              {/* Puedes personalizar el estilo de las capas GeoJSON aquí */}
              <GeoJSON
                data={capa.data}
                style={() => ({ color: "blue", weight: 2 })}
              />
            </LayersControl.Overlay>
          ))}
        </LayersControl>

        {/* Renderiza marcadores existentes */}
        {marcadores.map((marcador, index) => (
          <Marker key={index} position={marcador.posicion} icon={customIcon}>
            <Popup>
              {marcador.comentario}
              <br />
              <button
                onClick={() => eliminarMarcador(index)}
                className="text-red-500 flex items-center gap-1 mt-2"
              >
                <FiTrash2 /> Eliminar
              </button>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Modal para agregar comentario al marcador */}
      {mostrarModal && (
        <div
          className="modal-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            className="modal-content"
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "8px",
              width: "400px",
              maxHeight: "80vh",
              overflowY: "auto",
              position: "relative",
            }}
          >
            <span
              className="cerrar-modal"
              onClick={() => setMostrarModal(false)}
              style={{
                cursor: "pointer",
                position: "absolute",
                top: "10px",
                right: "15px",
                fontSize: "24px",
              }}
            >
              &times;
            </span>
            <h3 className="text-lg font-semibold mb-4">Agregar Comentario</h3>
            <textarea
              id="texto-comentario"
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              autoFocus
              placeholder="Escribe tu comentario aquí..."
              className="w-full p-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
              style={{ minHeight: "100px" }}
            />
            <div
              className="botones-modal"
              style={{
                display: "flex",
                justifyContent: "flex-end", // Alineado a la derecha
                gap: "10px", // Espacio entre botones
                marginTop: "10px",
              }}
            >
              <button
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 flex items-center gap-1"
                onClick={() => setMostrarModal(false)}
                style={{ cursor: "pointer" }}
              >
                <FiXCircle /> Cancelar
              </button>
              <button
                style={{ cursor: "pointer" }}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 flex items-center gap-1"
                onClick={guardarComentario}
              >
                <FiCheckCircle /> Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MapaBasico;
