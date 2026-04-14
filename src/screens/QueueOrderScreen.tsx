import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActionSheetIOS,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import useNavStore, { NavIndex } from "../stores/useNavStore";
import useOrderStore from "../stores/useOrderStore";
import useNotificationStore from "../stores/useNotificationStore";
import { formatDate } from "../components/utils";

import { HeaderBar } from "@/components/common/HeaderBar";
import { commonStyles } from "@/styles/commonStyles";

export default function QueueOrderScreen() {
  const navigation = useNavigation<any>();
  const { queueOrders, isLoading, fetchQueueOrders, deleteDemandOrder } =
    useOrderStore();
  const setNavIndex = useNavStore((s) => s.setIndex);
  const navIndex = useNavStore((s) => s.index);
  const previousIndex = useNavStore((s) => s.previousIndex);

  useEffect(() => {
    if (
      navIndex === NavIndex.QueueOrderScreen &&
      previousIndex !== NavIndex.QueueOrderScreen
    ) {
      // console.log("Fetching queue orders...");
      fetchQueueOrders();
      // console.log("Fetched queue orders:", queueOrders);
    }
  }, [navIndex]);

  const del = async (taskId: string) => {
    const ok = await deleteDemandOrder(taskId);
    Alert.alert(
      ok ? "Success" : "Error",
      ok ? "Order deleted" : "Failed to delete order",
    );
  };

  return (
    <View style={commonStyles.container}>
      <HeaderBar
        title="Queue Orders"
        onNotification={() => navigation.navigate("Notifications")}
        onSettings={() => setNavIndex(NavIndex.SettingScreen)}
      />
      {isLoading && <ActivityIndicator style={{ marginTop: 20 }} />}
      <FlatList
        data={queueOrders}
        keyExtractor={(i) => i.taskId}
        contentContainerStyle={{ padding: 8 }}
        ListEmptyComponent={
          <Text style={styles.empty}>No queue orders available</Text>
        }
        refreshing={isLoading}
        onRefresh={fetchQueueOrders}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              Alert.alert("Options", item.taskName, [
                {
                  text: "Delete",
                  style: "destructive",
                  onPress: () => del(item.taskId),
                },
                { text: "Cancel", style: "cancel" },
              ])
            }
            activeOpacity={0.8}
          >
            <Text style={styles.cardTitle}>Task name: {item.taskName}</Text>
            <Text style={styles.cardSub}>Task ID: {item.taskId}</Text>
            <Text style={styles.cardSub}>
              Create at: {formatDate(item.createdAt)}
            </Text>
            <Text style={styles.cardSub}>Priority: {item.priority}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
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
  cardTitle: { fontSize: 16, fontWeight: "700", marginBottom: 6 },
  cardSub: { fontSize: 13, color: "#555", marginBottom: 2 },
  actionBtn: {
    marginTop: 12,
    backgroundColor: "#1565C0",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  actionBtnText: { color: "#fff", fontWeight: "700" },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#1565C0",
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
  },
  fabText: { color: "#fff", fontSize: 28, lineHeight: 30 },
});
