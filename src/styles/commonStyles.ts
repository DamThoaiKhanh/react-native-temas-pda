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
    fontSize: constances.fontSize.base,
  },
  card: {
    backgroundColor: constances.colors.surface,
    borderRadius: constances.radius["3xl"],
    padding: 16,
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cardSelected: {
    backgroundColor: constances.colors.surfaceSelected,
    borderColor: constances.colors.primaryBorder,
    borderWidth: 1,
  },
  title: {
    fontSize: constances.fontSize.base,
    fontWeight: "700",
    marginBottom: 6,
  },
  cardSub: {
    fontSize: constances.fontSize.md,
    color: constances.colors.textSecondary,
    marginBottom: 2,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: "#fff",
    fontSize: constances.fontSize.xs,
    fontWeight: "700",
  },
  detailLabel: {
    fontWeight: "700",
    fontSize: 16,
    color: "#333",
  },
  expandBtnContainer: {
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
  },
  expandBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: constances.fontSize.lg,
  },
  floatingActionBtn: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: constances.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
  },
});
