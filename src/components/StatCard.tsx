import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

type StatVariant = "default" | "primary" | "success" | "warning" | "danger";

interface StatCardProps {
  title: string;
  value: number;
  subtitle?: string;
  icon?: LucideIcon;
  variant?: StatVariant;
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
  delay?: number;
  className?: string;
  onClick?: () => void;
}

/**
 * AnimatedCounter - Smoothly animates from 0 to target value
 */
function AnimatedCounter({ target, delay = 0 }: { target: number; delay?: number }) {
  const [current, setCurrent] = useState(0);
  const frameRef = useRef<number>();
  const startTimeRef = useRef<number>();

  useEffect(() => {
    const duration = 1200; // ms
    
    const animationDelay = setTimeout(() => {
      startTimeRef.current = undefined;
      
      const animate = (timestamp: number) => {
        if (!startTimeRef.current) startTimeRef.current = timestamp;
        const elapsed = timestamp - startTimeRef.current;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease-out cubic)
        const eased = 1 - Math.pow(1 - progress, 3);
        setCurrent(Math.round(target * eased));
        
        if (progress < 1) {
          frameRef.current = requestAnimationFrame(animate);
        }
      };
      
      frameRef.current = requestAnimationFrame(animate);
    }, delay);
    
    return () => {
      clearTimeout(animationDelay);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [target, delay]);

  return <>{current.toLocaleString()}</>;
}

const variantStyles: Record<StatVariant, string> = {
  default: "stat-card",
  primary: "stat-card stat-card-primary",
  success: "stat-card stat-card-success",
  warning: "stat-card stat-card-warning",
  danger: "stat-card stat-card-danger",
};

const iconBgStyles: Record<StatVariant, string> = {
  default: "bg-primary/10 text-primary",
  primary: "bg-white/20 text-white",
  success: "bg-white/20 text-white",
  warning: "bg-white/20 text-white",
  danger: "bg-white/20 text-white",
};

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = "default",
  trend,
  delay = 0,
  className,
  onClick,
}: StatCardProps) {
  const isColored = variant !== "default";
  
  return (
    <div
      onClick={onClick}
      className={cn(
        variantStyles[variant],
        "section-animate",
        onClick && "cursor-pointer",
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className={cn(
            "text-sm font-medium mb-2",
            isColored ? "text-white/80" : "text-muted-foreground"
          )}>
            {title}
          </p>
          <p className="stat-value">
            <AnimatedCounter target={value} delay={delay + 200} />
          </p>
          {subtitle && (
            <p className={cn(
              "text-xs mt-1.5",
              isColored ? "text-white/70" : "text-muted-foreground"
            )}>
              {subtitle}
            </p>
          )}
          {trend && (
            <p className={cn(
              "text-xs mt-2 flex items-center gap-1",
              isColored 
                ? "text-white/80" 
                : trend.isPositive 
                  ? "text-emerald-600" 
                  : "text-rose-600"
            )}>
              <span className="font-medium">
                {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
              </span>
              <span className={cn(isColored ? "text-white/60" : "text-muted-foreground")}>
                {trend.label}
              </span>
            </p>
          )}
        </div>
        {Icon && (
          <div className={cn(
            "p-2 rounded-lg",
            iconBgStyles[variant]
          )}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * StatCardGrid - Grid layout for stat cards with proper spacing
 */
export function StatCardGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn(
      "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4",
      className
    )}>
      {children}
    </div>
  );
}
