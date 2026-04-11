import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ServerConfig,
  serverConfigFromJson,
  User,
  userFromJson,
  RequestOrder,
  requestOrderFromJson,
  AppNotification,
  appNotificationFromJson,
} from "../models";

const KEYS = {
  SERVER_CONFIG: "server_config",
  REMEMBER_ME: "remember_me",
  USER: "user",
  ACCOUNT: "account",
  PASSWORD: "password",
  NOTIFICATIONS: "notifications",
  REQUEST_ORDERS: (account: string) => `request_orders_${account}`,
};

// Save Server configuration to private storage
export async function saveServerConfig(
  serverConfig: ServerConfig,
): Promise<void> {
  await AsyncStorage.setItem(KEYS.SERVER_CONFIG, JSON.stringify(serverConfig));
}

// Get Server configuration from private storage
export async function getServerConfig(): Promise<ServerConfig | null> {
  const raw = await AsyncStorage.getItem(KEYS.SERVER_CONFIG);
  if (!raw) return null;
  return serverConfigFromJson(JSON.parse(raw));
}

// Remember Me
export async function setRememberMe(value: boolean): Promise<void> {
  await AsyncStorage.setItem(KEYS.REMEMBER_ME, String(value));
}

export async function getRememberMe(): Promise<boolean> {
  const raw = await AsyncStorage.getItem(KEYS.REMEMBER_ME);
  return raw === "true";
}

// Save/read/clear user credentials (account & password)
export async function saveCredentials(
  account: string,
  password: string,
): Promise<void> {
  await AsyncStorage.setItem(KEYS.ACCOUNT, account);
  await AsyncStorage.setItem(KEYS.PASSWORD, password);
}

export async function getCredentials(): Promise<{
  account: string;
  password: string;
} | null> {
  const account = await AsyncStorage.getItem(KEYS.ACCOUNT);
  const password = await AsyncStorage.getItem(KEYS.PASSWORD);
  if (!account || !password) return null;
  return { account, password };
}

export async function clearCredentials(): Promise<void> {
  await AsyncStorage.multiRemove([KEYS.ACCOUNT, KEYS.PASSWORD]);
}

// Save/read/clear user information (account, role, token)
export async function saveUser(user: User): Promise<void> {
  await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
}

export async function getUser(): Promise<User | null> {
  const raw = await AsyncStorage.getItem(KEYS.USER);
  if (!raw) return null;
  return userFromJson(JSON.parse(raw));
}

export async function clearUser(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.USER);
}

// Save/read request orders for a specific user account
export async function saveRequestOrders(
  account: string,
  orders: RequestOrder[],
): Promise<void> {
  await AsyncStorage.setItem(
    KEYS.REQUEST_ORDERS(account),
    JSON.stringify(orders),
  );
}

export async function getRequestOrders(
  account: string,
): Promise<RequestOrder[]> {
  const raw = await AsyncStorage.getItem(KEYS.REQUEST_ORDERS(account));
  if (!raw) return [];
  const parsed: any[] = JSON.parse(raw);
  return parsed.map(requestOrderFromJson);
}

// Save/read device notifications
export async function saveNotifications(
  notifications: AppNotification[],
): Promise<void> {
  await AsyncStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(notifications));
}

export async function getNotifications(): Promise<AppNotification[]> {
  const raw = await AsyncStorage.getItem(KEYS.NOTIFICATIONS);
  if (!raw) return [];
  const parsed: any[] = JSON.parse(raw);
  return parsed.map(appNotificationFromJson);
}

// Clear all stored data (for testing or logout purposes)
export async function clearAll(): Promise<void> {
  await AsyncStorage.clear();
}
