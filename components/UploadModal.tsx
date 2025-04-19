import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import * as DocumentPicker from "expo-document-picker";
import {
  getFirestore,
  setDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { COLAB_SERVER_URL } from "../constants/constants"; // ← e.g., 'http://<ngrok-url>'

interface UploadModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectOption: (option: "file") => void;
  classroomId: string;
  assignmentId: string;
}

const UploadModal: React.FC<UploadModalProps> = ({
  visible,
  onClose,
  onSelectOption,
  classroomId,
  assignmentId,
}) => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleFilePress = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
      });

      if (result.canceled || !result.assets?.[0]?.uri) {
        Alert.alert("Action Canceled", "No valid file was selected.");
        return;
      }

      const fileUri = result.assets[0].uri;
      setLoading(true);

      const textContent = await sendPdfToColab(fileUri);
      if (textContent) {
        await uploadTextToFirestore(textContent);
        setSubmitted(true);
      } else {
        Alert.alert("Server Error", "Failed to receive processed text.");
      }
    } catch (error) {
      console.error("Upload Error:", error);
      Alert.alert("Upload Error", "An error occurred during file upload.");
    } finally {
      setLoading(false);
    }
  };

  const sendPdfToColab = async (pdfUri: string): Promise<string | null> => {
    try {
      const fileName = pdfUri.split("/").pop() || "document.pdf";
      console.log(fileName, pdfUri);

      const formData = new FormData();
      formData.append("file", {
        uri: pdfUri,
        type: "application/pdf",
        name: fileName,
      } as any);

      const response = await fetch(`${COLAB_SERVER_URL}/upload`, {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to receive response from server");

      const textContent = await response.text();
      return textContent;
    } catch (err) {
      console.error("Colab upload error:", err);
      Alert.alert("Processing Error", "Failed to process the PDF.");
      return null;
    }
  };

  const uploadTextToFirestore = async (textContent: string) => {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser || !currentUser.email) {
      Alert.alert("Authentication Error", "User not logged in.");
      return;
    }

    const db = getFirestore();
    const submissionRef = doc(db, assignmentId, currentUser.email);

    await setDoc(submissionRef, {
      email: currentUser.email,
      submittedAt: Timestamp.now(),
      classroomId,
      assignmentId,
      content: textContent,
    });

    Alert.alert("Success", "File submitted successfully.");
  };

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon name="close" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Upload Assignment</Text>

          {submitted ? (
            <Text style={styles.submissionMessage}>
              You have already submitted your file.
            </Text>
          ) : (
            <TouchableOpacity style={styles.optionButton} onPress={handleFilePress} disabled={loading}>
              <Text style={styles.optionText}>Upload from Files</Text>
            </TouchableOpacity>
          )}

          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.loadingText}>Processing file...</Text>
            </View>
          )}
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
  submissionMessage: {
    fontSize: 16,
    color: "green",
    marginBottom: 20,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  loadingText: {
    marginTop: 10,
    color: "#fff",
    fontSize: 16,
  },
});

export default UploadModal;
