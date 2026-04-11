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
  NavIndex,
} from "../stores";
import { HeaderBar } from "@/components/common/HeaderBar";
import { formatDate, getStatusColor } from "../components/utils";
import { commonStyles } from "@/styles/commonStyles";

export default function RecordOrderScreen() {
  const navigation = useNavigation<any>();
  const { records, isLoading, fetchRecords } = useRobotStore();
  const setNavIndex = useNavStore((s) => s.setIndex);
  const navIndex = useNavStore((s) => s.index);
  const previousIndex = useNavStore((s) => s.previousIndex);

  useEffect(() => {
    if (
      navIndex === NavIndex.RecordOrderScreen &&
      previousIndex !== NavIndex.RecordOrderScreen
    ) {
      // console.log("Fetching records...");
      fetchRecords();
      // console.log("Fetched records:", records);
    }
  }, [navIndex]);

  return (
    <View style={{ flex: 1 }}>
      <HeaderBar
        title="Record Orders"
        onNotification={() => navigation.navigate("Notifications")}
        onSettings={() => setNavIndex(NavIndex.SettingScreen)}
      />
      {isLoading && <ActivityIndicator style={{ marginTop: 20 }} />}
      <FlatList
        data={records}
        keyExtractor={(i) => i.taskId}
        contentContainerStyle={{ padding: 8 }}
        ListEmptyComponent={
          <Text style={commonStyles.empty}>No records available</Text>
        }
        refreshing={isLoading}
        onRefresh={fetchRecords}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={commonStyles.card}
            onPress={() =>
              navigation.navigate("RecordDetail", { record: item })
            }
            activeOpacity={0.8}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={commonStyles.cardSub}>Task ID: {item.taskId}</Text>
                <Text style={commonStyles.title}>
                  Task name: {item.taskName}
                </Text>
              </View>
              <View
                style={[
                  commonStyles.badge,
                  { backgroundColor: getStatusColor(item.status) },
                ]}
              >
                <Text style={commonStyles.badgeText}>{item.status}</Text>
              </View>
            </View>
            {item.robotName && (
              <Text style={commonStyles.cardSub}>🤖 {item.robotName}</Text>
            )}
            {item.createdOn && (
              <Text style={commonStyles.cardSub}>
                🕒 {formatDate(item.createdOn)}
              </Text>
            )}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
