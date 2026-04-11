import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

export function HeaderBar({
  title,
  onNotification,
  onSettings,
}: {
  title: string;
  onNotification: () => void;
  onSettings: () => void;
}) {
  return (
    <View style={hdr.bar}>
      <Text style={hdr.title}>{title}</Text>
      <View style={hdr.actions}>
        <TouchableOpacity onPress={onNotification} style={hdr.iconBtn}>
          <Text style={hdr.icon}>
            <Ionicons name="notifications" size={24} color="black" />
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onSettings} style={hdr.iconBtn}>
          <Text style={hdr.icon}>
            <Ionicons name="ellipsis-vertical" size={24} color="black" />
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const hdr = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: { flex: 1, fontSize: 24, fontWeight: "700" },
  actions: { flexDirection: "row" },
  iconBtn: { paddingHorizontal: 8 },
  icon: { fontSize: 20 },
});
