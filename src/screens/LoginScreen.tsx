import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  StatusBar,
} from "react-native";
import { NotificationType, AppNotification } from "@/models";
import { useNavigation } from "@react-navigation/native";
import useAuthStore from "../stores/useAuthStore";
import useNotificationStore from "../stores/useNotificationStore";
export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const {
    isLoading,
    rememberMe,
    login,
    setRememberMe,
    getSavedCredentials,
    serverConfig,
  } = useAuthStore();

  const { addNotification } = useNotificationStore();

  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(rememberMe);

  useEffect(() => {
    (async () => {
      setRemember(rememberMe);
      if (rememberMe) {
        const credentials = await getSavedCredentials();
        if (credentials) {
          setAccount(credentials.account);
          setPassword(credentials.password);
        }
      }
    })();
  }, []);

  const handleLogin = async () => {
    if (!account || !password) {
      Alert.alert("Error", "Please enter account and password");
      return;
    }
    if (!serverConfig) {
      Alert.alert("Error", "Please configure server settings first");
      return;
    }
    const ok = await login(account, password);
    if (ok) {
      addNotification({
        id: Date.now().toString(),
        title: "Login Successful",
        message: "You have been logged in successfully.",
        type: NotificationType.info,
        createdAt: new Date().toISOString(),
      });
      navigation.replace("Main");
    } else {
      addNotification({
        id: Date.now().toString(),
        title: "Login Failed",
        message: useAuthStore.getState().error ?? "Unknown error",
        type: NotificationType.error,
        createdAt: new Date().toISOString(),
      });
      Alert.alert(
        "Login Failed",
        useAuthStore.getState().error ?? "Unknown error",
      );
    }
  };

  const toggleRemember = () => {
    const next = !remember;
    setRemember(next);
    setRememberMe(next);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
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
          <View style={styles.logoContainer}>
            <Image
              source={require("../../assets/Logo_Temas.png")}
              style={styles.brandLogo}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.screenTitle}>Welcome Back</Text>
          <Text style={styles.screenSubtitle}>Sign in to continue</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Account</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter your account"
              placeholderTextColor="#94A3B8"
              value={account}
              onChangeText={setAccount}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter your password"
              placeholderTextColor="#94A3B8"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={styles.rememberRow}
            onPress={toggleRemember}
            activeOpacity={0.8}
          >
            <View
              style={[styles.checkboxBase, remember && styles.checkboxChecked]}
            >
              {remember && <Text style={styles.checkboxMark}>✓</Text>}
            </View>
            <Text style={styles.rememberText}>Remember me</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.primaryButton,
              isLoading && styles.primaryButtonDisabled,
            ]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.9}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonText}>LOGIN</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate("ServerSettings")}
            activeOpacity={0.85}
          >
            <Text style={styles.secondaryButtonText}>Server Settings</Text>
          </TouchableOpacity>

          <View style={styles.serverInfoBox}>
            <Text style={styles.serverInfoLabel}>Connection Status</Text>
            <Text
              style={[
                styles.serverInfoText,
                serverConfig
                  ? styles.serverInfoConnected
                  : styles.serverInfoDisconnected,
              ]}
            >
              {serverConfig
                ? `Server: ${serverConfig.ipAddress}:${serverConfig.port}`
                : "Server is not configured"}
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
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

  logoContainer: {
    alignSelf: "center",
    width: 250,
    height: 150,
    borderRadius: 28,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  brandLogo: {
    width: 200,
    height: 120,
  },

  screenTitle: {
    fontSize: 30,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
    marginBottom: 6,
  },
  screenSubtitle: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 24,
  },

  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
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

  rememberRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
    marginBottom: 22,
  },
  checkboxBase: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#1565C0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    backgroundColor: "#FFFFFF",
  },
  checkboxChecked: {
    backgroundColor: "#1565C0",
  },
  checkboxMark: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  rememberText: {
    fontSize: 15,
    color: "#334155",
    fontWeight: "500",
  },

  primaryButton: {
    backgroundColor: "#1565C0",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  primaryButtonDisabled: {
    opacity: 0.75,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  secondaryButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
    marginBottom: 16,
  },
  secondaryButtonText: {
    color: "#1565C0",
    fontSize: 15,
    fontWeight: "700",
  },

  serverInfoBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  serverInfoLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  serverInfoText: {
    fontSize: 14,
    fontWeight: "500",
  },
  serverInfoConnected: {
    color: "#0F766E",
  },
  serverInfoDisconnected: {
    color: "#DC2626",
  },
});
