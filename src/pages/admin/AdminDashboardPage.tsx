import { useState, useEffect } from "react";
import { LayoutShell } from "@/components/LayoutShell";
import { KpiTile } from "@/components/KpiTile";
import { statsService, AdminStats, RecentActivity } from "@/services/stats.service";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [statsData, activityData] = await Promise.all([
        statsService.getAdminStats(),
        statsService.getRecentActivity(),
      ]);
      setStats(statsData);
      setRecentActivity(activityData);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <LayoutShell showSidebar={true} role="ADMIN">
        <div className="py-12 text-center text-muted-foreground">
          Loading dashboard...
        </div>
      </LayoutShell>
    );
  }

  return (
    <LayoutShell showSidebar={true} role="ADMIN">
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Overview of platform statistics</p>
        </div>

        {/* KPI Tiles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <KpiTile
            title="Total Enterprises"
            value={stats?.totalEnterprises ?? 0}
          />
          <KpiTile
            title="Total Managers"
            value={stats?.totalManagers ?? 0}
          />
          <KpiTile
            title="Total Containers"
            value={stats?.totalContainers ?? 0}
          />
          <KpiTile
            title="Appointments Scheduled"
            value={stats?.appointmentsScheduled ?? 0}
          />
          <KpiTile
            title="Arrived Today"
            value={stats?.arrivedCount ?? 0}
            valueClassName="text-status-arrived"
          />
          <KpiTile
            title="Not Arrived Today"
            value={stats?.notArrivedCount ?? 0}
            valueClassName="text-status-not-arrived"
          />
        </div>

        {/* Recent Activity */}
        <div className="glass-primary-panel p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h2>
          <div className="space-y-0">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex justify-between items-start py-3 border-b border-border/30 last:border-0"
              >
                <p className="text-sm text-foreground">{activity.message}</p>
                <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                  {activity.timestamp}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </LayoutShell>
  );
}
