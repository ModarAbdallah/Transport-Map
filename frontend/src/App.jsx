import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import polyline from '@mapbox/polyline';

const translations = {
  en: {
    title: "Transport Map",
    mapType: "Map Type",
    transport: "Transport",
    search: "Search Destination",
    noInternet: "You are offline",
    noLocation: "Please enable location",
    enableLocation: "Enable Location",
    bus: "Bus",
    taxi: "Taxi",
    showRoute: "Show Route",
    destinations: "Destinations"
  },
  ar: {
    title: "خريطة المواصلات",
    mapType: "نوع الخريطة",
    transport: "وسيلة النقل",
    search: "ابحث عن وجهة",
    noInternet: "أنت غير متصل بالإنترنت",
    noLocation: "يرجى تحديد الموقع",
    enableLocation: "تحديد الموقع",
    bus: "باص",
    taxi: "تكسي",
    showRoute: "عرض الطريق",
    destinations: "الوجهات"
  }
};

export default function App() {
  const [lang, setLang] = useState("en");
  const t = translations[lang];
  const [online, setOnline] = useState(navigator.onLine);
  const [mapType, setMapType] = useState("roadmap");
  const [transportMode, setTransportMode] = useState("Bus");
  const [userLocation, setUserLocation] = useState(null);
  const [destination, setDestination] = useState(null);
  const [stations, setStations] = useState([]);
  const [route, setRoute] = useState(null);

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
      const loc = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      };
      setUserLocation(loc);
      generateStations(loc);
    }, () => alert("Location permission denied"));
  };

  const generateStations = (center) => {
    const radius = 1000;
    const generatedStations = [];

    for (let i = 0; i < 3; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dx = (Math.random() * radius) * Math.cos(angle) / 111320;
      const dy = (Math.random() * radius) * Math.sin(angle) / 111320;
      const stationLoc = { lat: center.lat + dy, lng: center.lng + dx };

      const destinations = [
        {
          name: "Place A",
          lat: stationLoc.lat + 0.005,
          lng: stationLoc.lng + 0.005
        },
        {
          name: "Place B",
          lat: stationLoc.lat + 0.01,
          lng: stationLoc.lng + 0.01
        }
      ];

      generatedStations.push({ ...stationLoc, destinations });
    }

    setStations(generatedStations);
  };

  const handleSearch = async () => {
    const input = document.getElementById("search").value;
    if (!input) return;
    const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${input}`);
    if (res.data.length > 0) {
      const loc = res.data[0];
      const dest = {
        lat: parseFloat(loc.lat),
        lng: parseFloat(loc.lon),
      };
      setDestination(dest);
      drawRoute(userLocation, dest);
    } else {
      alert("Place not found");
    }
  };

  const drawRoute = async (from, to) => {
    try {
      const res = await axios.post("http://localhost:5000/route", {
  coordinates: [
    [from.lng, from.lat],
    [to.lng, to.lat]
  ],
  preference: "shortest",
  profile: "driving-car", // أو "foot-walking" أو "cycling-regular" حسب وسيلة النقل
  format: "geojson"
});


      const route = res.data.routes?.[0];
      if (!route || !route.geometry) {
        console.error("No route geometry found:", res.data);
        alert("No route found.");
        return;
      }

      const coords = polyline.decode(route.geometry).map(([lat, lng]) => [lat, lng]);
      setRoute(coords);
    } catch (error) {
      console.error("Routing error:", error);
      alert("Error fetching route");
    }
  };

  const drawStationRoute = async (station) => {
    const destList = station.destinations;
    if (destList.length === 0) return;

    const finalDest = destList[destList.length - 1];

    try {
      const res = await axios.post("http://localhost:5000/route", {
        coordinates: [
          [station.lng, station.lat],
          [finalDest.lng, finalDest.lat]
        ]
      });

      const routeData = res.data.routes?.[0];
      if (!routeData || !routeData.geometry) {
        console.error("No route geometry found:", res.data);
        alert("No route found from station.");
        return;
      }

      const coords = polyline.decode(routeData.geometry).map(([lat, lng]) => [lat, lng]);
      setRoute(coords);
    } catch (error) {
      console.error("Routing error:", error);
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
      <div style={headerStyle}>
        <select value={mapType} onChange={e => setMapType(e.target.value)}>
          <option value="roadmap">{t.mapType} - Road</option>
          <option value="satellite">{t.mapType} - Satellite</option>
        </select>
        <h3>{t.title}</h3>
        <select value={transportMode} onChange={e => setTransportMode(e.target.value)}>
          <option value="Bus">{t.bus}</option>
          <option value="Taxi">{t.taxi}</option>
        </select>
        <button onClick={() => setLang(lang === "en" ? "ar" : "en")}>{lang === "en" ? "AR" : "EN"}</button>
      </div>

      <div style={{ padding: 5, display: "flex" }}>
        <input id="search" placeholder={t.search} style={{ flex: 1, padding: 5 }} />
        <button onClick={handleSearch}>{t.search}</button>
      </div>

      <MapContainer center={userLocation} zoom={15} style={{ flex: 1 }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={userLocation}>
          <Popup>Me</Popup>
        </Marker>
        {destination && (
          <Marker position={destination}>
            <Popup>Destination</Popup>
          </Marker>
        )}
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

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  padding: 10,
  background: "#eee",
  alignItems: "center"
};

const offlineStyle = {
  height: "100vh",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  fontSize: 20
};
