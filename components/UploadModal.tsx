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
import * as FileSystem from "expo-file-system";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFirestore, collection, addDoc, Timestamp } from "firebase/firestore";
import { useRouter, useLocalSearchParams } from "expo-router";

import { COLAB_SERVER_URL } from "../constants/constants";

interface UploadModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectOption: (option: "file") => void;
}

const UploadModal: React.FC<UploadModalProps> = ({
  visible,
  onClose,
  onSelectOption,
}) => {
  const router = useRouter();
  const { classroomId, assignmentId } = useLocalSearchParams();
  const [loading, setLoading] = useState<boolean>(false);

  const handleFilePress = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
      });

      if (result.canceled || !result.assets?.[0]?.uri) return;

      const fileUri = result.assets[0].uri;
      console.log("Selected file URI:", fileUri);

      setLoading(true);

      const txtUri = await sendPdfToColab(fileUri);
      if (txtUri) {
        await uploadTxtToFirebase(txtUri);
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
      const file = {
        uri: pdfUri,
        type: "application/pdf",
        name: fileName,
      };

      const formData = new FormData();
      formData.append("file", file as any);

      const response = await fetch(`${COLAB_SERVER_URL}/upload`, {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to receive response from server");

      const textContent = await response.text(); // ✅ FIX: get text directly
      const txtPath = FileSystem.documentDirectory + "handwritten_result.txt";

      await FileSystem.writeAsStringAsync(txtPath, textContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      return txtPath;
    } catch (err) {
      console.error("Colab upload error:", err);
      return null;
    }
  };

  const uploadTxtToFirebase = async (txtUri: string) => {
    try {
      const response = await fetch(txtUri);
      const blob = await response.blob();
      const fileName = `submission_${Date.now()}.txt`;

      const storage = getStorage();
      const fileRef = ref(storage, `submissions/${fileName}`);
      await uploadBytes(fileRef, blob);
      const downloadURL = await getDownloadURL(fileRef);

      const db = getFirestore();
      await addDoc(collection(db, "submissions"), {
        submittedAt: Timestamp.now(),
        fileUrl: downloadURL,
        fileName,
        fileType: "text/plain",
        classroomId,
        assignmentId,
      });

      Alert.alert("Success", "Text file submitted successfully.");
    } catch (error) {
      console.error("Firebase Upload Error:", error);
      Alert.alert("Error", "Failed to upload to Firebase.");
    }
  };

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
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon name="close" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Upload Assignment</Text>

          <TouchableOpacity style={styles.optionButton} onPress={handleScannerPress}>
            <Text style={styles.optionText}>Scan and Upload as PDF</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionButton} onPress={handleFilePress}>
            <Text style={styles.optionText}>Upload from Files</Text>
          </TouchableOpacity>

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
