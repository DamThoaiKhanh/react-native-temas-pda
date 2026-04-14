import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import useWsStore from "@/stores/useWsStore";
import { WsConnectionState } from "@/services/websocketService";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";
import { ca } from "zod/locales";

export function HeaderBar({
  title,
  onNotification,
  onSettings,
}: {
  title: string;
  onNotification: () => void;
  onSettings: () => void;
}) {
  const { connectionState } = useWsStore();
  const [showConnectionModal, setShowConnectionModal] = useState(false);

  const isConnected = connectionState === WsConnectionState.Connected;

  const getStatusText = () => {
    switch (connectionState) {
      case WsConnectionState.Connected:
        return "Connected";
      case WsConnectionState.Connecting:
        return "Connecting...";
      case WsConnectionState.Disconnected:
        return "Disconnected";
      case WsConnectionState.Reconnecting:
        return "Reconnecting...";
      default:
        return "Disconnected";
    }
  };

  const getStatusIcon = () => {
    switch (connectionState) {
      case WsConnectionState.Connected:
        return { name: "checkmark-circle-outline", color: "green" };
      case WsConnectionState.Connecting:
        return { name: "reload-circle-outline", color: "orange" };
      case WsConnectionState.Disconnected:
        return { name: "exclamation-circle-outline", color: "red" };
      case WsConnectionState.Reconnecting:
        return { name: "reload-circle-outline", color: "orange" };
    }
  };

  const statusIcon = getStatusIcon();

  return (
    <>
      <View style={hdr.bar}>
        <Text style={hdr.title}>{title}</Text>

        <View style={hdr.actions}>
          <TouchableOpacity
            onPress={() => setShowConnectionModal(true)}
            style={hdr.iconBtn}
          >
            {isConnected ? (
              <Ionicons name="checkmark-circle" size={24} color="green" />
            ) : (
              <Ionicons name="alert-circle-outline" size={24} color="orange" />
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={onNotification} style={hdr.iconBtn}>
            <Ionicons name="notifications" size={24} color="black" />
          </TouchableOpacity>

          <TouchableOpacity onPress={onSettings} style={hdr.iconBtn}>
            <Ionicons name="ellipsis-vertical" size={24} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={showConnectionModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConnectionModal(false)}
      >
        <Pressable
          style={hdr.modalOverlay}
          onPress={() => setShowConnectionModal(false)}
        >
          <Pressable style={hdr.modalCard} onPress={() => {}}>
            <View style={hdr.modalHeader}>
              <Ionicons
                name={statusIcon?.name as any}
                size={28}
                color={statusIcon?.color}
              />
              <Text style={hdr.modalTitle}>Connection Status</Text>
            </View>

            <Text style={hdr.modalStatus}>{getStatusText()}</Text>

            <TouchableOpacity
              style={hdr.closeBtn}
              onPress={() => setShowConnectionModal(false)}
            >
              <Text style={hdr.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const hdr = StyleSheet.create({
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
  actions: {
    flexDirection: "row",
  },
  iconBtn: {
    paddingHorizontal: 6,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    elevation: 4,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  modalStatus: {
    fontSize: 16,
    marginBottom: 20,
  },
  closeBtn: {
    alignSelf: "flex-end",
    backgroundColor: "#111",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  closeBtnText: {
    color: "#fff",
    fontWeight: "600",
  },
});
