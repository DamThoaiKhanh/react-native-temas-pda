import { WsEvent, wsEventFromJson } from "../models";

export enum WsConnectionState {
  Disconnected = "disconnected",
  Connecting = "connecting",
  Connected = "connected",
  Reconnecting = "reconnecting",
}

type EventListener = (event: WsEvent) => void;
type StateListener = (state: WsConnectionState) => void;

const HEARTBEAT_MS = 20_000;
const RECONNECT_BASE_MS = 1_000;
const RECONNECT_MAX_MS = 30_000;
const CONNECT_TIMEOUT_MS = 5_000;

class WebSocketService {
  private url: string | null = null;
  private ws: WebSocket | null = null;

  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private connectTimeoutTimer: ReturnType<typeof setTimeout> | null = null;

  private manualDisconnect = false;
  private reconnectAttempt = 0;

  private eventListeners: Set<EventListener> = new Set();
  private stateListeners: Set<StateListener> = new Set();

  private _state: WsConnectionState = WsConnectionState.Disconnected;

  // ------------------------- Public methods ----------------------------------
  configure(url: string): void {
    this.url = url;
  }

  get currentState(): WsConnectionState {
    return this._state;
  }

  // ── Subscriptions ──────────────────────────────────────────────────────────

  onEvent(listener: EventListener): () => void {
    this.eventListeners.add(listener);
    return () => this.eventListeners.delete(listener);
  }

  onState(listener: StateListener): () => void {
    this.stateListeners.add(listener);
    return () => this.stateListeners.delete(listener);
  }

  // ── Connect / Disconnect ───────────────────────────────────────────────────

  async connect(): Promise<void> {
    if (!this.url) throw new Error("URL not configured");

    this.cleanup();
    this.manualDisconnect = false;
    this.setState(WsConnectionState.Connecting);

    await new Promise<void>((resolve, reject) => {
      const ws = new WebSocket(this.url!);

      this.connectTimeoutTimer = setTimeout(() => {
        ws.close();
        reject(new Error("Connection timed out"));
      }, CONNECT_TIMEOUT_MS);

      ws.onopen = () => {
        clearTimeout(this.connectTimeoutTimer!);
        this.ws = ws;
        this.reconnectAttempt = 0;
        this.setState(WsConnectionState.Connected);
        this.startHeartbeat();
        resolve();
      };

      ws.onmessage = (e) => this.handleMessage(e.data);

      ws.onclose = () => {
        clearTimeout(this.connectTimeoutTimer!);
        if (!this.manualDisconnect) {
          this.handleDisconnect();
        }
      };

      ws.onerror = () => {
        clearTimeout(this.connectTimeoutTimer!);
        reject(new Error("WebSocket error"));
      };
    }).catch(() => this.handleDisconnect());
  }

  disconnect(): void {
    this.manualDisconnect = true;
    this.cleanup();
    this.clearReconnect();
    this.setState(WsConnectionState.Disconnected);
  }

  // Send a command with optional payload to the server
  sendCommand(command: number, data?: Record<string, any>): void {
    if (!this.ws || this._state !== WsConnectionState.Connected) return;
    try {
      const payload: any = { command };
      if (data) payload.data = data;
      this.ws.send(JSON.stringify(payload));
    } catch {
      this.handleDisconnect();
    }
  }

  // ------------------------- Private methods ----------------------------------
  private handleMessage(raw: string): void {
    try {
      const parsed = JSON.parse(raw);
      if (typeof parsed === "object" && parsed !== null) {
        const event = wsEventFromJson(parsed);
        this.eventListeners.forEach((l) => l(event));
      }
    } catch {
      // ignore invalid JSON
    }
  }

  private handleDisconnect(): void {
    this.cleanup();
    if (this.manualDisconnect) {
      this.setState(WsConnectionState.Disconnected);
      return;
    }
    this.setState(WsConnectionState.Reconnecting);
    this.scheduleReconnect();
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;
    this.reconnectAttempt++;
    const delayMs = Math.min(
      RECONNECT_BASE_MS * Math.pow(2, this.reconnectAttempt - 1),
      RECONNECT_MAX_MS,
    );
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (!this.manualDisconnect) this.connect();
    }, delayMs);
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this._state === WsConnectionState.Connected) {
        this.sendCommand(0);
      }
    }, HEARTBEAT_MS);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private clearReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private cleanup(): void {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.onmessage = null;
      this.ws.onerror = null;
      this.ws.close();
      this.ws = null;
    }
  }

  private setState(s: WsConnectionState): void {
    this._state = s;
    this.stateListeners.forEach((l) => l(s));
  }
}

// Singleton
export const wsService = new WebSocketService();
