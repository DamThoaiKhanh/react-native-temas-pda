import React, { useEffect } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuthStore } from "../stores";

// Define welcome message and version info
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
      {/* <Text style={styles.icon}>📱</Text> */}
      <Image
        source={require("../../assets/Logo_Temas.png")}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>{welcomeMsg}</Text>
      <Text style={styles.subtitle}>{version}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1565C0",
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    fontSize: 80,
    marginBottom: 24,
  },
  logo: {
    width: 260,
    height: 120,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.7)",
  },
});
