import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { JSX } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import useNavStore, { NavIndex } from "../stores/useNavStore";
import useAuthStore from "../stores/useAuthStore";
import { HeaderBar } from "@/components/common/HeaderBar";
import { DetailCard } from "@/components/common/DetailCard";
import { commonStyles } from "../styles/commonStyles";
import AntDesign from "@expo/vector-icons/AntDesign";

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
    <View style={commonStyles.container}>
      <HeaderBar
        title="Profile"
        onNotification={() => navigation.navigate("Notifications")}
        onSettings={() => setNavIndex(NavIndex.SettingScreen)}
      />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={{ alignItems: "center", marginBottom: 24 }}>
          <View
            style={{
              width: 70,
              height: 70,
              borderRadius: 35,
              backgroundColor: "#1565C0",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <AntDesign name="user" size={42} color="#fff" />
          </View>
        </View>
        <DetailCard title="User Information">
          <InfoRow
            icon={<AntDesign name="user" size={24} color="#1565C0" />}
            label="User"
            value={user.account}
          />
          <InfoRow
            icon={<AntDesign name="idcard" size={24} color="#1565C0" />}
            label="Role"
            value={user.role}
          />
        </DetailCard>
        {serverConfig && (
          <DetailCard title="Server Configuration">
            <InfoRow
              icon={<AntDesign name="link" size={24} color="#1565C0" />}
              label="IP Address"
              value={serverConfig.ipAddress}
            />
            <InfoRow
              icon={<AntDesign name="api" size={24} color="#1565C0" />}
              label="Port"
              value={serverConfig.port}
            />
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

const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon: JSX.Element;
  label: string;
  value: string;
}) => {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        gap: 12,
      }}
    >
      {icon}
      <View>
        <Text style={{ fontSize: 12, color: "#888" }}>{label}</Text>
        <Text style={{ fontSize: 16, fontWeight: "500", marginTop: 2 }}>
          {value}
        </Text>
      </View>
    </View>
  );
};
