import { 
  TerminalResponse, 
  GateResponse,
  CreateTerminalRequest,
  CreateGateRequest,
  SlotConfigurationResponse,
} from "@/lib/types";
import { apiClient } from "./apiClient";

/**
 * Terminals Service
 * 
 * Interacts with the Slot Service (port 8083)
 * Endpoints: /api/terminals/*
 */
export const terminalsService = {
  /**
   * Create a new terminal
   * Calls: POST /api/terminals
   */
  createTerminal: async (request: CreateTerminalRequest): Promise<TerminalResponse> => {
    const response = await apiClient.post<TerminalResponse>("/api/terminals", request);
    return response.data;
  },

  /**
   * Get all terminals
   * Calls: GET /api/terminals
   */
  getAllTerminals: async (): Promise<TerminalResponse[]> => {
    const response = await apiClient.get<TerminalResponse[]>("/api/terminals");
    return response.data;
  },

  /**
   * Get terminal by ID
   * Calls: GET /api/terminals/{id}
   */
  getTerminalById: async (id: number): Promise<TerminalResponse> => {
    const response = await apiClient.get<TerminalResponse>(`/api/terminals/${id}`);
    return response.data;
  },

  /**
   * Get terminal by code
   * Calls: GET /api/terminals/code/{code}
   */
  getTerminalByCode: async (code: string): Promise<TerminalResponse> => {
    const response = await apiClient.get<TerminalResponse>(`/api/terminals/code/${code}`);
    return response.data;
  },

  /**
   * Add a gate to a terminal
   * Calls: POST /api/terminals/{id}/gates
   */
  addGate: async (terminalId: number, request: CreateGateRequest): Promise<GateResponse> => {
    const response = await apiClient.post<GateResponse>(
      `/api/terminals/${terminalId}/gates`, 
      request
    );
    return response.data;
  },

  /**
   * Get all gates for a terminal
   * Calls: GET /api/terminals/{id}/gates
   */
  getGatesByTerminal: async (terminalId: number): Promise<GateResponse[]> => {
    const response = await apiClient.get<GateResponse[]>(`/api/terminals/${terminalId}/gates`);
    return response.data;
  },

  /**
   * Update slot configuration for a terminal
   * Calls: PUT /api/terminals/{id}/config
   */
  updateSlotConfiguration: async (
    terminalId: number, 
    config: Partial<SlotConfigurationResponse>
  ): Promise<SlotConfigurationResponse> => {
    const response = await apiClient.put<SlotConfigurationResponse>(
      `/api/terminals/${terminalId}/config`,
      config
    );
    return response.data;
  },

  // ============ Helper Methods ============

  /**
   * Get active terminals only
   */
  getActiveTerminals: async (): Promise<TerminalResponse[]> => {
    const terminals = await terminalsService.getAllTerminals();
    return terminals.filter(t => t.active);
  },

  /**
   * Get terminal with gates loaded
   */
  getTerminalWithGates: async (id: number): Promise<TerminalResponse> => {
    const terminal = await terminalsService.getTerminalById(id);
    if (!terminal.gates) {
      terminal.gates = await terminalsService.getGatesByTerminal(id);
    }
    return terminal;
  },
};

export default terminalsService;
