import { View, Text, TouchableOpacity } from "react-native";
import { settingsStyles } from "@/styles/settingsStyles";

export default function SettingsRow({
  label,
  subtitle,
  right,
  onPress,
}: {
  label: string;
  subtitle?: string;
  right?: React.ReactNode;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      style={settingsStyles.settingsRow}
      onPress={onPress}
      activeOpacity={onPress ? 0.6 : 1}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 16 }}>{label}</Text>
        {subtitle && (
          <Text style={{ fontSize: 13, color: "#888", marginTop: 2 }}>
            {subtitle}
          </Text>
        )}
      </View>
      {right ??
        (onPress ? (
          <Text style={{ color: "#aaa", fontSize: 18 }}>›</Text>
        ) : null)}
    </TouchableOpacity>
  );
}
