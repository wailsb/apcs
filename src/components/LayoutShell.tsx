import { ReactNode, useState } from "react";
import { SidebarNav } from "./SidebarNav";
import { TopBar } from "./TopBar";
import { Role } from "@/lib/types";

interface LayoutShellProps {
  children: ReactNode;
  title?: string;
  showSidebar?: boolean;
  role?: Role;
}

export function LayoutShell({ children, title, showSidebar = true, role = "ADMIN" }: LayoutShellProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  if (!showSidebar) {
    // Full-width layout without sidebar (for Enterprise)
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Just buttons, no glass container */}
        <div className="flex items-center justify-end px-6 pt-4 gap-3">
          <TopBar showSearch={false} minimal />
        </div>
        <main className="flex-1 p-6">
          {title && (
            <h1 className="text-2xl font-semibold mb-6">{title}</h1>
          )}
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Floating Sidebar */}
      <SidebarNav 
        role={role} 
        isCollapsed={isCollapsed} 
        onToggleCollapse={handleToggleCollapse} 
      />
      
      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 ml-2 mr-4 my-4">
        {/* Just buttons, no glass container */}
        <div className="flex items-center justify-end px-6 py-3 gap-3">
          <TopBar showSearch={false} minimal />
        </div>
        
        {/* Main Content */}
        <main className="flex-1 p-6 glass-primary-no-shadow glass-round mt-2 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
