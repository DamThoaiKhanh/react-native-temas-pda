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
import AntDesign from "@expo/vector-icons/AntDesign";

export default function RecordDetailScreen() {
  const route = useRoute<any>();
  const { fetchRecordDetail, selectedRecord, isLoading } = useRobotStore();
  const record = selectedRecord ?? route.params.record;

  useEffect(() => {
    fetchRecordDetail(route.params.record.taskId);
  }, []);

  if (isLoading)
    return <ActivityIndicator style={{ flex: 1, justifyContent: "center" }} />;

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <View style={{ alignItems: "center", marginBottom: 24 }}>
        <Text style={{ fontSize: 60 }}>📋</Text>
        <View
          style={[s.badge, { backgroundColor: statusColor(record.status) }]}
        >
          <Text style={s.badgeText}>{record.status.toUpperCase()}</Text>
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

function DetailCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={s.card}>
      {title ? (
        <Text style={[s.title, { fontSize: 18, marginBottom: 8 }]}>
          {title}
        </Text>
      ) : null}
      {title ? (
        <View style={{ height: 1, backgroundColor: "#eee", marginBottom: 8 }} />
      ) : null}
      {children}
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <View style={{ flexDirection: "row", paddingVertical: 6 }}>
      <Text style={[s.detailLabel, { width: 130 }]}>{label}</Text>
      <Text style={{ flex: 1, fontSize: 14 }}>{value ?? "N/A"}</Text>
    </View>
  );
}

const statusColor = (status: string) => {
  const l = status.toLowerCase();
  if (["finish", "completed", "success"].includes(l)) return "green";
  if (["failed", "error"].includes(l)) return "red";
  if (l === "cancelled") return "orange";
  return "grey";
};

const batteryColor = (b: number) =>
  b > 30 ? "green" : b > 20 ? "orange" : "red";

const hdrStyle = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: { flex: 1, fontSize: 18, fontWeight: "700" },
});

const s = StyleSheet.create({
  empty: { textAlign: "center", marginTop: 60, color: "#888", fontSize: 16 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cardSelected: { backgroundColor: "#E3F2FD" },
  title: { fontSize: 16, fontWeight: "700", marginBottom: 4 },
  sub: { fontSize: 13, color: "#555", marginBottom: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  detailLabel: { fontWeight: "700", fontSize: 14, color: "#333" },
});

const s2 = StyleSheet.create({
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: "#1565C0",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: { backgroundColor: "#1565C0" },
  notifIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  clearFab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    backgroundColor: "#C62828",
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingVertical: 14,
    elevation: 6,
  },
  picker: {
    maxHeight: 160,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
  },
  pickerItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: "#eee" },
  pickerItemSelected: { backgroundColor: "#1565C0" },
  priItem: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  priItemSelected: { backgroundColor: "#1565C0", borderColor: "#1565C0" },
  preview: {
    backgroundColor: "#E3F2FD",
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#90CAF9",
  },
  saveBtn: {
    backgroundColor: "#1565C0",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  saveBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  clearBtn: {
    borderWidth: 1,
    borderColor: "#1565C0",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
  },
  clearBtnText: { color: "#1565C0", fontSize: 16 },
  section: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1565C0",
    padding: 16,
    paddingBottom: 8,
  },
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    backgroundColor: "#fff",
  },
});
