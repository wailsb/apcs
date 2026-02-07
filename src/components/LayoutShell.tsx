import { ReactNode } from "react";
import { DockNav } from "./DockNav";
import { TopBar } from "./TopBar";
import { Role } from "@/lib/types";

interface LayoutShellProps {
  children: ReactNode;
  title?: string;
  showSidebar?: boolean;
  role?: Role;
}

export function LayoutShell({ children, title, role = "ADMIN" }: LayoutShellProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col pb-20">
      {/* Top Bar */}
      <div className="flex items-center justify-end px-6 pt-4 gap-3">
        <TopBar showSearch={false} minimal />
      </div>
      
      {/* Main Content */}
      <main className="flex-1 px-6 py-4 overflow-auto">
        {title && (
          <h1 className="text-2xl font-semibold mb-6">{title}</h1>
        )}
        {children}
      </main>
      
      {/* Dock Navigation */}
      <DockNav role={role} />
    </div>
  );
}
