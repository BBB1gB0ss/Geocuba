var mapa = L.map("contenedor_de_mapa").setView([4.65, -74.12], 11);
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png?", {}).addTo(mapa);

var marcador = L.marker([4.6281045, -74.0654527]).addTo(mapa);
marcador.bindPopup("Hola GeoCositas").openPopup();

const circulo = L.circle([4.613573, 74.063889], {
  radius: 1000,
  color: "red",
}).addTo(mapa);
circulo.bindPopup("Programación en SIG");

//Eventos
function clickSobreMapa(e) {
  console.log(e);
  var lat = e.latlng.lat;
  var lng = e.latlng.lng;
  marcador = L.marker([lat, lng]).addTo(mapa);
  marcador.bindPopup("Comentario");
}

mapa.on("click", clickSobreMapa);
