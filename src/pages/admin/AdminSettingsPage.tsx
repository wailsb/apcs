import { useState, useEffect } from "react";
import { LayoutShell } from "@/components/LayoutShell";
import { PlatformSettings } from "@/lib/types";
import { settingsService } from "@/services/settings.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

const timeZones = [
  "UTC",
  "America/New_York",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Australia/Sydney",
];

const slotDurations = [
  { value: "30", label: "30 minutes" },
  { value: "60", label: "1 hour" },
  { value: "90", label: "1.5 hours" },
  { value: "120", label: "2 hours" },
];

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const data = await settingsService.getSettings();
      setSettings(data);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    setIsSaving(true);
    try {
      await settingsService.updateSettings(settings);
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 3000);
      toast({
        title: "Settings Saved",
        description: "Platform settings have been updated",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !settings) {
    return (
      <LayoutShell showSidebar={true} role="ADMIN">
        <div className="py-12 text-center text-muted-foreground">
          Loading settings...
        </div>
      </LayoutShell>
    );
  }

  return (
    <LayoutShell showSidebar={true} role="ADMIN">
      <div className="space-y-6 max-w-2xl">
        {/* Page Header */}
        <div className="glass-primary-panel p-5 section-animate">
          <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">Configure platform properties</p>
        </div>

        {/* General Settings */}
        <div className="glass-section p-6 space-y-5 section-animate">
          <h2 className="text-lg font-semibold text-foreground">General</h2>
          
          <div className="space-y-2">
            <Label htmlFor="platformName">Platform Name</Label>
            <Input
              id="platformName"
              value={settings.platformName}
              onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
              className="glass-control"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="timezone">Default Time Zone</Label>
            <Select
              value={settings.defaultTimeZone}
              onValueChange={(value) => setSettings({ ...settings, defaultTimeZone: value })}
            >
              <SelectTrigger className="glass-control">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass-strong border-[rgba(87,106,255,0.25)]">
                {timeZones.map((tz) => (
                  <SelectItem key={tz} value={tz}>
                    {tz}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Slot Configuration */}
        <div className="glass-section p-6 space-y-5 section-animate">
          <h2 className="text-lg font-semibold text-foreground">Slot Configuration</h2>
          
          <div className="space-y-2">
            <Label htmlFor="slotDuration">Slot Duration Default</Label>
            <Select
              value={String(settings.slotDurationMinutes)}
              onValueChange={(value) => setSettings({ ...settings, slotDurationMinutes: Number(value) })}
            >
              <SelectTrigger className="glass-control">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass-strong border-[rgba(87,106,255,0.25)]">
                {slotDurations.map((dur) => (
                  <SelectItem key={dur.value} value={dur.value}>
                    {dur.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="defaultCapacity">Default Capacity</Label>
            <Input
              id="defaultCapacity"
              type="number"
              min={1}
              max={100}
              value={settings.defaultCapacity}
              onChange={(e) => setSettings({ ...settings, defaultCapacity: Number(e.target.value) })}
              className="glass-control"
            />
          </div>
        </div>

        {/* Notifications */}
        <div className="glass-section p-6 space-y-5 section-animate">
          <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
          
          <div className="flex items-center justify-between py-2">
            <div>
              <Label>Notify on Booking</Label>
              <p className="text-sm text-muted-foreground">Send notification when appointment is scheduled</p>
            </div>
            <Switch
              checked={settings.notifyOnBooking}
              onCheckedChange={(checked) => setSettings({ ...settings, notifyOnBooking: checked })}
              className="glass-switch"
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <Label>Notify on Arrival</Label>
              <p className="text-sm text-muted-foreground">Send notification when container arrives</p>
            </div>
            <Switch
              checked={settings.notifyOnArrival}
              onCheckedChange={(checked) => setSettings({ ...settings, notifyOnArrival: checked })}
              className="glass-switch"
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <Label>Notify on Cancellation</Label>
              <p className="text-sm text-muted-foreground">Send notification when appointment is cancelled</p>
            </div>
            <Switch
              checked={settings.notifyOnCancellation}
              onCheckedChange={(checked) => setSettings({ ...settings, notifyOnCancellation: checked })}
              className="glass-switch"
            />
          </div>
        </div>

        {/* Maintenance */}
        <div className="glass-section p-6 section-animate">
          <h2 className="text-lg font-semibold text-foreground mb-5">Maintenance</h2>
          
          <div className="flex items-center justify-between py-2">
            <div>
              <Label>Maintenance Mode</Label>
              <p className="text-sm text-muted-foreground">Temporarily disable platform access</p>
            </div>
            <Switch
              checked={settings.maintenanceMode}
              onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
              className="glass-switch"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-4 section-animate">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
          <Button variant="glass-outline" onClick={loadSettings} disabled={isSaving}>
            Reset
          </Button>
          {showSaved && (
            <span className="text-sm text-status-arrived animate-fade-in">
              Saved
            </span>
          )}
        </div>
      </div>
    </LayoutShell>
  );
}
