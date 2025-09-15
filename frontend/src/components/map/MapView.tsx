import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Fix leaflet's default marker icons
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

type MapViewProps = {
  current?: [number, number];
  pickup?: [number, number];
  dropoff?: [number, number];
  route?: [number, number][];
};

export default function MapView({ current, pickup, dropoff, route }: MapViewProps) {
  const defaultCenter: [number, number] = current || [37.7749, -122.4194]; // fallback: SF

  return (
    <div className="w-full h-[500px] rounded-2xl overflow-hidden shadow-md">
      <MapContainer center={defaultCenter} zoom={6} className="h-full w-full">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {current && (
          <Marker position={current}>
            <Popup>Current Location</Popup>
          </Marker>
        )}

        {pickup && (
          <Marker position={pickup}>
            <Popup>Pickup</Popup>
          </Marker>
        )}

        {dropoff && (
          <Marker position={dropoff}>
            <Popup>Dropoff</Popup>
          </Marker>
        )}

        {route && <Polyline positions={route} color="blue" />}
      </MapContainer>
    </div>
  );
}
