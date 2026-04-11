import { StyleSheet } from "react-native";

export const headerStyles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: "700",
  },
});
