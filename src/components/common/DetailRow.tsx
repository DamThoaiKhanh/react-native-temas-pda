import { View, Text } from "react-native";
import { commonStyles } from "@/styles/commonStyles";

export const DetailRow = ({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) => {
  return (
    <View style={{ flexDirection: "row", paddingVertical: 6 }}>
      <Text style={[commonStyles.detailLabel, { width: 130 }]}>{label}</Text>
      <Text style={{ flex: 1, fontSize: 14 }}>{value ?? "N/A"}</Text>
    </View>
  );
};
