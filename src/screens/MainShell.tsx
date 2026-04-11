import { enableScreens } from "react-native-screens";
enableScreens();

import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useAuthStore, useNavStore, useWsStore } from "../stores";

import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";

import { ScreenItem } from "../components/utils";
import BottomBar from "../components/common/BottomBar";

// From OrderScreens
import RequestOrderScreen from "./RequestOrderScreen";
import DemandOrderScreen from "./DemandOrderScreen";
import QueueOrderScreen from "./QueueOrderScreen";

// From AllScreens
import RunningOrderScreen from "./RunningOrderScreen";
import RecordOrderScreen from "./RecordOrderScreen";
import RobotScreen from "./RobotScreen";
import MapScreen from "./MapScreen";
import ProfileScreen from "./ProfileScreen";
import SettingsScreen from "./SettingsScreen";

const TABS: ScreenItem[] = [
  {
    label: "Order",
    icon: <AntDesign name="file-add" size={30} />,
    Screen: RequestOrderScreen,
  }, // 0
  {
    label: "Demand",
    icon: <MaterialIcons name="pending-actions" size={30} />,
    Screen: DemandOrderScreen,
  }, // 1
  {
    label: "Queue",
    icon: <MaterialIcons name="pending" size={30} />,
    Screen: QueueOrderScreen,
  }, // 2
  {
    label: "Running",
    icon: <AntDesign name="play-circle" size={30} />,
    Screen: RunningOrderScreen,
  }, // 3
  {
    label: "Record",
    icon: <AntDesign name="history" size={30} />,
    Screen: RecordOrderScreen,
  }, // 4
  {
    label: "Robot",
    icon: <AntDesign name="robot" size={30} />,
    Screen: RobotScreen,
  }, // 5
  {
    label: "Map",
    icon: <FontAwesome name="map" size={30} />,
    Screen: MapScreen,
  }, // 6
  {
    label: "Profile",
    icon: <Ionicons name="person" size={30} />,
    Screen: ProfileScreen,
  }, // 7
  {
    label: "Settings",
    icon: <AntDesign name="setting" size={30} />,
    Screen: SettingsScreen,
  }, // 8
];

export default function MainShell() {
  const { index: selectedIndex, setIndex } = useNavStore();
  const { serverConfig } = useAuthStore();
  const { initRealtime } = useWsStore();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const wsUrl = serverConfig
      ? `ws://${serverConfig.ipAddress}:${parseInt(serverConfig.port) + 1}`
      : "ws://10.0.2.2:8089";
    initRealtime(wsUrl);
  }, []);

  return (
    <View style={{ flex: 1 }}>
      {/* Screen area - respect top safe area */}
      <View style={{ flex: 1, paddingTop: insets.top }}>
        {TABS.map(({ Screen }, i) => (
          <View
            key={i}
            style={{ flex: 1, display: i === selectedIndex ? "flex" : "none" }}
          >
            <Screen />
          </View>
        ))}
      </View>

      {/* Bottom tab bar - respect bottom safe area */}
      <BottomBar
        tabs={TABS}
        selectedIndex={selectedIndex}
        onSelect={setIndex}
        bottomInset={insets.bottom}
      />
    </View>
  );
}
