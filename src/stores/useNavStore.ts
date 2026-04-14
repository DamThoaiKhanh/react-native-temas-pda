import { create } from "zustand";

// Navigation screen index
export const NavIndex = {
  RequestOrderScreen: 0,
  DemandOrderScreen: 1,
  QueueOrderScreen: 2,
  RunningOrderScreen: 3,
  RecordOrderScreen: 4,
  RobotScreen: 5,
  MapScreen: 6,
  ProfileScreen: 7,
  SettingScreen: 8,
} as const;

// Bottom navigation state
// Stores the current and previous bottom nav tab.
export interface NavState {
  index: number;
  previousIndex: number;
  setIndex: (i: number) => void;
}

const useNavStore = create<NavState>((set, get) => ({
  index: 0,
  previousIndex: -1,
  setIndex(i) {
    set({ previousIndex: get().index, index: i });
  },
}));

export default useNavStore;
