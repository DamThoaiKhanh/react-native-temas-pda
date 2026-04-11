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
import {
  useAuthStore,
  useOrderStore,
  useNotificationStore,
  useNavStore,
  NavIndex,
} from "../stores";
import { RequestOrder, NotificationType } from "../models";
import { formatDate } from "../components/utils";
import { commonStyles } from "@/styles/commonStyles";
import { HeaderBar } from "@/components/common/HeaderBar";

export default function RequestOrderScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();
  const {
    requestOrders,
    isLoading,
    loadRequestOrders,
    deleteRequestOrder,
    sendRequestOrder,
  } = useOrderStore();
  const addNotification = useNotificationStore((s) => s.addNotification);
  const setNavIndex = useNavStore((s) => s.setIndex);
  const navIndex = useNavStore((s) => s.index);
  const previousIndex = useNavStore((s) => s.previousIndex);

  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (
        navIndex === NavIndex.RequestOrderScreen &&
        previousIndex !== NavIndex.RequestOrderScreen
      ) {
        // console.log("Fetching request orders...");
        if (user) await loadRequestOrders(user.account);
        // console.log("Fetched request orders:", requestOrders);
      }
    };
    fetchOrders();
  }, [navIndex]);

  const showMenu = (order: RequestOrder) => {
    Alert.alert("Options", order.taskName, [
      {
        text: "Edit",
        onPress: () => navigation.navigate("NewRequestOrder", { order }),
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => user && deleteRequestOrder(user.account, order.id),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const send = async (order: RequestOrder) => {
    const ok = await sendRequestOrder(order);
    if (ok) {
      user && deleteRequestOrder(user.account, order.id);
      setSelectedId(null);
      addNotification({
        id: Date.now().toString(),
        title: "Order Sent",
        message: `Request order for "${order.taskName}" was sent.`,
        type: NotificationType.info,
        createdAt: new Date().toISOString(),
      });
    }
    Alert.alert(
      ok ? "Success" : "Error",
      ok ? "Order sent successfully" : "Failed to send order",
    );
  };

  return (
    <View style={commonStyles.container}>
      <HeaderBar
        title="Request Orders"
        onNotification={() => navigation.navigate("Notifications")}
        onSettings={() => setNavIndex(NavIndex.SettingScreen)}
      />
      {isLoading && <ActivityIndicator style={{ marginTop: 20 }} />}
      <FlatList
        data={requestOrders}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: 8 }}
        ListEmptyComponent={
          <Text style={commonStyles.empty}>
            No request orders. Tap + to add new.
          </Text>
        }
        refreshing={isLoading}
        onRefresh={() => user && loadRequestOrders(user.account)}
        renderItem={({ item }) => {
          const isSelected = item.id === selectedId;
          return (
            <TouchableOpacity
              style={[
                commonStyles.card,
                isSelected && commonStyles.cardSelected,
              ]}
              onPress={() => setSelectedId(isSelected ? null : item.id)}
              onLongPress={() => showMenu(item)}
              activeOpacity={0.8}
            >
              <Text style={commonStyles.title}>Task name: {item.taskName}</Text>
              <Text style={commonStyles.cardSub}>Task ID: {item.taskId}</Text>
              <Text style={commonStyles.cardSub}>
                Create at: {formatDate(item.createdAt)}
              </Text>
              <Text style={commonStyles.cardSub}>
                Priority: {item.priority}
              </Text>
              {isSelected && (
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => send(item)}
                >
                  <Text style={styles.actionBtnText}>Send</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          );
        }}
      />
      <TouchableOpacity
        style={styles.floatingActionBtn}
        onPress={() =>
          navigation.navigate("NewRequestOrder", { order: undefined })
        }
      >
        <Text style={styles.floatingActionBtnText}>+</Text>
      </TouchableOpacity>
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
    fontWeight: "700",
    fontSize: 18,
  },
  floatingActionBtn: {
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
  floatingActionBtnText: {
    color: "#fff",
    fontSize: 28,
    lineHeight: 30,
  },
});
