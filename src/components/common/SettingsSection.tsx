import { View, Text } from "react-native";
import { settingsStyles } from "@/styles/settingsStyles";

export default function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View>
      <Text style={settingsStyles.section}>{title}</Text>
      {children}
    </View>
  );
}
