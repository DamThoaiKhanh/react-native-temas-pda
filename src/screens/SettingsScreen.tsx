import React, { useEffect, useState, useRef } from "react";
import { Alert, ScrollView, Switch } from "react-native";
import SettingsSection from "@/components/common/SettingsSection";
import SettingsRow from "@/components/common/SettingsRow";

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(false);

  return (
    <ScrollView>
      <SettingsSection title="Notifications">
        <SettingsRow
          label="Enable Notifications"
          subtitle="Receive notifications from the app"
          right={
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
            />
          }
        />
        <SettingsRow
          label="Sound"
          subtitle="Play sound for notifications"
          right={
            <Switch
              value={soundEnabled}
              onValueChange={setSoundEnabled}
              disabled={!notificationsEnabled}
            />
          }
        />
        <SettingsRow
          label="Vibration"
          subtitle="Vibrate for notifications"
          right={
            <Switch
              value={vibrationEnabled}
              onValueChange={setVibrationEnabled}
              disabled={!notificationsEnabled}
            />
          }
        />
      </SettingsSection>

      <SettingsSection title="Data">
        <SettingsRow
          label="Refresh Interval"
          subtitle="Auto-refresh data every 30 seconds"
          onPress={() =>
            Alert.alert("Coming Soon", "This feature is coming soon")
          }
        />
        <SettingsRow
          label="Clear Cache"
          subtitle="Clear stored data and cache"
          onPress={() =>
            Alert.alert(
              "Clear Cache",
              "Are you sure you want to clear all cached data?",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Clear",
                  style: "destructive",
                  onPress: () => Alert.alert("Done", "Cache cleared"),
                },
              ],
            )
          }
        />
      </SettingsSection>

      <SettingsSection title="About">
        <SettingsRow label="Version" subtitle="1.0.0" />
        <SettingsRow
          label="Help & Support"
          onPress={() =>
            Alert.alert("Coming Soon", "Help & Support coming soon")
          }
        />
      </SettingsSection>
    </ScrollView>
  );
}
