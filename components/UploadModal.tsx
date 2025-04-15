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
import {
  getFirestore,
  setDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useRouter } from "expo-router";

import { COLAB_SERVER_URL } from "../constants/constants";

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
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

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

      const txtUri = await sendPdfToColab(fileUri);
      if (txtUri) {
        await uploadTxtToFirebase(txtUri);
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

      const textContent = await response.text();
      if (!textContent) {
        Alert.alert("Processing Error", "Received empty content from server.");
        return null;
      }

      const txtPath = FileSystem.documentDirectory + "handwritten_result.txt";

      await FileSystem.writeAsStringAsync(txtPath, textContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      return txtPath;
    } catch (err) {
      console.error("Colab upload error:", err);
      Alert.alert("Processing Error", "Failed to process the PDF.");
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
  
      if (!classroomId || !assignmentId) {
        Alert.alert("Missing Parameters", "Classroom ID or Assignment ID is missing.");
        return;
      }
  
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
        downloadURL,
      });
  
      Alert.alert("Success", "File submitted successfully.", [
        {
          text: "OK",
          onPress: () => {
            router.push(`/classroom/${classroomId}`);
          },
        },
      ]);
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
        classroomId,
        assignmentId,
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

          {submitted ? (
            <Text style={styles.submissionMessage}>
              You have already submitted your file.
            </Text>
          ) : (
            <>
              <TouchableOpacity
                style={styles.optionButton}
                onPress={handleScannerPress}
                disabled={loading}
              >
                <Text style={styles.optionText}>Scan and Upload as PDF</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.optionButton}
                onPress={handleFilePress}
                disabled={loading}
              >
                <Text style={styles.optionText}>Upload from Files</Text>
              </TouchableOpacity>
            </>
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
