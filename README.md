# PDA Handheld — React Native (Expo)

Flutter → React Native migration.
**Stack:** Expo • TypeScript • Zustand • React Navigation • AsyncStorage

---

## 📁 Project Structure

```
pda-handheld/
├── App.tsx                          # Root entry point
├── app.json                         # Expo config
├── package.json
├── tsconfig.json
└── src/
    ├── models/
    │   └── index.ts                 # All TypeScript models (User, Robot, Orders …)
    ├── services/
    │   ├── apiService.ts            # All REST API calls  ← replaces ApiService.dart
    │   ├── storageService.ts        # AsyncStorage CRUD   ← replaces StorageService.dart
    │   └── websocketService.ts      # WS + heartbeat + reconnect ← replaces WebSocketService.dart
    ├── stores/
    │   └── index.ts                 # Zustand stores      ← replaces all Provider/ViewModel .dart files
    │       ├── useAuthStore
    │       ├── useOrderStore
    │       ├── useRobotStore
    │       ├── useNotificationStore
    │       ├── useWsStore
    │       └── useNavStore
    ├── navigation/
    │   └── AppNavigator.tsx         # React Navigation stack
    ├── components/
    │   └── utils.ts                 # formatDate helper
    └── screens/
        ├── SplashScreen.tsx
        ├── LoginScreen.tsx
        ├── ServerSettingsScreen.tsx
        ├── MainShell.tsx            # Scrollable bottom tab bar
        ├── OrderScreens.tsx         # Request / Demand / Queue order screens
        ├── AllScreens.tsx           # Running / Record / Robot / Profile / Settings / Map / Notification / NewRequest
        └── index.ts
```

---

## 🚀 Quick Start

### 1. Prerequisites
```bash
node >= 18
npm >= 9
```

### 2. Install dependencies
```bash
cd pda-handheld
npm install
```

### 3. Run on device / emulator
```bash
# Android
npx expo start --android

# iOS
npx expo start --ios

# Expo Go (scan QR)
npx expo start
```

---

## 🔌 Configure Server

On first launch, tap **⚙ Server Settings** on the Login screen and enter:

| Field      | Example         |
|------------|-----------------|
| IP Address | `192.168.1.100` |
| Port       | `8088`          |

The app will connect to:
- **REST API** → `http://<IP>:<PORT>`
- **WebSocket** → `ws://<IP>:<PORT+1>` (e.g. 8089)

> You can adjust the WS port offset in `MainShell.tsx` → `initRealtime(wsUrl)`.

---

## 📦 Flutter → React Native mapping

| Flutter                        | React Native                          |
|--------------------------------|---------------------------------------|
| `Provider` + `ChangeNotifier`  | **Zustand** store                     |
| `shared_preferences`           | `@react-native-async-storage`         |
| `http` package                 | Native `fetch` API                    |
| `web_socket_channel`           | Native `WebSocket` API                |
| `get_it` (DI)                  | Singleton service modules             |
| `json_annotation`              | Plain TypeScript interfaces           |
| `intl` (DateFormat)            | Custom `formatDate()` util            |
| `Navigator.push/replace`       | `@react-navigation/native-stack`      |
| `IndexedStack`                 | Conditional `display: flex/none`      |
| `CustomPainter` (Map)          | `react-native-svg` (install below)    |
| `ScaffoldMessenger.showSnackBar`| `Alert.alert`                        |
| `showModalBottomSheet`         | `Alert.alert` (extend with ActionSheet) |

---

## 🗺 Map Screen — Full SVG (Optional)

The Map screen currently shows robot pose data as text.  
To enable the full interactive map (routes, points, robot markers):

```bash
npx expo install react-native-svg
```

Then replace the placeholder in `MapScreen` with the `SMapPainter` SVG renderer
(paths, circles, robot arrow shapes — direct translation of the Flutter CustomPainter).

---

## 🔔 WebSocket Commands

| Command | Description                  |
|---------|------------------------------|
| `0`     | Heartbeat (every 20 s)       |
| `1000`  | Auto-response robot status   |
| `1002`  | Robot connection change      |
| `1004`  | Get all robot poses (1 s poll)|
| `1006`  | Get robot status by ID       |

---

## 🔑 Auth Flow

```
SplashScreen → init() → LoginScreen
    └─ no server config → ServerSettingsScreen
    └─ login success    → MainShell (9-tab bottom nav)
```

---

## 📋 Tabs

| # | Label    | Screen                  |
|---|----------|-------------------------|
| 0 | Order    | Request Orders          |
| 1 | Demand   | Demand Orders           |
| 2 | Queue    | Queue Orders            |
| 3 | Running  | Running Orders          |
| 4 | Record   | Task Records            |
| 5 | Robot    | Robot List              |
| 6 | Map      | Live Map                |
| 7 | Profile  | User Profile + Logout   |
| 8 | Settings | App Settings            |

---

## 🛠 Extending

- **Add a new screen**: Create in `src/screens/`, add to `AppNavigator.tsx`
- **Add a store field**: Extend the Zustand store in `src/stores/index.ts`
- **Add an API call**: Add to `src/services/apiService.ts`
