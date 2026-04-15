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
import useRobotStore from "../../stores/useRobotStore";
import { formatDate } from "../../components/utils";
import { getStatusColor } from "../../components/utils";
import Ionicons from "@expo/vector-icons/Ionicons";
import { DetailCard } from "@/components/common/DetailCard";
import { DetailRow } from "@/components/common/DetailRow";
import { commonStyles } from "@/styles/commonStyles";

export default function RecordDetailScreen() {
  const route = useRoute<any>();
  const { fetchRecordDetail, selectedRecord, isLoading } = useRobotStore();
  const record = selectedRecord ?? route.params.record;

  useEffect(() => {
    fetchRecordDetail(route.params.record.taskId);
  }, []);

  if (isLoading)
    return <ActivityIndicator style={{ flex: 1, justifyContent: "center" }} />;

  const statusColor = getStatusColor(record.status);
  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <View style={{ alignItems: "center", marginBottom: 24 }}>
        <Ionicons name="videocam" size={50} color={statusColor} />
        <View style={[commonStyles.badge, { backgroundColor: statusColor }]}>
          <Text style={commonStyles.badgeText}>
            {record.status.toUpperCase()}
          </Text>
        </View>
      </View>
      <DetailCard title="Task Information">
        <DetailRow label="Task ID" value={record.taskId} />
        <DetailRow label="Task Name" value={record.taskName} />
        <DetailRow label="Status" value={record.status} />
        {record.createdOn && (
          <DetailRow label="Created On" value={formatDate(record.createdOn)} />
        )}
      </DetailCard>
      {(record.robotName || record.robotIp) && (
        <DetailCard title="Robot Information">
          <DetailRow label="Robot IP" value={record.robotIp} />
          <DetailRow label="Robot Name" value={record.robotName} />
        </DetailCard>
      )}
    </ScrollView>
  );
}
