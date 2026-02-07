import { EnterpriseOwner } from "@/lib/types";

// Mock enterprise owners data
const mockEnterpriseOwners: EnterpriseOwner[] = [
  { id: "ENT-001", companyName: "Global Logistics Inc", ownerName: "Michael Chen", email: "mchen@globallogistics.com", containersCount: 45, status: "Active", createdAt: "2025-10-15" },
  { id: "ENT-002", companyName: "Pacific Shipping Co", ownerName: "Emma Wilson", email: "ewilson@pacificship.com", containersCount: 128, status: "Active", createdAt: "2025-09-20" },
  { id: "ENT-003", companyName: "Continental Freight", ownerName: "David Brown", email: "dbrown@continental.com", containersCount: 67, status: "Active", createdAt: "2025-11-01" },
  { id: "ENT-004", companyName: "Maritime Solutions", ownerName: "Sarah Johnson", email: "sjohnson@maritime.com", containersCount: 23, status: "Disabled", createdAt: "2025-08-10" },
  { id: "ENT-005", companyName: "Express Cargo Ltd", ownerName: "Robert Lee", email: "rlee@expresscargo.com", containersCount: 89, status: "Active", createdAt: "2025-11-25" },
];

let enterpriseOwners = [...mockEnterpriseOwners];

export const enterpriseOwnersService = {
  getEnterpriseOwners: async (): Promise<EnterpriseOwner[]> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return [...enterpriseOwners];
  },

  getEnterpriseOwnerById: async (id: string): Promise<EnterpriseOwner | undefined> => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return enterpriseOwners.find((e) => e.id === id);
  },

  createEnterpriseOwner: async (data: Omit<EnterpriseOwner, "id" | "createdAt" | "containersCount">): Promise<EnterpriseOwner> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const newOwner: EnterpriseOwner = {
      ...data,
      id: `ENT-${String(enterpriseOwners.length + 1).padStart(3, "0")}`,
      containersCount: 0,
      createdAt: new Date().toISOString().split("T")[0],
    };
    enterpriseOwners.push(newOwner);
    return newOwner;
  },

  updateEnterpriseOwner: async (id: string, updates: Partial<EnterpriseOwner>): Promise<EnterpriseOwner | undefined> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const index = enterpriseOwners.findIndex((e) => e.id === id);
    if (index === -1) return undefined;
    enterpriseOwners[index] = { ...enterpriseOwners[index], ...updates };
    return enterpriseOwners[index];
  },

  reset: (): void => {
    enterpriseOwners = [...mockEnterpriseOwners];
  },
};
