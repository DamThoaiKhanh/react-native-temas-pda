import { StyleSheet } from "react-native";

export const settingsStyles = StyleSheet.create({
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: "#1565C0",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#1565C0",
  },
  notifIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  preview: {
    backgroundColor: "#E3F2FD",
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#90CAF9",
  },
  saveBtn: {
    backgroundColor: "#1565C0",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  saveBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  clearBtn: {
    borderWidth: 1,
    borderColor: "#1565C0",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
  },
  clearBtnText: {
    color: "#1565C0",
    fontSize: 16,
  },
  section: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1565C0",
    padding: 16,
    paddingBottom: 8,
  },
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    backgroundColor: "#fff",
  },
});
