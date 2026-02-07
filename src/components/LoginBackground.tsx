import { cn } from "@/lib/utils";

interface LoginBackgroundProps {
  className?: string;
}

export function LoginBackground({ className }: LoginBackgroundProps) {
  return (
    <div className={cn("fixed inset-0 overflow-hidden", className)}>
      {/* Grid Background */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(0 0% 90% / 0.5) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(0 0% 90% / 0.5) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }}
      />
      
      {/* Floating Geometric Shapes */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Large rectangle - top left */}
        <div 
          className="absolute -top-10 -left-10 w-64 h-40 rounded-lg rotate-12 animate-float-slow"
          style={{
            backgroundColor: 'hsl(231 100% 67% / 0.04)',
            border: '1px solid hsl(231 100% 67% / 0.08)',
          }}
        />
        
        {/* Triangle - top right */}
        <div 
          className="absolute top-20 right-20 animate-float-medium"
          style={{
            width: 0,
            height: 0,
            borderLeft: '60px solid transparent',
            borderRight: '60px solid transparent',
            borderBottom: '100px solid hsl(231 100% 67% / 0.05)',
            transform: 'rotate(-15deg)',
          }}
        />
        
        {/* Small square - middle right */}
        <div 
          className="absolute top-1/3 right-1/4 w-20 h-20 rounded-md rotate-45 animate-float-fast"
          style={{
            backgroundColor: 'hsl(0 0% 0% / 0.02)',
            border: '1px solid hsl(0 0% 0% / 0.05)',
          }}
        />
        
        {/* Rounded rectangle - bottom left */}
        <div 
          className="absolute bottom-32 left-16 w-48 h-24 rounded-2xl -rotate-6 animate-float-medium"
          style={{
            backgroundColor: 'hsl(231 100% 67% / 0.03)',
            border: '1px solid hsl(231 100% 67% / 0.06)',
          }}
        />
        
        {/* Circle - bottom right */}
        <div 
          className="absolute bottom-20 right-32 w-32 h-32 rounded-full animate-float-slow"
          style={{
            backgroundColor: 'hsl(231 95% 35% / 0.03)',
            border: '1px solid hsl(231 95% 35% / 0.05)',
          }}
        />
        
        {/* Small triangle - center left */}
        <div 
          className="absolute top-1/2 left-[16%] animate-float-fast"
          style={{
            width: 0,
            height: 0,
            borderLeft: '40px solid transparent',
            borderRight: '40px solid transparent',
            borderBottom: '70px solid hsl(0 0% 0% / 0.02)',
            transform: 'rotate(25deg)',
          }}
        />
        
        {/* Elongated rectangle - top center */}
        <div 
          className="absolute top-16 left-1/3 w-80 h-12 rounded-lg rotate-3 animate-float-medium"
          style={{
            backgroundColor: 'hsl(231 100% 67% / 0.02)',
            border: '1px solid hsl(231 100% 67% / 0.04)',
          }}
        />
        
        {/* Soft rounded square - bottom center */}
        <div 
          className="absolute bottom-40 left-1/2 w-28 h-28 rounded-xl -rotate-12 animate-float-slow"
          style={{
            backgroundColor: 'hsl(0 0% 0% / 0.015)',
            border: '1px solid hsl(0 0% 0% / 0.03)',
          }}
        />
      </div>
    </div>
  );
}
