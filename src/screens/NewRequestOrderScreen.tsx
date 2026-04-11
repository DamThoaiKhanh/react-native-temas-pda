import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  TextInput,
} from "react-native";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useAuthStore, useOrderStore, useNotificationStore } from "../stores";
import { RequestOrder } from "../models";
import { commonStyles } from "@/styles/commonStyles";
import { settingsStyles } from "@/styles/settingsStyles";

export default function NewRequestOrderScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const existing: RequestOrder | undefined = route.params?.order;

  const { user } = useAuthStore();
  const {
    availableTasks,
    isLoading,
    fetchAvailableTasks,
    addRequestOrder,
    updateRequestOrder,
  } = useOrderStore();
  const addNotification = useNotificationStore((s) => s.addNotification);

  const [taskId, setTaskId] = useState(existing?.taskId ?? "");
  const [taskName, setTaskName] = useState(existing?.taskName ?? "");
  const [priority, setPriority] = useState(existing?.priority ?? "0");
  const [loading, setLoading] = useState(true);

  const priorities = Array.from({ length: 11 }, (_, i) => String(i));

  useEffect(() => {
    fetchAvailableTasks().finally(() => setLoading(false));
  }, []);

  const save = async () => {
    if (!taskId || !user) {
      Alert.alert("Error", "Please select a task");
      return;
    }
    if (existing) {
      await updateRequestOrder(user.account, existing.id, {
        ...existing,
        taskId,
        taskName,
        priority,
      });
      Alert.alert("Success", "Order updated");
    } else {
      const newOrder: RequestOrder = {
        // id: Math.random().toString(36).slice(2),
        id: uuidv4(),
        taskId,
        taskName,
        priority,
        createdAt: new Date().toISOString(),
      };
      // console.log("Adding new order:", JSON.stringify(newOrder));
      await addRequestOrder(user.account, newOrder);
      await addNotification({
        id: Date.now().toString(),
        title: "New Request Order",
        message: "A new request order has been created.",
        type: "info" as any,
        createdAt: new Date().toISOString(),
      });
      Alert.alert("Success", "Order created");
    }
    navigation.goBack();
  };

  if (loading)
    return <ActivityIndicator style={{ flex: 1, justifyContent: "center" }} />;

  return (
    <ScrollView contentContainerStyle={{ padding: 24 }}>
      <Text style={[commonStyles.title, { marginBottom: 16 }]}>
        Task Selection
      </Text>

      <Text style={commonStyles.detailLabel}>Select Task</Text>
      <ScrollView style={settingsStyles.picker} nestedScrollEnabled>
        {availableTasks.map((task) => (
          <TouchableOpacity
            key={task.taskId}
            style={[
              settingsStyles.pickerItem,
              taskId === task.taskId && settingsStyles.pickerItemSelected,
            ]}
            onPress={() => {
              setTaskId(task.taskId);
              setTaskName(task.taskName);
            }}
          >
            <Text style={{ color: taskId === task.taskId ? "#fff" : "#333" }}>
              {task.taskId}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={[commonStyles.detailLabel, { marginTop: 16 }]}>
        Select Priority
      </Text>
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 8,
          marginBottom: 16,
        }}
      >
        {priorities.map((priority) => (
          <TouchableOpacity
            key={priority}
            style={[
              settingsStyles.priItem,
              priority === priority && settingsStyles.priItemSelected,
            ]}
            onPress={() => setPriority(priority)}
          >
            <Text style={{ color: priority === priority ? "#fff" : "#333" }}>
              {priority}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {taskName ? (
        <View style={settingsStyles.preview}>
          <Text style={commonStyles.title}>Task Name: {taskName}</Text>
          <Text style={commonStyles.cardSub}>Task ID: {taskId}</Text>
          <Text style={commonStyles.cardSub}>Priority: {priority}</Text>
        </View>
      ) : null}

      <TouchableOpacity
        style={[settingsStyles.saveBtn, { marginTop: 24 }]}
        onPress={save}
      >
        <Text style={settingsStyles.saveBtnText}>SAVE</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={settingsStyles.clearBtn}
        onPress={() => {
          setTaskId("");
          setTaskName("");
          setPriority("0");
        }}
      >
        <Text style={settingsStyles.clearBtnText}>CLEAR</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
