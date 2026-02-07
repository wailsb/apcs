import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TopBarProps {
  showSearch?: boolean;
  minimal?: boolean;
}

export function TopBar({ showSearch = true, minimal = false }: TopBarProps) {
  const navigate = useNavigate();
  const session = authService.getSession();
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  // Minimal mode renders just the buttons without a wrapper
  if (minimal) {
    return (
      <>
        <Button variant="outline" size="sm" className="rounded-full px-4">
          Help
        </Button>
        {session && (
          <Button
            variant="outline"
            size="sm"
            className="rounded-full px-4 text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
            onClick={handleLogout}
          >
            Logout
          </Button>
        )}
      </>
    );
  }

  return (
    <header className="h-14 glass glass-round flex items-center justify-between px-6">
      {/* Left side - empty for balance */}
      <div className="w-32" />

      {/* Center - Search */}
      {showSearch && (
        <div className="flex-1 max-w-md mx-auto">
          <Input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-full rounded-xl border-border/50 bg-background/50"
          />
        </div>
      )}

      {/* Right side - Actions */}
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" className="rounded-full px-4">
          Help
        </Button>
        {session && (
          <Button
            variant="outline"
            size="sm"
            className="rounded-full px-4 text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
            onClick={handleLogout}
          >
            Logout
          </Button>
        )}
      </div>
    </header>
  );
}
