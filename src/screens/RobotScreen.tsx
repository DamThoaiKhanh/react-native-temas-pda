import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  useRobotStore,
  useNotificationStore,
  useNavStore,
  useWsStore,
  WsCommands,
  NavIndex,
} from "../stores";

import { wsService } from "../services/websocketService";
import { HeaderBar } from "@/components/common/HeaderBar";
import { getBatteryColor, getStatusColor } from "../components/utils";
import AntDesign from "@expo/vector-icons/AntDesign";
import { commonStyles } from "@/styles/commonStyles";

export default function RobotScreen() {
  const navigation = useNavigation<any>();
  const { robots, isLoading, fetchRobots } = useRobotStore();
  const { getRobotConnection, getRobotStatus, setRobotConnection } =
    useWsStore();
  const setNavIndex = useNavStore((s) => s.setIndex);
  const navIndex = useNavStore((s) => s.index);
  const previousIndex = useNavStore((s) => s.previousIndex);

  const load = async () => {
    wsService.sendCommand(WsCommands.getRobotListStatus);
    await fetchRobots();
    useRobotStore
      .getState()
      .robots.forEach((r) => setRobotConnection(r.id, r.connected));
  };

  useEffect(() => {
    if (
      navIndex === NavIndex.RobotScreen &&
      previousIndex !== NavIndex.RobotScreen
    ) {
      // console.log("Fetching robots...");
      load();
      // console.log("Fetched robots:", robots);
    }
  }, [navIndex]);
  return (
    <View style={{ flex: 1 }}>
      <HeaderBar
        title="Robots"
        onNotification={() => navigation.navigate("Notifications")}
        onSettings={() => setNavIndex(NavIndex.SettingScreen)}
      />
      {isLoading && <ActivityIndicator style={{ marginTop: 20 }} />}
      <FlatList
        data={robots}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: 10 }}
        ListEmptyComponent={
          <Text style={commonStyles.empty}>No robots available</Text>
        }
        refreshing={isLoading}
        onRefresh={load}
        renderItem={({ item }) => {
          const connected = getRobotConnection(item.id);
          const battery = getRobotStatus(item.id)?.battery ?? -1;
          return (
            <TouchableOpacity
              style={commonStyles.card}
              onPress={() =>
                navigation.navigate("RobotDetail", { robot: item })
              }
              activeOpacity={0.8}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text
                  style={{
                    fontSize: 36,
                    marginRight: 12,
                    color: connected ? "#1565C0" : "#aaa",
                  }}
                >
                  <AntDesign
                    name="robot"
                    size={24}
                    color={connected ? "#1565C0" : "#aaa"}
                  />
                </Text>
                <View style={{ flex: 1 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text style={commonStyles.title}>{item.name}</Text>
                    <View
                      style={[
                        commonStyles.badge,
                        { backgroundColor: connected ? "green" : "grey" },
                      ]}
                    >
                      <Text style={commonStyles.badgeText}>
                        {connected ? "Connected" : "Disconnected"}
                      </Text>
                    </View>
                    <Text
                      style={{
                        color: getBatteryColor(battery),
                        fontWeight: "700",
                      }}
                    >
                      🔋 {battery}%
                    </Text>
                  </View>
                  <Text style={commonStyles.cardSub}>IP: {item.ipAddress}</Text>
                  <Text style={commonStyles.cardSub}>ID: {item.id}</Text>
                  <Text style={commonStyles.cardSub}>Group: {item.group}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}
