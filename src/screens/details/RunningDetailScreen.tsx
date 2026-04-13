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
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { RunningOrder } from "../../models";
import { formatDate } from "../../components/utils";
import { DetailCard } from "../../components/common/DetailCard";
import { DetailRow } from "../../components/common/DetailRow";
import { commonStyles } from "../../styles/commonStyles";

export default function RunningDetailScreen() {
  const route = useRoute<any>();
  const order: RunningOrder = route.params.order;

  return (
    <ScrollView
      style={commonStyles.container}
      contentContainerStyle={{ padding: 16 }}
    >
      <View style={{ alignItems: "center", marginBottom: 24 }}>
        <Ionicons name="sync-circle" size={50} color="green" />
        <View style={[commonStyles.badge, { backgroundColor: "green" }]}>
          <Text style={commonStyles.badgeText}>RUNNING</Text>
        </View>
      </View>
      <DetailCard title="Task Information">
        <DetailRow label="Task ID" value={order.taskId} />
        <DetailRow label="Task Name" value={order.taskName} />
        <DetailRow label="Status" value="Running" />
        <DetailRow label="Created On" value={formatDate(order.createdOn)} />
        <DetailRow label="Start On" value={formatDate(order.startOn)} />
      </DetailCard>
      <DetailCard title="Robot Information">
        {/* <DetailRow label="Robot ID" value={order.robotId ?? "N/A"} /> */}
        <DetailRow label="Robot IP" value={order.robotIp} />
        <DetailRow label="Robot Name" value={order.robotName} />
      </DetailCard>
    </ScrollView>
  );
}
