import { useState, useEffect } from "react";
import { LayoutShell } from "@/components/LayoutShell";
import { EnterpriseOwner } from "@/lib/types";
import { enterpriseOwnersService } from "@/services/enterpriseOwners.service";
import { StatusPill } from "@/components/StatusText";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Item,
  ItemMedia,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemActions,
} from "@/components/ui/item";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

// Helper to get initials from company name
const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export default function AdminEnterpriseOwnersPage() {
  const [owners, setOwners] = useState<EnterpriseOwner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOwner, setEditingOwner] = useState<EnterpriseOwner | null>(null);
  const [formData, setFormData] = useState({
    companyName: "",
    ownerName: "",
    email: "",
    status: "" as "Active" | "Disabled" | "",
  });

  useEffect(() => {
    loadOwners();
  }, []);

  const loadOwners = async () => {
    setIsLoading(true);
    try {
      const data = await enterpriseOwnersService.getEnterpriseOwners();
      setOwners(data);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddOwner = () => {
    setEditingOwner(null);
    setFormData({ companyName: "", ownerName: "", email: "", status: "Active" });
    setIsDialogOpen(true);
  };

  const handleEditOwner = (owner: EnterpriseOwner) => {
    setEditingOwner(owner);
    setFormData({
      companyName: owner.companyName,
      ownerName: owner.ownerName,
      email: owner.email,
      status: owner.status,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.companyName || !formData.ownerName || !formData.email || !formData.status) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingOwner) {
        await enterpriseOwnersService.updateEnterpriseOwner(editingOwner.id, {
          companyName: formData.companyName,
          ownerName: formData.ownerName,
          email: formData.email,
          status: formData.status as "Active" | "Disabled",
        });
        toast({ title: "Enterprise Owner Updated", description: `${formData.companyName} has been updated` });
      } else {
        await enterpriseOwnersService.createEnterpriseOwner(formData as Omit<EnterpriseOwner, "id" | "createdAt" | "containersCount">);
        toast({ title: "Enterprise Owner Created", description: `${formData.companyName} has been added` });
      }
      setIsDialogOpen(false);
      await loadOwners();
    } catch {
      toast({
        title: "Error",
        description: "Failed to save enterprise owner",
        variant: "destructive",
      });
    }
  };

  return (
    <LayoutShell showSidebar={true} role="ADMIN">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Enterprise Owners</h1>
            <p className="text-muted-foreground">Manage enterprise accounts</p>
          </div>
          <Button onClick={handleAddOwner}>
            Add Enterprise Owner
          </Button>
        </div>

        {/* Enterprise Owners List */}
        <div className="glass-primary-panel overflow-hidden py-2">
          {isLoading ? (
            <div className="py-12 text-center text-muted-foreground">
              Loading enterprise owners...
            </div>
          ) : owners.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              No enterprise owners found.
            </div>
          ) : (
            <div>
              {owners.map((owner) => (
                <Item key={owner.id}>
                  <ItemMedia variant="avatar">
                    {getInitials(owner.companyName)}
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>{owner.companyName}</ItemTitle>
                    <ItemDescription className="flex items-center gap-2 flex-wrap">
                      <span>{owner.ownerName}</span>
                      <span className="text-border">·</span>
                      <span>{owner.email}</span>
                      <span className="text-border">·</span>
                      <span className="text-foreground font-medium">{owner.containersCount}</span>
                      <span>containers</span>
                      <span className="text-border">·</span>
                      <StatusPill status={owner.status} />
                    </ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    <button
                      onClick={() => handleEditOwner(owner)}
                      className="text-sm text-accent hover:underline font-medium"
                    >
                      Edit
                    </button>
                    <button
                      className="text-sm text-muted-foreground hover:underline font-medium"
                    >
                      View
                    </button>
                  </ItemActions>
                </Item>
              ))}
            </div>
          )}
        </div>

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="glass-strong glass-round border-[rgba(87,106,255,0.25)]">
            <DialogHeader>
              <DialogTitle>{editingOwner ? "Edit Enterprise Owner" : "Add Enterprise Owner"}</DialogTitle>
              <DialogDescription>
                {editingOwner ? "Update enterprise owner information" : "Create a new enterprise account"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="Enter company name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ownerName">Owner Name</Label>
                <Input
                  id="ownerName"
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  placeholder="Enter owner name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: "Active" | "Disabled") => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Disabled">Disabled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="glass-outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </LayoutShell>
  );
}
