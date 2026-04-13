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
  StatusBar,
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

  const [ipAddress, setIpAddress] = useState(serverConfig?.ipAddress ?? "");
  const [portNumber, setPortNumber] = useState(serverConfig?.port ?? "");

  const handleSave = async () => {
    if (!isValidIPv4(ipAddress)) {
      Alert.alert("Error", "Invalid IPv4 address");
      return;
    }

    if (!portNumber) {
      Alert.alert("Error", "Port is required");
      return;
    }

    await saveServerConfig(ipAddress, portNumber);
    Alert.alert("Success", "Server settings saved");
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={styles.screenContainer}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0F4C9A" />

      <View style={styles.backgroundDecoration}>
        <View style={styles.backgroundCircleTop} />
        <View style={styles.backgroundCircleBottom} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formCard}>
          <View style={styles.headerBlock}>
            <Text style={styles.screenTitle}>Server Settings</Text>
            <Text style={styles.screenSubtitle}>
              Configure the server IP address and port used by the app.
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>IP Address</Text>
            <TextInput
              style={styles.textInput}
              placeholder="192.168.1.100"
              placeholderTextColor="#94A3B8"
              value={ipAddress}
              onChangeText={setIpAddress}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Port</Text>
            <TextInput
              style={styles.textInput}
              placeholder="8080"
              placeholderTextColor="#94A3B8"
              value={portNumber}
              onChangeText={setPortNumber}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Current Configuration</Text>
            <Text
              style={[
                styles.infoText,
                serverConfig
                  ? styles.infoTextConnected
                  : styles.infoTextWarning,
              ]}
            >
              {serverConfig
                ? `${serverConfig.ipAddress}:${serverConfig.port}`
                : "No server configured"}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleSave}
            activeOpacity={0.9}
          >
            <Text style={styles.primaryButtonText}>SAVE SETTINGS</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.85}
          >
            <Text style={styles.secondaryButtonText}>CANCEL</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#1565C0",
  },

  backgroundDecoration: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  backgroundCircleTop: {
    position: "absolute",
    top: -70,
    right: -50,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  backgroundCircleBottom: {
    position: "absolute",
    bottom: -80,
    left: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(255,255,255,0.07)",
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 32,
  },

  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingVertical: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },

  headerBlock: {
    marginBottom: 24,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
    marginBottom: 8,
  },
  screenSubtitle: {
    fontSize: 15,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 22,
  },

  inputGroup: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#DCE7F5",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#0F172A",
  },

  infoBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginTop: 4,
    marginBottom: 22,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  infoText: {
    fontSize: 14,
    fontWeight: "500",
  },
  infoTextConnected: {
    color: "#0F766E",
  },
  infoTextWarning: {
    color: "#DC2626",
  },

  primaryButton: {
    backgroundColor: "#1565C0",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.4,
  },

  secondaryButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
  },
  secondaryButtonText: {
    color: "#1565C0",
    fontSize: 15,
    fontWeight: "700",
  },
});
