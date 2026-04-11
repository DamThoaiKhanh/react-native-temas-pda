import { View, Text } from "react-native";

export const StatusHighlight = ({
  label,
  icon,
  active,
  activeColor = "#1565C0",
}: {
  label: string;
  icon: string;
  active: boolean;
  activeColor?: string;
}) => {
  return (
    <View
      style={{
        width: 90,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#eee",
        padding: 8,
        alignItems: "center",
      }}
    >
      <View
        style={{
          width: 58,
          height: 58,
          borderRadius: 12,
          backgroundColor: "#1F2A44",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <Text style={{ fontSize: 28 }}>{icon}</Text>
      </View>
      <Text
        style={{
          fontSize: 11,
          fontWeight: "500",
          color: "#333",
          textAlign: "center",
        }}
      >
        {label}
      </Text>
    </View>
  );
};
