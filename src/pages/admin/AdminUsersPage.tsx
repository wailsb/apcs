import { useState, useEffect } from "react";
import { LayoutShell } from "@/components/LayoutShell";
import { User, Role } from "@/lib/types";
import { usersService } from "@/services/users.service";
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
import { cn } from "@/lib/utils";

// Helper to get initials from name
const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "" as Role | "",
    status: "" as "Active" | "Disabled" | "",
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await usersService.getUsers();
      setUsers(data);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setFormData({ name: "", email: "", role: "", status: "Active" });
    setIsDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    });
    setIsDialogOpen(true);
  };

  const handleToggleStatus = async (user: User) => {
    try {
      await usersService.toggleUserStatus(user.id);
      await loadUsers();
      toast({
        title: "Status Updated",
        description: `${user.name} is now ${user.status === "Active" ? "Disabled" : "Active"}`,
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.email || !formData.role || !formData.status) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingUser) {
        await usersService.updateUser(editingUser.id, formData as Omit<User, "id" | "createdAt">);
        toast({ title: "User Updated", description: `${formData.name} has been updated` });
      } else {
        await usersService.createUser(formData as Omit<User, "id" | "createdAt">);
        toast({ title: "User Created", description: `${formData.name} has been added` });
      }
      setIsDialogOpen(false);
      await loadUsers();
    } catch {
      toast({
        title: "Error",
        description: "Failed to save user",
        variant: "destructive",
      });
    }
  };

  const getRoleBadgeClass = (role: Role) => {
    switch (role) {
      case "ADMIN":
        return "glass-pill-scheduled";
      case "MANAGER":
        return "glass-pill-arrived";
      case "ENTERPRISE":
        return "bg-secondary/50 backdrop-blur-sm border border-border/30 text-foreground";
    }
  };

  return (
    <LayoutShell showSidebar={true} role="ADMIN">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Users</h1>
            <p className="text-muted-foreground">Manage platform users</p>
          </div>
          <Button onClick={handleAddUser}>
            Add User
          </Button>
        </div>

        {/* Users List */}
        <div className="glass-primary-panel overflow-hidden py-2">
          {isLoading ? (
            <div className="py-12 text-center text-muted-foreground">
              Loading users...
            </div>
          ) : users.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              No users found.
            </div>
          ) : (
            <div>
              {users.map((user) => (
                <Item key={user.id}>
                  <ItemMedia variant="avatar">
                    {getInitials(user.name)}
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>{user.name}</ItemTitle>
                    <ItemDescription className="flex items-center gap-2 flex-wrap">
                      <span>{user.email}</span>
                      <span className="text-border">·</span>
                      <span className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium",
                        getRoleBadgeClass(user.role)
                      )}>
                        {user.role}
                      </span>
                      <span className="text-border">·</span>
                      <StatusPill status={user.status} />
                    </ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    <button
                      onClick={() => handleEditUser(user)}
                      className="text-sm text-accent hover:underline font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleStatus(user)}
                      className={cn(
                        "text-sm hover:underline font-medium",
                        user.status === "Active"
                          ? "text-status-not-arrived"
                          : "text-status-arrived"
                      )}
                    >
                      {user.status === "Active" ? "Disable" : "Enable"}
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
              <DialogTitle>{editingUser ? "Edit User" : "Add User"}</DialogTitle>
              <DialogDescription>
                {editingUser ? "Update user information" : "Create a new user account"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter name"
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
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: Role) => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="MANAGER">Manager</SelectItem>
                    <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
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
