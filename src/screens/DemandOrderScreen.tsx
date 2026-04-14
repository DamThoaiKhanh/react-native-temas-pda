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
import useOrderStore from "../stores/useOrderStore";
import useNavStore, { NavIndex } from "../stores/useNavStore";
import { formatDate } from "../components/utils";

import { HeaderBar } from "@/components/common/HeaderBar";
import { commonStyles } from "@/styles/commonStyles";

export default function DemandOrderScreen() {
  const navigation = useNavigation<any>();
  const {
    demandOrders,
    isLoading,
    fetchDemandOrders,
    confirmDemandOrder,
    deleteDemandOrder,
  } = useOrderStore();
  const setNavIndex = useNavStore((s) => s.setIndex);
  const navIndex = useNavStore((s) => s.index);
  const previousIndex = useNavStore((s) => s.previousIndex);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (
      navIndex === NavIndex.DemandOrderScreen &&
      previousIndex !== NavIndex.DemandOrderScreen
    ) {
      // console.log("Fetching demand orders...");
      fetchDemandOrders();
      // console.log("Fetched demand orders:", demandOrders);
    }
  }, [navIndex]);

  const confirmOrder = async (taskId: string) => {
    const ok = await confirmDemandOrder(taskId);
    Alert.alert(
      ok ? "Success" : "Error",
      ok ? "Order confirmed" : "Failed to confirm order",
    );
    if (ok) setSelectedId(null);
  };

  const deleteOrder = async (taskId: string) => {
    const ok = await deleteDemandOrder(taskId);
    Alert.alert(
      ok ? "Success" : "Error",
      ok ? "Order deleted" : "Failed to delete order",
    );
  };

  const showMenu = (taskId: string) => {
    Alert.alert("Options", "", [
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteOrder(taskId),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  return (
    <View style={commonStyles.container}>
      <HeaderBar
        title="Demand Orders"
        onNotification={() => navigation.navigate("Notifications")}
        onSettings={() => setNavIndex(NavIndex.SettingScreen)}
      />
      {isLoading && <ActivityIndicator style={{ marginTop: 20 }} />}
      <FlatList
        data={demandOrders}
        keyExtractor={(i) => i.taskId}
        contentContainerStyle={{ padding: 8 }}
        ListEmptyComponent={
          <Text style={commonStyles.empty}>No demand orders available</Text>
        }
        refreshing={isLoading}
        onRefresh={fetchDemandOrders}
        renderItem={({ item }) => {
          const isSelected = item.taskId === selectedId;
          return (
            <TouchableOpacity
              style={[
                commonStyles.card,
                isSelected && commonStyles.cardSelected,
              ]}
              onPress={() => setSelectedId(isSelected ? null : item.taskId)}
              onLongPress={() => showMenu(item.taskId)}
              activeOpacity={0.8}
            >
              <Text style={commonStyles.title}>Task name: {item.taskName}</Text>
              <Text style={commonStyles.cardSub}>Task ID: {item.taskId}</Text>
              <Text style={commonStyles.cardSub}>
                Create at: {formatDate(item.createdAt)}
              </Text>
              {isSelected && (
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => confirmOrder(item.taskId)}
                >
                  <Text style={styles.actionBtnText}>Confirm</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  actionBtn: {
    marginTop: 12,
    backgroundColor: "#1565C0",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  actionBtnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});
