interface MapPanelProps {
  className?: string;
}

/**
 * MapPanel - Placeholder component for future MapCN integration
 * 
 * To use MapCN, install with:
 * npx shadcn@latest add https://mapcn.dev/maps/map.json
 * 
 * Then import and use the Map component from mapcn
 */
export function MapPanel({ className }: MapPanelProps) {
  return (
    <div className={className}>
      <div className="border border-border rounded-lg p-8 bg-secondary/20 flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground text-center">
          Map visualization will be available here.
          <br />
          <span className="text-sm">MapCN integration pending.</span>
        </p>
      </div>
    </div>
  );
}
