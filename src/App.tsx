import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "@/pages/LoginPage";
import EnterprisePage from "@/pages/EnterprisePage";
import AdminDashboardPage from "@/pages/admin/AdminDashboardPage";
import AdminUsersPage from "@/pages/admin/AdminUsersPage";
import AdminEnterpriseOwnersPage from "@/pages/admin/AdminEnterpriseOwnersPage";
import AdminSettingsPage from "@/pages/admin/AdminSettingsPage";
import ManagerScanPage from "@/pages/manager/ManagerScanPage";
import { authService } from "@/services/auth.service";

const queryClient = new QueryClient();

// Protected Route Component
function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const session = authService.getSession();
  
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(session.role)) {
    switch (session.role) {
      case "ADMIN":
        return <Navigate to="/admin/dashboard" replace />;
      case "ENTERPRISE":
        return <Navigate to="/enterprise" replace />;
      case "MANAGER":
        return <Navigate to="/manager/scan" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }
  
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Enterprise Routes */}
          <Route
            path="/enterprise"
            element={
              <ProtectedRoute allowedRoles={["ENTERPRISE"]}>
                <EnterprisePage />
              </ProtectedRoute>
            }
          />
          
          {/* Admin Routes */}
          <Route
            path="/admin"
            element={<Navigate to="/admin/dashboard" replace />}
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminUsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/enterprise-owners"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminEnterpriseOwnersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminSettingsPage />
              </ProtectedRoute>
            }
          />
          
          {/* Manager Routes - Only QR Scan */}
          <Route
            path="/manager"
            element={<Navigate to="/manager/scan" replace />}
          />
          <Route
            path="/manager/scan"
            element={
              <ProtectedRoute allowedRoles={["MANAGER"]}>
                <ManagerScanPage />
              </ProtectedRoute>
            }
          />
          
          {/* Default Redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
