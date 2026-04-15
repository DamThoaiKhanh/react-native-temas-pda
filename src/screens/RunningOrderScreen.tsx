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
import useOrderStore from "../stores/useOrderStore";
import useNavStore, { NavIndex } from "../stores/useNavStore";
import { RunningOrder } from "../models";
import { HeaderBar } from "@/components/common/HeaderBar";
import { commonStyles } from "@/styles/commonStyles";

export default function RunningOrderScreen() {
  const navigation = useNavigation<any>();
  const { runningOrders, isLoading, fetchRunningOrders, cancelRunningOrder } =
    useOrderStore();
  const setNavIndex = useNavStore((s) => s.setIndex);
  const navIndex = useNavStore((s) => s.index);
  const previousIndex = useNavStore((s) => s.previousIndex);

  useEffect(() => {
    if (
      navIndex === NavIndex.RunningOrderScreen &&
      previousIndex !== NavIndex.RunningOrderScreen
    ) {
      // console.log("Fetching running orders...");
      fetchRunningOrders();
      // console.log("Fetched running orders:", runningOrders);
    }
  }, [navIndex]);

  const cancelConfirm = (taskId: string) => {
    Alert.alert(
      "Cancel Order",
      "Are you sure you want to cancel this running order?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          style: "destructive",
          onPress: async () => {
            const ok = await cancelRunningOrder(taskId);
            Alert.alert(
              ok ? "Success" : "Error",
              ok ? "Order cancelled" : "Failed to cancel order",
            );
          },
        },
      ],
    );
  };

  const showMenu = (order: RunningOrder) => {
    Alert.alert("Select Options", order.taskName, [
      {
        text: "Detail",
        onPress: () => navigation.navigate("RunningDetail", { order }),
      },
      {
        text: "Cancel Order",
        style: "destructive",
        onPress: () => cancelConfirm(order.taskId),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  return (
    <View style={commonStyles.container}>
      <HeaderBar
        title="Running Orders"
        onNotification={() => navigation.navigate("Notifications")}
        onSettings={() => setNavIndex(NavIndex.SettingScreen)}
      />
      {isLoading && <ActivityIndicator style={{ marginTop: 20 }} />}
      <FlatList
        data={runningOrders}
        keyExtractor={(i) => i.taskId}
        contentContainerStyle={{ padding: 8 }}
        ListEmptyComponent={
          <Text style={commonStyles.empty}>No running orders</Text>
        }
        refreshing={isLoading}
        onRefresh={fetchRunningOrders}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={commonStyles.card}
            onPress={() => showMenu(item)}
            activeOpacity={0.8}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <Text style={{ color: "green", fontWeight: "700" }}>
                ▶ RUNNING
              </Text>
            </View>
            <Text style={commonStyles.title}>Task name: {item.taskName}</Text>
            <Text style={commonStyles.cardSub}>Task ID: {item.taskId}</Text>
            <Text style={commonStyles.cardSub}>
              Robot: {item.robotName} - {item.robotIp}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
