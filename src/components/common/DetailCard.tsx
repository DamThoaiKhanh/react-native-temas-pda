import { View, Text } from "react-native";
import { commonStyles } from "../../styles/commonStyles";

export const DetailCard = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  return (
    <View style={commonStyles.card}>
      {title ? (
        <Text style={[commonStyles.title, { fontSize: 18, marginBottom: 8 }]}>
          {title}
        </Text>
      ) : null}
      {title ? (
        <View style={{ height: 1, backgroundColor: "#eee", marginBottom: 8 }} />
      ) : null}
      {children}
    </View>
  );
};
