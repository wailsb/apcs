import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Role } from "@/lib/types";
import dashboardIcon from "@/assets/icons/dashboard.svg";
import userIcon from "@/assets/icons/user.svg";
import adminIcon from "@/assets/icons/admin.svg";
import enterpriseIcon from "@/assets/icons/enterprise.svg";
import settingsIcon from "@/assets/icons/settings.svg";
import portlyLogo from "@/assets/logo.svg";

interface NavItem {
  label: string;
  to: string;
  icon?: string;
}

const adminNavItems: NavItem[] = [
  { label: "Dashboard", to: "/admin/dashboard", icon: dashboardIcon },
  { label: "Users", to: "/admin/users", icon: userIcon },
  { label: "Enterprise Owners", to: "/admin/enterprise-owners", icon: enterpriseIcon },
  { label: "Settings", to: "/admin/settings", icon: settingsIcon },
];

const managerNavItems: NavItem[] = [
  { label: "Scan QR", to: "/manager/scan", icon: dashboardIcon },
];

interface SidebarNavProps {
  role: Role;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function SidebarNav({ role, isCollapsed, onToggleCollapse }: SidebarNavProps) {
  const location = useLocation();
  const items = role === "ADMIN" ? adminNavItems : managerNavItems;
  const roleLabel = role === "ADMIN" ? "Admin" : "Manager";

  return (
    <div className="ml-4 my-4 flex flex-col sticky top-4 self-start z-10">
      <aside
        className={cn(
          "flex flex-col glass-round transition-all duration-300 ease-in-out",
          "h-[calc(100vh-32px)]",
          "bg-[rgba(87,106,255,0.08)] border border-[rgba(87,106,255,0.18)] backdrop-blur-[14px]",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        {/* Top area */}
        <div className={cn(
          "p-4 border-b border-border/40",
          isCollapsed ? "flex flex-col items-center" : "flex items-center justify-between"
        )}>
          <div className={cn(
            "flex items-center gap-2 transition-all duration-300",
            isCollapsed && "justify-center"
          )}>
            <img 
              src={portlyLogo} 
              alt="Portly" 
              className={cn(
                "flex-shrink-0 transition-all duration-300",
                isCollapsed ? "w-8 h-8" : "w-7 h-7"
              )} 
            />
            <span
              className={cn(
                "font-semibold text-foreground transition-all duration-300 whitespace-nowrap overflow-hidden",
                isCollapsed ? "opacity-0 w-0 hidden" : "opacity-100 text-lg"
              )}
            >
              Portly
            </span>
          </div>
          {!isCollapsed && (
            <button
              onClick={onToggleCollapse}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-secondary"
            >
              Close
            </button>
          )}
          {isCollapsed && (
            <button
              onClick={onToggleCollapse}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-secondary mt-2"
            >
              Open
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1 px-3">
            {items.map((item) => {
              const isActive = location.pathname === item.to;

              return (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      cn(
                        "relative group flex items-center rounded-xl px-3 py-3 text-sm font-medium transition-all duration-150",
                        "hover:bg-secondary/50",
                        "hover:shadow-[0_0_0_1px_hsl(231_95%_35%/0.2)]",
                        isActive && "bg-accent/10"
                      )
                    }
                  >
                    {item.icon && (
                      <img 
                        src={item.icon} 
                        alt="" 
                        className={cn(
                          "w-5 h-5 flex-shrink-0 transition-all duration-300",
                          isCollapsed ? "mx-auto" : "mr-3"
                        )}
                      />
                    )}

                    <span
                      className={cn(
                        "transition-all duration-300 whitespace-nowrap",
                        isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
                      )}
                    >
                      {item.label}
                    </span>

                    {isCollapsed && !item.icon && (
                      <span className="text-sm font-semibold mx-auto">
                        {item.label.charAt(0)}
                      </span>
                    )}

                    <span
                      className={cn(
                        "absolute left-full ml-3 z-50 px-3 py-1.5 rounded-lg",
                        "bg-foreground text-background text-sm font-medium whitespace-nowrap",
                        "opacity-0 invisible group-hover:opacity-100 group-hover:visible",
                        "transition-all duration-150 shadow-lg",
                        !isCollapsed && "hidden"
                      )}
                    >
                      {item.label}
                    </span>

                    <span
                      className={cn(
                        "absolute left-0 top-1/2 -translate-y-1/2 h-6 w-0.5 rounded-r-full bg-accent transition-opacity",
                        isActive ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom area */}
        <div className="p-4 border-t border-border/40">
          <div className={cn(
            "relative group flex items-center gap-3",
            isCollapsed && "justify-center"
          )}>
            {role === "ADMIN" && (
              <img 
                src={adminIcon} 
                alt="" 
                className="w-5 h-5 flex-shrink-0"
              />
            )}
            
            {isCollapsed && role !== "ADMIN" && (
              <span className="text-sm font-semibold text-foreground">
                {roleLabel.charAt(0)}
              </span>
            )}
            
            <div
              className={cn(
                "flex flex-col transition-all duration-300",
                isCollapsed && "opacity-0 w-0 overflow-hidden absolute"
              )}
            >
              <span className="text-xs text-muted-foreground">Signed in as</span>
              <span className="text-sm font-medium text-foreground">{roleLabel}</span>
            </div>

            <span
              className={cn(
                "absolute left-full ml-3 z-50 px-3 py-1.5 rounded-lg",
                "bg-foreground text-background text-sm font-medium whitespace-nowrap",
                "opacity-0 invisible group-hover:opacity-100 group-hover:visible",
                "transition-all duration-150 shadow-lg",
                !isCollapsed && "hidden"
              )}
            >
              {roleLabel}
            </span>
          </div>
        </div>
      </aside>
    </div>
  );
}
