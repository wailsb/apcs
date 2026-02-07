import { User, Role } from "@/lib/types";

// Mock users data
const mockUsers: User[] = [
  { id: "USR-001", name: "John Admin", email: "john.admin@port.com", role: "ADMIN", status: "Active", createdAt: "2025-12-01" },
  { id: "USR-002", name: "Sarah Manager", email: "sarah.manager@port.com", role: "MANAGER", status: "Active", createdAt: "2025-12-05" },
  { id: "USR-003", name: "Mike Enterprise", email: "mike@company.com", role: "ENTERPRISE", status: "Active", createdAt: "2025-12-10" },
  { id: "USR-004", name: "Jane Enterprise", email: "jane@logistics.com", role: "ENTERPRISE", status: "Active", createdAt: "2025-12-12" },
  { id: "USR-005", name: "Tom Manager", email: "tom.manager@port.com", role: "MANAGER", status: "Disabled", createdAt: "2025-11-20" },
  { id: "USR-006", name: "Lisa Admin", email: "lisa.admin@port.com", role: "ADMIN", status: "Active", createdAt: "2025-11-15" },
];

let users = [...mockUsers];

export const usersService = {
  getUsers: async (): Promise<User[]> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return [...users];
  },

  getUserById: async (id: string): Promise<User | undefined> => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return users.find((u) => u.id === id);
  },

  createUser: async (userData: Omit<User, "id" | "createdAt">): Promise<User> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const newUser: User = {
      ...userData,
      id: `USR-${String(users.length + 1).padStart(3, "0")}`,
      createdAt: new Date().toISOString().split("T")[0],
    };
    users.push(newUser);
    return newUser;
  },

  updateUser: async (id: string, updates: Partial<User>): Promise<User | undefined> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) return undefined;
    users[index] = { ...users[index], ...updates };
    return users[index];
  },

  toggleUserStatus: async (id: string): Promise<User | undefined> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) return undefined;
    users[index].status = users[index].status === "Active" ? "Disabled" : "Active";
    return users[index];
  },

  reset: (): void => {
    users = [...mockUsers];
  },
};
