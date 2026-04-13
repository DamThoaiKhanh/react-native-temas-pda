import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuthStore } from "../stores";

const welcomeMsg = "Welcome";
const version = "PDA v1.0.0";

export default function SplashScreen() {
  const navigation = useNavigation<any>();
  const init = useAuthStore((s) => s.init);

  useEffect(() => {
    (async () => {
      await init();
      await new Promise((r) => setTimeout(r, 5000));
      navigation.replace("Login");
    })();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F4C9A" />

      {/* Decorative background circles */}
      <View style={[styles.circle, styles.circleTop]} />
      <View style={[styles.circle, styles.circleBottom]} />

      <View style={styles.content}>
        <View style={styles.logoCard}>
          <Image
            source={require("../../assets/Logo_Temas.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>{welcomeMsg}</Text>
        <Text style={styles.subtitle}>Personal Digital Assistant</Text>

        <View style={styles.loadingWrap}>
          <ActivityIndicator size="small" color="#FFFFFF" />
          <Text style={styles.loadingText}>Loading data...</Text>
        </View>
      </View>

      <Text style={styles.version}>{version}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1565C0",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    overflow: "hidden",
  },

  circle: {
    position: "absolute",
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  circleTop: {
    width: 260,
    height: 260,
    top: -70,
    right: -60,
  },
  circleBottom: {
    width: 220,
    height: 220,
    bottom: -60,
    left: -50,
  },

  content: {
    width: "100%",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 24,
    paddingVertical: 36,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },

  logoCard: {
    width: 250,
    height: 150,
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },

  logo: {
    width: 200,
    height: 120,
  },

  title: {
    fontSize: 34,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.5,
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
    marginBottom: 28,
  },

  loadingWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },

  loadingText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "500",
  },

  version: {
    position: "absolute",
    bottom: 36,
    fontSize: 13,
    color: "rgba(255,255,255,0.75)",
    letterSpacing: 0.3,
  },
});
