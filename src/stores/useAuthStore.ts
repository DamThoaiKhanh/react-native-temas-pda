import { create } from "zustand";
import * as storage from "../services/storageService";
import * as api from "../services/apiService";
import { User, ServerConfig, getBaseUrl } from "../models";

// Authentication information
interface AuthState {
  user: User | null;
  serverConfig: ServerConfig | null;
  isLoading: boolean;
  error: string | null;
  rememberMe: boolean;

  init: () => Promise<void>;
  login: (account: string, password: string) => Promise<boolean>;
  validateToken: () => Promise<boolean>;
  logout: () => Promise<void>;
  setRememberMe: (value: boolean) => void;
  saveServerConfig: (ip: string, port: string) => Promise<void>;
  getSavedCredentials: () => Promise<{
    account: string;
    password: string;
  } | null>;
}

const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  serverConfig: null,
  isLoading: false,
  error: null,
  rememberMe: false,

  async init() {
    const serverConfig = await storage.getServerConfig();
    const rememberMe = await storage.getRememberMe();
    const user = await storage.getUser();
    if (serverConfig) api.setBaseUrl(getBaseUrl(serverConfig));
    if (user) api.setToken(user.token);
    set({ serverConfig, rememberMe, user });
  },

  async login(account, password) {
    const { serverConfig } = get();
    set({ isLoading: true, error: null });
    try {
      if (!serverConfig) throw new Error("Server configuration not set");
      const resp = await api.login(account, password);
      const user: User = {
        account: resp.data.userName ?? "",
        role: resp.data.roleName ?? "",
        token: resp.data.token ?? "",
      };
      api.setToken(user.token);
      await storage.saveUser(user);
      const rememberMe = get().rememberMe;
      if (rememberMe) await storage.saveCredentials(account, password);
      else await storage.clearCredentials();
      set({ user, isLoading: false });
      return true;
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
      return false;
    }
  },

  async validateToken() {
    const { user } = get();
    if (!user) return false;
    const result = await api.validateToken();
    return !!result;
  },

  async logout() {
    await storage.clearUser();
    if (!get().rememberMe) await storage.clearCredentials();
    api.setToken("");
    set({ user: null });
  },

  setRememberMe(value) {
    storage.setRememberMe(value);
    set({ rememberMe: value });
  },

  async saveServerConfig(ip, port) {
    const serverConfig: ServerConfig = { ipAddress: ip, port };
    await storage.saveServerConfig(serverConfig);
    api.setBaseUrl(getBaseUrl(serverConfig));
    set({ serverConfig });
  },

  async getSavedCredentials() {
    if (!get().rememberMe) return null;
    return storage.getCredentials();
  },
}));

export default useAuthStore;
