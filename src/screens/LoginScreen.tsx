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
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuthStore } from "../stores";

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
      navigation.replace("Main");
    } else {
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
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Image
          source={require("../../assets/Logo_Temas.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* <Text style={styles.welcome}>WELCOME</Text> */}
        {/* <View style={{ height: 60 }} /> */}

        <Text style={styles.text}>Account:</Text>
        <TextInput
          style={styles.input}
          placeholder="Account"
          value={account}
          onChangeText={setAccount}
          autoCapitalize="none"
        />

        {/* <View style={{ height: 10 }} /> */}
        <Text style={styles.text}>Password:</Text>
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.rememberRow} onPress={toggleRemember}>
          <View style={[styles.checkbox, remember && styles.checkboxChecked]}>
            {remember && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.rememberText}>Remember me</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.loginBtn, isLoading && { opacity: 0.7 }]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginBtnText}>LOGIN</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingsBtn}
          onPress={() => navigation.navigate("ServerSettings")}
        >
          <Text style={styles.settingsBtnText}>⚙ Server Settings</Text>
        </TouchableOpacity>

        {serverConfig ? (
          <Text style={styles.serverInfo}>
            Server: {serverConfig.ipAddress}:{serverConfig.port}
          </Text>
        ) : (
          <Text style={[styles.serverInfo, { color: "red" }]}>
            Server is not configured
          </Text>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    justifyContent: "center",
  },
  logo: {
    width: 260,
    height: 140,
    alignSelf: "center",
  },
  welcome: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
  },
  text: {
    fontSize: 18,
    textAlign: "left",
    marginBottom: 10,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
    fontSize: 16,
  },
  rememberRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: "#1565C0",
    borderRadius: 4,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#1565C0",
  },
  checkmark: {
    color: "#fff",
    fontWeight: "bold",
  },
  rememberText: {
    fontSize: 16,
  },
  loginBtn: {
    backgroundColor: "#1565C0",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  loginBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  settingsBtn: {
    alignItems: "center",
    paddingVertical: 12,
  },
  settingsBtnText: {
    color: "#1565C0",
    fontSize: 16,
  },
  serverInfo: {
    textAlign: "center",
    color: "grey",
    marginTop: 12,
  },
});
