import { View, Text } from "react-native";

export const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) => {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
      }}
    >
      <Text style={{ fontSize: 20, marginRight: 14, width: 30 }}>{icon}</Text>
      <View>
        <Text style={{ fontSize: 12, color: "#888" }}>{label}</Text>
        <Text style={{ fontSize: 16, fontWeight: "500", marginTop: 2 }}>
          {value}
        </Text>
      </View>
    </View>
  );
};
