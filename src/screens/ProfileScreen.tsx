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
  useNotificationStore,
  useNavStore,
  NavIndex,
} from "../stores";
import { HeaderBar } from "@/components/common/HeaderBar";
import { DetailCard } from "@/components/common/DetailCard";
import { InfoRow } from "@/components/common/InfoRow";
import { commonStyles } from "../styles/commonStyles";

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const { user, serverConfig, logout } = useAuthStore();
  const setNavIndex = useNavStore((s) => s.setIndex);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout();
          navigation.replace("Login");
        },
      },
    ]);
  };

  if (!user) return <Text style={commonStyles.empty}>User not logged in</Text>;

  return (
    <View style={{ flex: 1 }}>
      <HeaderBar
        title="Profile"
        onNotification={() => navigation.navigate("Notifications")}
        onSettings={() => setNavIndex(NavIndex.SettingScreen)}
      />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={{ alignItems: "center", marginBottom: 24 }}>
          <View
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: "#1565C0",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <Text style={{ fontSize: 50, color: "#fff" }}>👤</Text>
          </View>
        </View>
        <DetailCard title="User Information">
          <InfoRow icon="👤" label="User" value={user.account} />
          <InfoRow icon="🏷" label="Role" value={user.role} />
        </DetailCard>
        {serverConfig && (
          <DetailCard title="Server Configuration">
            <InfoRow
              icon="🖥"
              label="IP Address"
              value={serverConfig.ipAddress}
            />
            <InfoRow icon="🔌" label="Port" value={serverConfig.port} />
          </DetailCard>
        )}
        <TouchableOpacity
          style={{
            backgroundColor: "red",
            borderRadius: 10,
            paddingVertical: 16,
            alignItems: "center",
            marginTop: 24,
          }}
          onPress={handleLogout}
        >
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
            LOGOUT
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
