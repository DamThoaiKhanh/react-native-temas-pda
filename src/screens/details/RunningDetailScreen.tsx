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
import { formatDate } from "../../components/utils";
import { DetailCard } from "../../components/common/DetailCard";
import { DetailRow } from "../../components/common/DetailRow";
import { commonStyles } from "../../styles/commonStyles";

export default function RunningDetailScreen() {
  const route = useRoute<any>();
  const order: RunningOrder = route.params.order;

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <View style={{ alignItems: "center", marginBottom: 24 }}>
        <Text style={{ fontSize: 48 }}>🔄</Text>
        <View style={[commonStyles.badge, { backgroundColor: "green" }]}>
          <Text style={commonStyles.badgeText}>RUNNING</Text>
        </View>
      </View>
      <DetailCard title="Task Information">
        <DetailRow label="Task ID" value={order.taskId} />
        <DetailRow label="Task Name" value={order.taskName} />
        <DetailRow label="Status" value="Running" />
        <DetailRow label="Created On" value={formatDate(order.createdOn)} />
      </DetailCard>
      <DetailCard title="Robot Information">
        <DetailRow label="Robot IP" value={order.robotIp} />
        <DetailRow label="Robot Name" value={order.robotName} />
      </DetailCard>
    </ScrollView>
  );
}
