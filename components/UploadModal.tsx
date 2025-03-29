import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useRouter, useLocalSearchParams } from "expo-router";

interface UploadModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectOption: (option: "file") => void; // Scanner handled by direct navigation
}

const UploadModal: React.FC<UploadModalProps> = ({
  visible,
  onClose,
  onSelectOption,
}) => {
  const router = useRouter();
  const { classroomId, assignmentId } = useLocalSearchParams();

  const handleScannerPress = () => {
    onClose();

    router.push({
      pathname: "/(scanner)/ScannerScreen",
      params: {
        classroomId: classroomId as string,
        assignmentId: assignmentId as string,
      },
    });
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon name="close" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Upload Assignment</Text>

          <TouchableOpacity
            style={styles.optionButton}
            onPress={handleScannerPress}
          >
            <Text style={styles.optionText}>Scan and Upload as PDF</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => {
              onClose();
              onSelectOption("file");
            }}
          >
            <Text style={styles.optionText}>Upload from Files</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  optionButton: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    width: "100%",
    alignItems: "center",
  },
  optionText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default UploadModal;
