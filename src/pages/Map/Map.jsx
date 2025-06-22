// src/components/Map.jsx

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
import shp from "shpjs";
import { getAllLayers } from "../../services/layerService";

function ManejadorClicksMapa({ alHacerClick }) {
  const mapa = useMapEvents({
    click: (e) => {
      alHacerClick(e.latlng);
    },
  });
  return null;
}

const MapaBasico = () => {
  const [centro] = useState([23.1136, -82.3666]);
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
    if (posicionClick && comentario) {
      setMarcadores([
        ...marcadores,
        { posicion: posicionClick, comentario: comentario },
      ]);
      setComentario("");
      setMostrarModal(false);
      setPosicionClick(null);
    }
  };

  const cargarCapasDesdeBackend = async () => {
    try {
      const layersFromApi = await getAllLayers();
      console.log("Capas obtenidas del backend:", layersFromApi);

      const loadedGeoJSONs = [];

      for (const layer of layersFromApi) {
        if (!layer.file_url) {
          console.warn(
            `Capa "${layer.name}" (ID: ${layer.id}) no tiene file_url. Saltando.`
          );
          continue;
        }

        try {
          console.log(
            `Intentando cargar capa: ${layer.name} de URL: ${layer.file_url}`
          );
          const response = await fetch(layer.file_url);

          if (!response.ok) {
            console.error(
              `Error al cargar la capa ${layer.name} (${layer.file_url}):`,
              response.statusText
            );
            continue;
          }

          let geojsonData = null;

          // Determinar el formato y procesar
          if (layer.file_url.endsWith(".zip") || layer.format === "Shapefile") {
            const arrayBuffer = await response.arrayBuffer();
            let shpResult = await shp(arrayBuffer); // Obtener el resultado de shpjs

            // === INICIO DE LA LÓGICA MODIFICADA PARA UNIFICAR EL ZIP ===
            if (Array.isArray(shpResult)) {
              // Si shpjs devuelve un array, combinamos todas las características en una única FeatureCollection
              const combinedFeatures = [];
              shpResult.forEach((geojsonItem) => {
                if (geojsonItem.type === "FeatureCollection") {
                  combinedFeatures.push(...geojsonItem.features);
                } else if (geojsonItem.type === "Feature") {
                  combinedFeatures.push(geojsonItem);
                }
                // Puedes añadir lógica para otros tipos GeoJSON si tus ZIPs los contuvieran
              });
              geojsonData = {
                type: "FeatureCollection",
                features: combinedFeatures,
                properties: {
                  // Añadir propiedades comunes a la colección combinada
                  layer_id: layer.id,
                  layer_name: layer.name,
                },
              };
            } else if (shpResult && shpResult.type) {
              // Si shpjs devuelve un único objeto GeoJSON (FeatureCollection o Feature)
              geojsonData = shpResult;
              // Asegurar que las propiedades se añaden
              geojsonData.properties = {
                ...(geojsonData.properties || {}),
                layer_id: layer.id,
                layer_name: layer.name,
              };
            } else {
              console.warn(
                `shpjs devolvió un formato inesperado para ${layer.name}.`
              );
              continue; // Saltar esta capa
            }
            // === FIN DE LA LÓGICA MODIFICADA PARA UNIFICAR EL ZIP ===
          } else if (
            layer.file_url.endsWith(".geojson") ||
            layer.format === "GeoJSON"
          ) {
            geojsonData = await response.json();
            geojsonData.properties = {
              ...(geojsonData.properties || {}),
              layer_id: layer.id,
              layer_name: layer.name,
            };
          } else if (layer.file_url.endsWith(".json")) {
            geojsonData = await response.json();
            geojsonData.properties = {
              ...(geojsonData.properties || {}),
              layer_id: layer.id,
              layer_name: layer.name,
            };
          } else {
            console.warn(
              `Formato de capa no soportado para ${layer.name}: ${layer.file_url}`
            );
            continue;
          }

          if (geojsonData) {
            loadedGeoJSONs.push({
              id: layer.id, // Se mantiene el ID de la capa original para la clave
              name: layer.name,
              data: geojsonData, // El objeto GeoJSON consolidado
            });
          }
        } catch (fileLoadError) {
          console.error(
            `Error al procesar el archivo para la capa ${layer.name} (ID: ${layer.id}):`,
            fileLoadError
          );
        }
      }
      setCapas(loadedGeoJSONs);
    } catch (apiError) {
      console.error("Error al obtener las capas del backend:", apiError);
    }
  };

  useEffect(() => {
    cargarCapasDesdeBackend();
  }, []);

  return (
    <>
      <MapContainer
        center={centro}
        zoom={NIVEL_ZOOM}
        whenCreated={(map) => {
          referenciaMapa.current = map;
        }}
        style={{ height: "calc(100vh - 60px)", width: "100%" }}
      >
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="OpenStreetMap">
            <TileLayer
              url={osm.maptiler.url}
              attribution={osm.maptiler.attribution}
            />
          </LayersControl.BaseLayer>

          {capas.map((capa) => (
            <LayersControl.Overlay name={capa.name} key={capa.id}>
              {capa.data && <GeoJSON data={capa.data} />}
            </LayersControl.Overlay>
          ))}

          {marcadores.map((marcador, idx) => (
            <Marker key={idx} position={marcador.posicion}>
              <Popup>{marcador.comentario}</Popup>
            </Marker>
          ))}
        </LayersControl>

        <ManejadorClicksMapa alHacerClick={handleMapClick} />
      </MapContainer>

      {mostrarModal && (
        <div
          className="modal"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            className="modal-contenido"
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "8px",
              width: "400px",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              position: "relative",
            }}
          >
            <span
              className="cerrar-modal"
              onClick={() => setMostrarModal(false)}
              style={{
                position: "absolute",
                top: "10px",
                right: "15px",
                fontSize: "24px",
                cursor: "pointer",
              }}
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
              style={{
                height: "100px", // Ajustado para ser un poco más pequeño
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ccc",
                resize: "vertical",
                marginBottom: "10px",
              }}
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
