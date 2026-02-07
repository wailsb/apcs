import { ContainerItem } from "@/lib/types";
import { mockContainers } from "@/lib/mockData";

// In-memory state for mock updates
let containers = [...mockContainers];

export const containersService = {
  getContainers: async (): Promise<ContainerItem[]> => {
    // Mock API call - in production this would fetch from backend
    await new Promise((resolve) => setTimeout(resolve, 300));
    return [...containers];
  },
  
  getContainerById: async (id: string): Promise<ContainerItem | undefined> => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return containers.find((c) => c.id === id);
  },
  
  updateContainer: async (id: string, updates: Partial<ContainerItem>): Promise<ContainerItem | undefined> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const index = containers.findIndex((c) => c.id === id);
    if (index === -1) return undefined;
    
    containers[index] = { ...containers[index], ...updates };
    return containers[index];
  },
  
  // Reset to mock data (for testing)
  reset: (): void => {
    containers = [...mockContainers];
  },
};
