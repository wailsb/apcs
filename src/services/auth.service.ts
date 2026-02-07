import { Role, UserSession } from "@/lib/types";

const SESSION_KEY = "port_platform_session";

export const authService = {
  login: async (username: string, password: string, role: Role): Promise<UserSession> => {
    // Mock login - in production this would call an API
    await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay
    
    const session: UserSession = {
      role,
      username,
    };
    
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  },
  
  logout: (): void => {
    localStorage.removeItem(SESSION_KEY);
  },
  
  getSession: (): UserSession | null => {
    const stored = localStorage.getItem(SESSION_KEY);
    if (!stored) return null;
    
    try {
      return JSON.parse(stored) as UserSession;
    } catch {
      return null;
    }
  },
  
  isAuthenticated: (): boolean => {
    return authService.getSession() !== null;
  },
};
