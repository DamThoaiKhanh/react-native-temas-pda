import React, { useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useNotificationStore } from "../stores";
import { formatDate } from "../components/utils";

export default function NotificationScreen() {
  const {
    notifications,
    selectedIds,
    isSelectionMode,
    isSelectAll,
    loadNotifications,
    deleteNotification,
    toggleSelectionMode,
    toggleNotificationSelection,
    selectAll,
    unselectAll,
    deleteSelected,
    clearAll,
  } = useNotificationStore();

  useEffect(() => {
    loadNotifications();
  }, []);

  const notifColor = (type: string) =>
    (
      ({
        info: "#2563EB",
        warning: "#D97706",
        error: "#DC2626",
      }) as const
    )[type] ?? "#64748B";

  const notifIcon = (type: string): keyof typeof Ionicons.glyphMap => {
    const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
      info: "information-circle",
      warning: "warning",
      error: "close-circle",
    };

    return icons[type] ?? "information-circle";
  };

  return (
    <View style={styles.container}>
      <View style={styles.toolbarWrap}>
        {isSelectionMode ? (
          <View style={styles.toolbar}>
            <View style={styles.toolbarLeft}>
              <Text style={styles.selectedText}>
                {selectedIds.size} selected
              </Text>

              <TouchableOpacity
                onPress={isSelectAll ? unselectAll : selectAll}
                style={styles.selectAllBtn}
                activeOpacity={0.85}
              >
                <Text style={styles.selectAllText}>
                  {isSelectAll ? "Unselect All" : "Select All"}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.toolbarRight}>
              <TouchableOpacity
                onPress={deleteSelected}
                disabled={selectedIds.size === 0}
                style={[
                  styles.deleteBtn,
                  selectedIds.size === 0 && styles.deleteBtnDisabled,
                ]}
                activeOpacity={0.85}
              >
                <Ionicons
                  name="trash-outline"
                  size={16}
                  color={selectedIds.size === 0 ? "#94A3B8" : "#DC2626"}
                />
                <Text
                  style={[
                    styles.deleteBtnText,
                    selectedIds.size === 0 && styles.deleteBtnTextDisabled,
                  ]}
                >
                  Delete
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={toggleSelectionMode}
                style={styles.closeModeBtn}
                activeOpacity={0.85}
              >
                <Ionicons name="close" size={18} color="#475569" />
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons
              name="notifications-off-outline"
              size={56}
              color="#94A3B8"
            />
            <Text style={styles.emptyTitle}>No notifications</Text>
            <Text style={styles.emptySub}>You’re all caught up.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const isSelected = selectedIds.has(item.id);
          const iconColor = notifColor(item.type);

          return (
            <TouchableOpacity
              style={[styles.card, isSelected && styles.cardSelected]}
              onPress={() =>
                isSelectionMode && toggleNotificationSelection(item.id)
              }
              onLongPress={() => {
                if (!isSelectionMode) {
                  toggleSelectionMode();
                  toggleNotificationSelection(item.id);
                }
              }}
              activeOpacity={0.9}
            >
              <View style={styles.cardRow}>
                {isSelectionMode && (
                  <TouchableOpacity
                    onPress={() => toggleNotificationSelection(item.id)}
                    style={[
                      styles.checkbox,
                      isSelected && styles.checkboxChecked,
                    ]}
                    activeOpacity={0.8}
                  >
                    {isSelected && (
                      <Ionicons name="checkmark" size={14} color="#fff" />
                    )}
                  </TouchableOpacity>
                )}

                <View
                  style={[
                    styles.iconWrap,
                    { backgroundColor: iconColor + "18" },
                  ]}
                >
                  <Ionicons
                    name={notifIcon(item.type)}
                    size={22}
                    color={iconColor}
                  />
                </View>

                <View style={styles.textWrap}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardMessage} numberOfLines={3}>
                    {item.message}
                  </Text>
                  <Text style={styles.cardDate}>
                    {formatDate(item.createdAt)}
                  </Text>
                </View>

                {!isSelectionMode && (
                  <TouchableOpacity
                    onPress={() => deleteNotification(item.id)}
                    style={styles.itemDeleteBtn}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="close" size={18} color="#94A3B8" />
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {notifications.length > 0 && (
        <TouchableOpacity
          style={styles.clearBtn}
          onPress={() =>
            Alert.alert("Clear All", "Delete all notifications?", [
              { text: "Cancel", style: "cancel" },
              { text: "Clear All", style: "destructive", onPress: clearAll },
            ])
          }
          activeOpacity={0.9}
        >
          <AntDesign name="delete" size={18} color="#fff" />
          <Text style={styles.clearBtnText}>Clear All</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  toolbarWrap: {
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 4,
  },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  toolbarLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexShrink: 1,
  },
  selectedText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#334155",
  },
  selectAllBtn: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  selectAllText: {
    color: "#2563EB",
    fontSize: 14,
    fontWeight: "700",
  },
  toolbarRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  deleteBtnDisabled: {
    backgroundColor: "#F1F5F9",
  },
  deleteBtnText: {
    color: "#DC2626",
    fontSize: 14,
    fontWeight: "700",
  },
  deleteBtnTextDisabled: {
    color: "#94A3B8",
  },
  closeModeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F9",
  },

  listContent: {
    padding: 10,
    paddingBottom: 100,
  },
  emptyWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 90,
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: "700",
    color: "#475569",
  },
  emptySub: {
    marginTop: 4,
    fontSize: 14,
    color: "#94A3B8",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  cardSelected: {
    borderColor: "#2563EB",
    backgroundColor: "#F8FBFF",
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  checkboxChecked: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  textWrap: {
    flex: 1,
    marginLeft: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
  },
  cardMessage: {
    fontSize: 13,
    lineHeight: 19,
    color: "#475569",
  },
  cardDate: {
    marginTop: 8,
    fontSize: 11,
    color: "#94A3B8",
  },
  itemDeleteBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },

  clearBtn: {
    position: "absolute",
    right: 20,
    bottom: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#2563EB",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 999,
    elevation: 6,
  },
  clearBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
});
