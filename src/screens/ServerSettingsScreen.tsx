import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuthStore } from "../stores";

function isValidIPv4(ip: string): boolean {
  const parts = ip.split(".");
  if (parts.length !== 4) return false;
  return parts.every((p) => {
    const n = parseInt(p, 10);
    return !isNaN(n) && n >= 0 && n <= 255;
  });
}

export default function ServerSettingsScreen() {
  const navigation = useNavigation<any>();
  const { serverConfig, saveServerConfig } = useAuthStore();

  const [ip, setIp] = useState(serverConfig?.ipAddress ?? "");
  const [port, setPort] = useState(serverConfig?.port ?? "");

  const save = async () => {
    if (!isValidIPv4(ip)) {
      Alert.alert("Error", "Invalid IPv4 address");
      return;
    }
    if (!port) {
      Alert.alert("Error", "Port is required");
      return;
    }
    await saveServerConfig(ip, port);
    Alert.alert("Success", "Server settings saved");
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.label}>IP Address</Text>
        <TextInput
          style={styles.input}
          placeholder="192.168.1.100"
          value={ip}
          onChangeText={setIp}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Port</Text>
        <TextInput
          style={styles.input}
          placeholder="8080"
          value={port}
          onChangeText={setPort}
          keyboardType="numeric"
        />

        <TouchableOpacity style={styles.saveBtn} onPress={save}>
          <Text style={styles.saveBtnText}>SAVE</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelBtnText}>CANCEL</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 6, color: "#333" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    marginBottom: 20,
  },
  saveBtn: {
    backgroundColor: "#1565C0",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  cancelBtn: {
    borderWidth: 1,
    borderColor: "#1565C0",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
  },
  cancelBtnText: { color: "#1565C0", fontSize: 16 },
});
