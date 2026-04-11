import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import SplashScreen from "../screens/SplashScreen";
import LoginScreen from "../screens/LoginScreen";
import ServerSettingsScreen from "../screens/ServerSettingsScreen";
import MainShell from "../screens/MainShell";

import NotificationScreen from "../screens/NotificationScreen";
import NewRequestOrderScreen from "../screens/NewRequestOrderScreen";
import RecordDetailScreen from "../screens/details/RecordDetailScreen";
import RunningDetailScreen from "../screens/details/RunningDetailScreen";
import RobotDetailScreen from "../screens/details/RobotDetailScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen
          name="ServerSettings"
          component={ServerSettingsScreen}
          options={{ headerShown: true, title: "Server Settings" }}
        />
        <Stack.Screen name="Main" component={MainShell} />
        <Stack.Screen
          name="Notifications"
          component={NotificationScreen}
          options={{ headerShown: true, title: "Notifications" }}
        />
        <Stack.Screen
          name="NewRequestOrder"
          component={NewRequestOrderScreen}
          options={{ headerShown: true, title: "New Request" }}
        />
        <Stack.Screen
          name="RecordDetail"
          component={RecordDetailScreen}
          options={{ headerShown: true, title: "Record Detail" }}
        />
        <Stack.Screen
          name="RunningDetail"
          component={RunningDetailScreen}
          options={{ headerShown: true, title: "Running Detail" }}
        />
        <Stack.Screen
          name="RobotDetail"
          component={RobotDetailScreen}
          options={{ headerShown: true, title: "Robot Detail" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
