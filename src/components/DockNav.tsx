import { useRef, useState, useCallback, useEffect, type ComponentType } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Role } from "@/lib/types";
import { authService } from "@/services/auth.service";
import {
  LayoutDashboard,
  Box,
  Users,
  Building2,
  Settings,
  ScanLine,
  LogOut,
  CalendarDays,
  History,
  ClipboardList,
  type LucideProps,
} from "lucide-react";

interface DockNavItem {
  label: string;
  to: string;
  Icon: ComponentType<LucideProps>;
}

const adminNavItems: DockNavItem[] = [
  { label: "Dashboard", to: "/admin/dashboard", Icon: LayoutDashboard },
  { label: "Containers", to: "/admin/containers", Icon: Box },
  { label: "Users", to: "/admin/users", Icon: Users },
  { label: "Enterprises", to: "/admin/enterprise-owners", Icon: Building2 },
  { label: "Settings", to: "/admin/settings", Icon: Settings },
];

const managerNavItems: DockNavItem[] = [
  { label: "Scan", to: "/manager/scan", Icon: ScanLine },
];

const enterpriseNavItems: DockNavItem[] = [
  { label: "Dashboard", to: "/enterprise", Icon: LayoutDashboard },
  { label: "Bookings", to: "/enterprise/bookings", Icon: CalendarDays },
  { label: "History", to: "/enterprise/history", Icon: History },
];

function getNavItems(role: Role): DockNavItem[] {
  switch (role) {
    case "ADMIN":
      return adminNavItems;
    case "MANAGER":
    case "TERMINAL_OPERATOR":
      return managerNavItems;
    case "ENTERPRISE":
    case "CARRIER":
      return enterpriseNavItems;
    default:
      return enterpriseNavItems;
  }
}

const DOCK_CONFIG = {
  baseSize: 48,
  maxSize: 68,
  maxDistance: 140,
  springStiffness: 0.18,
};

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

function useSpringSize(target: number) {
  const [size, setSize] = useState(target);
  const currentRef = useRef(target);
  const targetRef = useRef(target);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    targetRef.current = target;
  }, [target]);

  useEffect(() => {
    const animate = () => {
      const diff = targetRef.current - currentRef.current;
      currentRef.current += diff * DOCK_CONFIG.springStiffness;

      if (Math.abs(diff) < 0.3) {
        currentRef.current = targetRef.current;
      }

      setSize(currentRef.current);
      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  return size;
}

function useTargetSize(mouseX: number | null, elRef: React.RefObject<HTMLElement | null>) {
  const [target, setTarget] = useState(DOCK_CONFIG.baseSize);

  useEffect(() => {
    if (mouseX === null || !elRef.current) {
      setTarget(DOCK_CONFIG.baseSize);
      return;
    }

    const rect = elRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const distance = Math.abs(mouseX - centerX);

    if (distance < DOCK_CONFIG.maxDistance) {
      const proximity = 1 - distance / DOCK_CONFIG.maxDistance;
      const eased = (Math.cos((1 - proximity) * Math.PI) + 1) / 2;
      setTarget(lerp(DOCK_CONFIG.baseSize, DOCK_CONFIG.maxSize, eased));
    } else {
      setTarget(DOCK_CONFIG.baseSize);
    }
  }, [mouseX, elRef]);

  return target;
}

interface DockItemProps {
  item: DockNavItem;
  mouseX: number | null;
}

function DockItem({ item, mouseX }: DockItemProps) {
  const location = useLocation();
  const isActive = location.pathname === item.to;
  const elRef = useRef<HTMLAnchorElement>(null);

  const target = useTargetSize(mouseX, elRef);
  const size = useSpringSize(target);

  const sizeRatio = (size - DOCK_CONFIG.baseSize) / (DOCK_CONFIG.maxSize - DOCK_CONFIG.baseSize);
  const iconSize = lerp(20, 28, sizeRatio);

  return (
    <div className="relative flex flex-col items-center group" style={{ width: size }}>
      <div
        className={cn(
          "absolute -top-10 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg",
          "bg-foreground text-background text-[11px] font-medium whitespace-nowrap",
          "opacity-0 group-hover:opacity-100 transition-opacity duration-150",
          "pointer-events-none shadow-lg"
        )}
      >
        {item.label}
      </div>

      <NavLink
        ref={elRef}
        to={item.to}
        className={cn(
          "flex items-center justify-center rounded-xl transition-colors duration-150",
          "hover:bg-accent/10",
          isActive
            ? "bg-accent/12 text-accent"
            : "text-muted-foreground hover:text-foreground"
        )}
        style={{ width: size, height: size }}
      >
        <item.Icon
          size={iconSize}
          strokeWidth={isActive ? 2.2 : 1.8}
        />
      </NavLink>

      {isActive && (
        <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-accent" />
      )}
    </div>
  );
}

interface LogoutDockItemProps {
  mouseX: number | null;
}

function LogoutDockItem({ mouseX }: LogoutDockItemProps) {
  const navigate = useNavigate();
  const elRef = useRef<HTMLButtonElement>(null);

  const target = useTargetSize(mouseX, elRef);
  const size = useSpringSize(target);

  const sizeRatio = (size - DOCK_CONFIG.baseSize) / (DOCK_CONFIG.maxSize - DOCK_CONFIG.baseSize);
  const iconSize = lerp(20, 28, sizeRatio);

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  return (
    <div className="relative flex flex-col items-center group" style={{ width: size }}>
      <div
        className={cn(
          "absolute -top-10 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg",
          "bg-foreground text-background text-[11px] font-medium whitespace-nowrap",
          "opacity-0 group-hover:opacity-100 transition-opacity duration-150",
          "pointer-events-none shadow-lg"
        )}
      >
        Logout
      </div>
      <button
        ref={elRef}
        onClick={handleLogout}
        className={cn(
          "flex items-center justify-center rounded-xl transition-colors duration-150",
          "text-destructive/60 hover:text-destructive hover:bg-destructive/10"
        )}
        style={{ width: size, height: size }}
      >
        <LogOut size={iconSize} strokeWidth={1.8} />
      </button>
    </div>
  );
}

interface DockNavProps {
  role: Role;
}

export function DockNav({ role }: DockNavProps) {
  const items = getNavItems(role);
  const [mouseX, setMouseX] = useState<number | null>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setMouseX(e.clientX);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMouseX(null);
  }, []);

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50">
      <div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={cn(
          "flex items-end gap-0.5 px-2.5 pb-1.5 pt-1.5",
          "bg-white/80 backdrop-blur-xl border border-border/50",
          "rounded-2xl",
          "shadow-[0_8px_32px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.04)]"
        )}
      >
        {items.map((item) => (
          <DockItem
            key={item.to}
            item={item}
            mouseX={mouseX}
          />
        ))}

        <div className="w-px h-8 bg-border/40 mx-1.5 self-center flex-shrink-0" />

        <LogoutDockItem mouseX={mouseX} />
      </div>
    </div>
  );
}
