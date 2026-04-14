import { StyleSheet } from "react-native";
import * as constances from "./constants";

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: constances.colors.background,
  },
  empty: {
    textAlign: "center",
    marginTop: 60,
    color: constances.colors.textMuted,
    fontSize: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cardSelected: {
    backgroundColor: "#E3F2FD",
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
  },
  cardSub: {
    fontSize: 13,
    color: "#555",
    marginBottom: 2,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  detailLabel: {
    fontWeight: "700",
    fontSize: 16,
    color: "#333",
  },
});
