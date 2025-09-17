import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;

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

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (points.length > 0) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [points, map]);

  return null;
}

export default function MapView({ current, pickup, dropoff, route }: MapViewProps) {
  const defaultCenter: [number, number] = current || [5.6596423,-0.0096622];

  const allPoints: [number, number][] = [];
  if (current) allPoints.push(current);
  if (pickup) allPoints.push(pickup);
  if (dropoff) allPoints.push(dropoff);
  if (route && route.length > 0) allPoints.push(...route);

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

        {route && route.length > 0 && <Polyline positions={route} color="blue" />}

        {allPoints.length > 0 && <FitBounds points={allPoints} />}
      </MapContainer>
    </div>
  );
}
