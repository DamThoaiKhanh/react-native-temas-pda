import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import useRobotStore from "../stores/useRobotStore";
import useWsStore, { WsCommands } from "../stores/useWsStore";
import useNavStore, { NavIndex } from "../stores/useNavStore";
import { wsService } from "../services/websocketService";
import { HeaderBar } from "@/components/common/HeaderBar";
import { getBatteryColor, getStatusColor } from "../components/utils";
import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
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
    <View style={commonStyles.container}>
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
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: connected ? "#E3F2FD" : "#F1F1F1",
                    marginRight: 12,
                  }}
                >
                  <AntDesign
                    name="robot"
                    size={24}
                    color={connected ? "#1565C0" : "#9E9E9E"}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 6,
                    }}
                  >
                    <Text style={commonStyles.title}>{item.name}</Text>

                    <View
                      style={[
                        commonStyles.badge,
                        {
                          backgroundColor: connected ? "#E8F5E9" : "#EEEEEE",
                          flexDirection: "row",
                          alignItems: "center",
                        },
                      ]}
                    >
                      <AntDesign
                        name={connected ? "check-circle" : "clock-circle"}
                        size={14}
                        color={connected ? "#2E7D32" : "#757575"}
                      />
                      <Text
                        style={[
                          commonStyles.badgeText,
                          {
                            color: connected ? "#2E7D32" : "#757575",
                            marginLeft: 6,
                          },
                        ]}
                      >
                        {connected ? "Connected" : "Disconnected"}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 4,
                    }}
                  >
                    <FontAwesome6
                      name="battery-full"
                      size={16}
                      color={getBatteryColor(battery)}
                    />
                    <Text
                      style={{
                        marginLeft: 6,
                        color: getBatteryColor(battery),
                        fontWeight: "700",
                      }}
                    >
                      {battery >= 0 ? `${battery}%` : "N/A"}
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 2,
                    }}
                  >
                    <AntDesign name="link" size={14} color="#757575" />
                    <Text style={[commonStyles.cardSub, { marginLeft: 6 }]}>
                      IP: {item.ipAddress}
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 2,
                    }}
                  >
                    <AntDesign name="tag" size={14} color="#757575" />
                    <Text style={[commonStyles.cardSub, { marginLeft: 6 }]}>
                      ID: {item.id}
                    </Text>
                  </View>

                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <AntDesign name="appstore" size={14} color="#757575" />
                    <Text style={[commonStyles.cardSub, { marginLeft: 6 }]}>
                      Group: {item.group}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}
