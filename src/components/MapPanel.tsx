import { Map, type MapMarker } from "@/components/ui/map";

interface MapPanelProps {
  className?: string;
  markers?: MapMarker[];
  center?: [number, number];
  zoom?: number;
  height?: string;
}

/**
 * MapPanel - Interactive map visualization using MapLibre GL
 * 
 * Displays container/truck locations on an interactive map.
 * Defaults to a view of the Netherlands (Eindhoven area).
 */
export function MapPanel({ 
  className, 
  markers = [],
  center = [5.4697, 51.4416], // Eindhoven, NL
  zoom = 10,
  height = "400px"
}: MapPanelProps) {
  return (
    <div className={`map-container ${className ?? ""}`} style={{ height }}>
      <Map 
        center={center}
        zoom={zoom}
        markers={markers}
        className="w-full h-full"
      />
    </div>
  );
}
