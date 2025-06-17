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
  const [centro] = useState([23.1136, -82.3666]);
  const [marcadores, setMarcadores] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [comentario, setComentario] = useState("");
  const [posicionClick, setPosicionClick] = useState(null);
  const NIVEL_ZOOM = 9;
  const referenciaMapa = useRef();
  const [capas, setCapas] = useState([]);

  // Función para cargar shapefiles
  const cargarShapefiles = async () => {
    try {
      const capasCargadas = [];

      // Lista de tus shapefiles (deben estar en public/capas/)
      const shapefiles = [
        {
          nombre: "OBJETOS_HIDROTECNICOS_Y_DEL_TRANSPORTE_POR_AGUA",
          url: "/capas/OBJETOS_HIDROTECNICOS_Y_DEL_TRANSPORTE_POR_AGUA.zip",
        },
        {
          nombre: "VEGETACION_Y_SUELOS",
          url: "/capas/VEGETACION_Y_SUELOS.zip",
        },
        {
          nombre: "TRANSPORTE_TERRESTRE",
          url: "/capas/TRANSPORTE_TERRESTRE.zip",
        },
        { nombre: "SOCIO_CULTURAL", url: "/capas/SOCIO_CULTURAL.zip" },
        { nombre: "RELIEVE", url: "/capas/RELIEVE.zip" },
        {
          nombre: "LIMITES_Y_PROTECCIONES",
          url: "/capas/LIMITES_Y_PROTECCIONES.zip",
        },
        {
          nombre: "INDUSTRIAS_Y_SERVICIOS",
          url: "/capas/INDUSTRIAS_Y_SERVICIOS.zip",
        },
        { nombre: "HIDROGRAFIA", url: "/capas/HIDROGRAFIA.zip" },
        { nombre: "Hoja_2000", url: "/capas/Hoja_2000.zip" },
        { nombre: "Limite_Marian", url: "/capas/Limite_Marian.zip" },
      ];

      for (const shapefile of shapefiles) {
        const geojson = await shp(shapefile.url);
        capasCargadas.push({
          nombre: shapefile.nombre,
          data: geojson,
        });
      }

      setCapas(capasCargadas);
    } catch (error) {
      console.error("Error cargando shapefiles:", error);
    }
  };

  useEffect(() => {
    cargarShapefiles();
  }, []);

  const icono = new Icon({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    shadowSize: [41, 41],
    shadowAnchor: [12, 41],
  });

  const manejarClickMapa = (latlng) => {
    setPosicionClick(latlng);
    setMostrarModal(true);
  };

  const guardarComentario = () => {
    if (comentario.trim() && posicionClick) {
      const nuevoMarcador = {
        posicion: [posicionClick.lat, posicionClick.lng],
        comentario: comentario.trim(),
        id: Date.now(), // ID único simple
      };
      setMarcadores([...marcadores, nuevoMarcador]);
      setMostrarModal(false);
      setComentario("");
    }
  };

  const eliminarMarcador = (id) => {
    setMarcadores(marcadores.filter((marcador) => marcador.id !== id));
  };

  return (
    <>
      <div className="columna">
        <MapContainer
          center={centro}
          zoom={NIVEL_ZOOM}
          ref={referenciaMapa}
          style={{ height: "500px", width: "100%" }}
        >
          <TileLayer
            url={osm.maptiler.url}
            attribution={osm.maptiler.attribution}
          />

          {/* Capas de Shapefiles */}
          <LayersControl position="topright">
            {capas.map((capa, index) => (
              <LayersControl.Overlay
                key={index}
                name={capa.nombre}
                checked={true}
              >
                <GeoJSON
                  data={capa.data}
                  style={{ color: "#3388ff", weight: 2 }}
                  onEachFeature={(feature, layer) => {
                    if (feature.properties) {
                      layer.bindPopup(
                        Object.keys(feature.properties)
                          .map(
                            (key) => `<b>${key}:</b> ${feature.properties[key]}`
                          )
                          .join("<br>")
                      );
                    }
                  }}
                />
              </LayersControl.Overlay>
            ))}
          </LayersControl>

          <ManejadorClicksMapa alHacerClick={manejarClickMapa} />
          {marcadores.map((marcador) => (
            <Marker key={marcador.id} position={marcador.posicion} icon={icono}>
              <Popup>
                <div className="contenido-popup">
                  <div className="comentario-popup">{marcador.comentario}</div>
                  <div
                    className="text-red-500 text-xs flex items-center gap-1"
                    onClick={() => eliminarMarcador(marcador.id)}
                    style={{ cursor: "pointer" }}
                  >
                    <FiTrash2 /> Eliminar
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Modal */}
      {mostrarModal && (
        <div className="modal" style={{ display: "block" }}>
          <div className="contenido-modal">
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
              style={{ height: "200px", width: "100%" }}
            />
            <div
              className="botones-modal"
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "10px",
              }}
            >
              <button
                className="text-black-500 flex items-center gap-1"
                onClick={() => setMostrarModal(false)}
                style={{ cursor: "pointer", fontsize: "15px" }}
              >
                <FiXCircle /> Cancelar
              </button>
              <button
                style={{ cursor: "pointer", fontsize: "15px" }}
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
