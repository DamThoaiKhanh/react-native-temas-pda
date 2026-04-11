import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  Switch,
  TextInput,
  Platform,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  useAuthStore,
  useOrderStore,
  useRobotStore,
  useNotificationStore,
  useNavStore,
  useWsStore,
} from "../../stores";
import {
  RunningOrder,
  RobotInfo,
  RobotMode,
  TaskRunningState,
  ChargingMode,
  AppNotification,
  RequestOrder,
} from "../../models";
import { WsCommands } from "../../stores";
import { getBatteryColor } from "@/components/utils";
import { DetailCard } from "@/components/common/DetailCard";
import { DetailRow } from "@/components/common/DetailRow";
import { StatusHighlight } from "@/components/common/StatusHighlight";
import { commonStyles } from "@/styles/commonStyles";

export default function RobotDetailScreen() {
  const route = useRoute<any>();
  const robot: RobotInfo = route.params.robot;
  const { getRobotStatus, getRobotConnection, sendCommand } = useWsStore();
  const { isLoading } = useRobotStore();

  const timerRef = useRef<any>(null);

  useEffect(() => {
    sendCommand(WsCommands.getRobotStatusById, { robotId: robot.id });
    timerRef.current = setInterval(
      () => sendCommand(WsCommands.getRobotStatusById, { robotId: robot.id }),
      1000,
    );
    return () => clearInterval(timerRef.current);
  }, []);

  const rs = getRobotStatus(robot.id) ?? {
    battery: 0,
    mode: RobotMode.manual,
    emergency: false,
    taskState: TaskRunningState.stopped,
    chargingMode: ChargingMode.free,
    x: 0,
    y: 0,
    theta: 0,
    confidence: 0,
    currentTask: "",
    currentTaskId: "",
    online: false,
    voltage: 0,
    current: 0,
    status: "Offline",
    id: robot.id,
    ipAddress: robot.ipAddress,
  };
  const connected = getRobotConnection(robot.id);

  const radToDeg = (r: number) => ((r * 180) / Math.PI).toFixed(1);

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      {/* Status highlights */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <StatusHighlight
          label="CONNECTION"
          icon={connected ? "📶" : "❌"}
          active={connected}
        />
        <StatusHighlight
          label="AUTO MODE"
          icon="🔄"
          active={rs.mode === RobotMode.auto}
        />
        <StatusHighlight
          label="EMERGENCY"
          icon={rs.emergency ? "🔒" : "🔓"}
          active={rs.emergency}
          activeColor="red"
        />
      </View>

      <DetailCard title="Basic Information">
        <DetailRow label="Name" value={robot.name} />
        <DetailRow label="ID" value={robot.id} />
        <DetailRow label="Group" value={robot.group} />
        <DetailRow label="IP Address" value={robot.ipAddress} />
        <DetailRow label="MAC" value={robot.mac} />
      </DetailCard>

      <DetailCard title="Localization">
        <DetailRow label="Position X" value={`${rs.x?.toFixed(3)} m`} />
        <DetailRow label="Position Y" value={`${rs.y?.toFixed(3)} m`} />
        <DetailRow
          label="Orientation"
          value={`${radToDeg(rs.theta ?? 0)} deg`}
        />
        <DetailRow
          label="Confidence"
          value={`${((rs.confidence ?? 0) * 100).toFixed(1)} %`}
        />
      </DetailCard>

      <DetailCard title="Battery & Power">
        <View style={{ marginVertical: 8 }}>
          <Text style={commonStyles.detailLabel}>Battery</Text>
          <View
            style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}
          >
            <View
              style={{
                flex: 1,
                height: 10,
                backgroundColor: "#eee",
                borderRadius: 5,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  width: `${rs.battery}%`,
                  height: "100%",
                  backgroundColor: getBatteryColor(rs.battery),
                  borderRadius: 5,
                }}
              />
            </View>
            <Text
              style={{
                marginLeft: 10,
                fontWeight: "700",
                color: getBatteryColor(rs.battery),
              }}
            >
              {rs.battery}%
            </Text>
          </View>
        </View>
        <DetailRow
          label="Voltage"
          value={rs.voltage != null ? `${rs.voltage.toFixed(2)} V` : "N/A"}
        />
        <DetailRow
          label="Current"
          value={rs.current != null ? `${rs.current.toFixed(2)} A` : "N/A"}
        />
        <DetailRow
          label="Charging"
          value={ChargingMode[rs.chargingMode].toUpperCase()}
        />
      </DetailCard>

      <DetailCard title="Task Status">
        <DetailRow label="Task ID" value={rs.currentTaskId} />
        <DetailRow label="Task Name" value={rs.currentTask} />
        <DetailRow
          label="Task State"
          value={TaskRunningState[rs.taskState].toUpperCase()}
        />
      </DetailCard>
    </ScrollView>
  );
}
