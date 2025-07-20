import { Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';

export default function StationMarker({ station, transportMode, t, drawStationRoute }) {
  const iconUrl =
    transportMode === "Bus"
      ? "https://maps.google.com/mapfiles/kml/shapes/bus.png"
      : "https://maps.google.com/mapfiles/kml/shapes/cabs.png";

  const icon = L.icon({
    iconUrl,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
  });

  return (
    <Marker position={{ lat: station.lat, lng: station.lng }} icon={icon}>
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
  );
}
