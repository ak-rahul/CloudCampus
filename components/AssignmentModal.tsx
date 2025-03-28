import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import Icon from "react-native-vector-icons/MaterialIcons";
import { getFirestore, collection, addDoc, Timestamp } from "firebase/firestore";

interface AssignmentModalProps {
  visible: boolean;
  onClose: () => void;
  classroomId: string;
}

const AssignmentModal: React.FC<AssignmentModalProps> = ({
  visible,
  onClose,
  classroomId,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [mode, setMode] = useState<"date" | "time">("date");

  const db = getFirestore();

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "Assignment title is required.");
      return;
    }

    try {
      await addDoc(collection(db, "classrooms", classroomId, "assignments"), {
        title,
        description,
        dueDate: dueDate ? Timestamp.fromDate(dueDate) : null,
        createdAt: Timestamp.now(),
      });

      Alert.alert("Success", "Assignment created successfully!");
      setTitle("");
      setDescription("");
      setDueDate(null);
      onClose();
    } catch (error) {
      console.error("Error creating assignment:", error);
      Alert.alert("Error", "Failed to create assignment.");
    }
  };

  const showPicker = (pickerMode: "date" | "time") => {
    setMode(pickerMode);
    setShowDatePicker(true);
  };

  const handleDateChange = (_: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDueDate((prevDate) => {
        if (mode === "date") {
          const newDate = new Date(prevDate || selectedDate);
          newDate.setFullYear(
            selectedDate.getFullYear(),
            selectedDate.getMonth(),
            selectedDate.getDate()
          );
          return newDate;
        } else {
          const newDate = new Date(prevDate || new Date());
          newDate.setHours(selectedDate.getHours(), selectedDate.getMinutes());
          return newDate;
        }
      });
    }
  };

  const formatDate = (date: Date) =>
    `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon name="close" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Create Assignment</Text>

          <TextInput
            placeholder="Assignment Title"
            style={styles.input}
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            placeholder="Description (optional)"
            style={[styles.input, styles.multilineInput]}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />

          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => showPicker("date")}
          >
            <Text style={styles.dateButtonText}>
              {dueDate ? `Due: ${formatDate(dueDate)}` : "Set Due Date"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => showPicker("time")}
          >
            <Text style={styles.dateButtonText}>
              {dueDate
                ? `Time: ${dueDate.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}`
                : "Set Due Time"}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={dueDate || new Date()}
              mode={mode}
              is24Hour={false}
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={handleDateChange}
            />
          )}

          <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
            <Text style={styles.createButtonText}>Create</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: "top",
  },
  dateButton: {
    width: "100%",
    padding: 12,
    backgroundColor: "#e0e0e0",
    borderRadius: 8,
    marginBottom: 10,
  },
  dateButtonText: {
    color: "#333",
    fontSize: 15,
  },
  createButton: {
    backgroundColor: "#3f51b5",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginTop: 10,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default AssignmentModal;
