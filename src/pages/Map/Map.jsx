// src/components/Map.jsx
import React, { useState, useRef, useEffect } from "react"; // Eliminado useCallback
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
  const [capas, setCapas] = useState([]);

  const handleMapClick = (latlng) => {
    setPosicionClick(latlng);
    setMostrarModal(true);
  };

  const guardarComentario = () => {
    if (comentario.trim()) {
      const nuevoMarcador = {
        position: posicionClick,
        message: comentario,
      };
      setMarcadores([...marcadores, nuevoMarcador]);
      setComentario("");
      setMostrarModal(false);
    }
  };

  // Función para cargar capas desde el backend y procesar Shapefiles
  const cargarCapasDesdeBackend = async () => {
    // Eliminado useCallback
    try {
      const data = await getAllLayers(); // Obtiene las capas del backend
      console.log("Capas obtenidas del backend:", data);

      const capasProcesadas = await Promise.all(
        data.map(async (layer) => {
          if (layer.file_url && layer.file_url.endsWith(".zip")) {
            try {
              console.log(`Intentando cargar y procesar: ${layer.file_url}`);
              const response = await fetch(layer.file_url);
              if (!response.ok) {
                // Si la respuesta no es 200 OK, lanzamos un error
                const errorText = await response.text();
                throw new Error(
                  `Error HTTP ${response.status} al cargar la capa ${layer.name} (${layer.file_url}): ${errorText}`
                );
              }
              const arrayBuffer = await response.arrayBuffer(); // Obtener el ZIP como ArrayBuffer
              const geojson = await shp(arrayBuffer); // Usar shpjs para convertir
              console.log(`GeoJSON procesado para ${layer.name}:`, geojson);
              return { ...layer, geojsonData: geojson };
            } catch (error) {
              console.error(
                `Error al procesar el archivo para la capa ${layer.name} (ID: ${layer.id}):`,
                error
              );
              return { ...layer, error: true }; // Marcar capa con error
            }
          }
          return layer; // Devolver la capa como está si no es un ZIP o no tiene file_url
        })
      );
      setCapas(capasProcesadas);
    } catch (error) {
      console.error("Error al cargar las capas desde el backend:", error);
    }
  };

  useEffect(() => {
    cargarCapasDesdeBackend();
  }, []); // Dependencias vacías para que se cree una sola vez

  // Función para definir qué hacer con cada feature GeoJSON
  const onEachFeature = (feature, layer) => {
    if (feature.properties) {
      let popupContent = "<table>";
      for (const key in feature.properties) {
        // Excluye propiedades comunes que no aportan valor o son internas
        if (
          key !== "id" &&
          key !== "layer_id" &&
          feature.properties[key] !== null
        ) {
          popupContent += `<tr><td><b>${key}</b>:</td><td>${feature.properties[key]}</td></tr>`;
        }
      }
      popupContent += "</table>";

      // Abre el popup al pasar el ratón (mouseover)
      layer.on({
        mouseover: (e) => {
          layer.bindPopup(popupContent).openPopup(e.latlng);
        },
        mouseout: () => {
          layer.closePopup();
        },
      });
    }
  };

  return (
    <>
      <MapContainer
        center={centro}
        zoom={NIVEL_ZOOM}
        whenCreated={(map) => (referenciaMapa.current = map)}
        style={{ height: "100vh", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url={osm.maptiler.url}
        />
        <LayersControl position="topright">
          {/* Capas base */}
          <LayersControl.BaseLayer checked name="OpenStreetMap">
            <TileLayer
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url={osm.maptiler.url}
            />
          </LayersControl.BaseLayer>
          {/* Puedes añadir más capas base si las tienes */}

          {/* Marcadores de comentarios */}
          {marcadores.map((marcador, idx) => (
            <Marker key={idx} position={marcador.position}>
              <Popup>{marcador.message}</Popup>
            </Marker>
          ))}

          {/* Capas GeoJSON dinámicas desde el backend */}
          {capas.map((capa) => {
            if (capa.geojsonData) {
              return (
                <LayersControl.Overlay
                  key={capa.id}
                  name={capa.name}
                  // Eliminado 'checked' para no alterar la visibilidad predeterminada
                >
                  <GeoJSON
                    data={capa.geojsonData}
                    onEachFeature={onEachFeature} // <-- ¡Aquí aplicamos la función!
                  />
                </LayersControl.Overlay>
              );
            } else if (capa.error) {
              // Opcional: Mostrar un mensaje si la capa no se pudo cargar
              return (
                <LayersControl.Overlay
                  key={capa.id}
                  name={`${capa.name} (Error)`}
                >
                  <Marker position={centro}>
                    <Popup>
                      Error al cargar la capa: {capa.name}. Revisa la consola.
                    </Popup>
                  </Marker>
                </LayersControl.Overlay>
              );
            }
            return null;
          })}
        </LayersControl>

        <ManejadorClicksMapa alHacerClick={handleMapClick} />
      </MapContainer>

      {/* Modal para agregar comentarios - ESTILOS ORIGINALES RESTAURADOS */}
      {mostrarModal && (
        <div
          className="modal-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
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
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              width: "400px",
              maxWidth: "90%",
            }}
          >
            <span
              className="cerrar-modal"
              onClick={() => setMostrarModal(false)}
              style={{ cursor: "pointer" }}
            >
              &times;
            </span>
            <h3>Agregar Comentario</h3>
            <textarea
              id="texto-comentario"
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              autoFocus
              placeholder="Escribe tu comentario aquí..."
              style={{ height: "200px", width: "100%" }} // Estilos originales
            />
            <div
              className="botones-modal"
              style={{
                display: "flex",
                justifyContent: "space-between", // Estilos originales
                marginTop: "10px",
              }}
            >
              <button
                className="text-black-500 flex items-center gap-1"
                onClick={() => setMostrarModal(false)}
                style={{ cursor: "pointer", fontsize: "15px" }} // Estilos originales
              >
                <FiXCircle /> Cancelar
              </button>
              <button
                style={{ cursor: "pointer", fontsize: "15px" }} // Estilos originales
                className="text-black-500 flex items-center gap-1"
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
