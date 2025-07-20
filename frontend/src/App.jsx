import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import polyline from '@mapbox/polyline';
import 'leaflet/dist/leaflet.css';

import Header from './components/Header';
import SearchBar from './components/SearchBar';
import RecenterMap from './components/RecenterMap';

const translations = {
  en: {
    title: "Transport map",
    search: "Search location...",
    bus: "Bus",
    taxi: "Taxi",
    showRoute: "Show Route",
    destinations: "Destinations",
    noInternet: "You are offline",
    noLocation: "Please enable location",
    enableLocation: "Enable Location",
  },
  ar: {
    title: "خريطة المواصلات",
    search: "ابحث عن موقع...",
    bus: "باص",
    taxi: "تكسي",
    showRoute: "عرض الطريق",
    destinations: "الوجهات",
    noInternet: "أنت غير متصل بالإنترنت",
    noLocation: "يرجى تحديد الموقع",
    enableLocation: "تحديد الموقع",
  }
};

export default function App() {
  const [lang, setLang] = useState("en");
  const t = translations[lang];
  const [online, setOnline] = useState(navigator.onLine);
  const [transportMode, setTransportMode] = useState("Bus");
  const [mapMenuOpen, setMapMenuOpen] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [destination, setDestination] = useState(null);
  const [stations, setStations] = useState([]);
  const [route, setRoute] = useState(null);
  const [routePref, setRoutePref] = useState("shortest");
  const [mapLayer, setMapLayer] = useState("streets");

  useEffect(() => {
    const updateOnlineStatus = () => setOnline(navigator.onLine);
    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);
    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, []);

  const locateUser = () => {
    navigator.geolocation.getCurrentPosition(pos => {
      const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      setUserLocation(loc);
      generateStations(loc);
    }, () => alert("Location permission denied"), { enableHighAccuracy: true });
  };

  const generateStations = () => {
    const fixedStations = [
      {
        lat: 35.529747,
        lng: 35.785271,
        destinations: [
          { name: "Place A", lat: 35.529747, lng: 35.785271 },
          { name: "Place B", lat: 35.539747, lng: 35.795271 }
        ]
      },
      {
        lat: 35.528500,
        lng: 35.780000,
        destinations: [
          { name: "Place C", lat: 35.530000, lng: 35.790000 },
          { name: "Place D", lat: 35.535000, lng: 35.800000 }
        ]
      },
      {
        lat: 35.531000,
        lng: 35.789000,
        destinations: [
          { name: "Place E", lat: 35.540000, lng: 35.795000 },
          { name: "Place F", lat: 35.550000, lng: 35.800000 }
        ]
      }
    ];
    setStations(fixedStations);
  };

  const handleSearch = async () => {
    const input = document.getElementById("search").value;
    if (!input) return;
    const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${input}`);
    if (res.data.length > 0) {
      const loc = res.data[0];
      const dest = { lat: parseFloat(loc.lat), lng: parseFloat(loc.lon) };
      setDestination(dest);
      drawRoute(userLocation, dest);
    } else {
      alert("Place not found");
    }
  };

  const drawRoute = async (from, to) => {
    try {
      const res = await axios.post("http://localhost:5000/route", {
        coordinates: [[from.lng, from.lat], [to.lng, to.lat]],
        preference: routePref,
        profile: "driving-car",
        format: "geojson"
      });
      const route = res.data.routes?.[0];
      if (!route || !route.geometry) return alert("No route found.");
      const coords = polyline.decode(route.geometry).map(([lat, lng]) => [lat, lng]);
      setRoute(coords);
    } catch (err) {
      alert("Error fetching route");
    }
  };

  const drawStationRoute = async (station) => {
    const destList = station.destinations;
    if (destList.length === 0) return;
    const finalDest = destList[destList.length - 1];

    try {
      const res = await axios.post("http://localhost:5000/route", {
        coordinates: [[station.lng, station.lat], [finalDest.lng, finalDest.lat]],
        preference: routePref,
        profile: "driving-car",
        format: "geojson"
      });
      const route = res.data.routes?.[0];
      if (!route || !route.geometry) return alert("No route found from station.");
      const coords = polyline.decode(route.geometry).map(([lat, lng]) => [lat, lng]);
      setRoute(coords);
    } catch {
      alert("Error fetching station route");
    }
  };

  if (!online) {
    return <div style={offlineStyle}>{t.noInternet}</div>;
  }

  if (!userLocation) {
    return (
      <div style={offlineStyle}>
        <p>{t.noLocation}</p>
        <button onClick={locateUser}>{t.enableLocation}</button>
      </div>
    );
  }

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", direction: lang === "ar" ? "rtl" : "ltr" }}>
      <Header
        lang={lang}
        setLang={setLang}
        title={t.title}
        routePref={routePref}
        setRoutePref={setRoutePref}
        mapLayer={mapLayer}
        setMapLayer={setMapLayer}
        mapMenuOpen={mapMenuOpen}
        setMapMenuOpen={setMapMenuOpen}
      />
      <SearchBar t={t} handleSearch={handleSearch} />

      <MapContainer center={userLocation} zoom={15} style={{ flex: 1 }}>
        <RecenterMap location={userLocation} />
        <TileLayer
          url={
            mapLayer === "satellite"
              ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              : mapLayer === "terrain"
              ? "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
              : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          }
        />
        <Marker position={userLocation}><Popup>Me</Popup></Marker>
        {destination && <Marker position={destination}><Popup>Destination</Popup></Marker>}
        {stations.map((station, idx) => (
          <Marker
            key={idx}
            position={{ lat: station.lat, lng: station.lng }}
            icon={L.icon({
              iconUrl: transportMode === "Bus"
                ? "https://maps.google.com/mapfiles/kml/shapes/bus.png"
                : "https://maps.google.com/mapfiles/kml/shapes/cabs.png",
              iconSize: [30, 30],
              iconAnchor: [15, 30]
            })}
          >
            <Popup>
              <div>
                <strong>{t.destinations}:</strong>
                <ul>
                  {station.destinations.map((d, i) => (
                    <li key={i}>{d.name}</li>
                  ))}
                </ul>
                <button onClick={() => drawStationRoute(station)}>{t.showRoute}</button>
              </div>
            </Popup>
          </Marker>
        ))}
        {route && <Polyline positions={route} color="blue" />}
      </MapContainer>
    </div>
  );
}

const offlineStyle = {
  height: "100vh",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  fontSize: 20
};
