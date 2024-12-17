import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { firestore, auth } from "../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

interface OptionsModalProps {
  visible: boolean;
  onClose: () => void;
  onCreateClass: () => void;
  onJoinClass: () => void;
}

const OptionsModal: React.FC<OptionsModalProps> = ({
  visible,
  onClose,
  onCreateClass,
  onJoinClass,
}) => {
  const [role, setRole] = useState<string | null>(null); // 'teacher', 'student', or null
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      setLoading(true);

      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        Alert.alert("Error", "User not logged in.");
        return;
      }

      try {
        const userRef = doc(firestore, "user-info", user.uid); // Reference to user document
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setRole(userData?.role || "unknown"); // Default to 'unknown' if role is missing
        } else {
          console.error("User document not found.");
          setRole("unknown");
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
        Alert.alert("Error", "Failed to fetch user role.");
      } finally {
        setLoading(false);
      }
    };

    if (visible) {
      fetchUserRole();
    } else {
      setRole(null);
      setLoading(true); // Reset state when modal is closed
    }
  }, [visible]);

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
          <Text style={styles.modalTitle}>Choose an Option</Text>

          {loading ? (
            <ActivityIndicator size="large" color="#007BFF" />
          ) : role === "teacher" ? (
            <TouchableOpacity style={styles.optionButton} onPress={onCreateClass}>
              <Text style={styles.optionText}>Create a Class</Text>
            </TouchableOpacity>
          ) : role === "student" ? (
            <TouchableOpacity style={styles.optionButton} onPress={onJoinClass}>
              <Text style={styles.optionText}>Join a Class</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity style={styles.optionButton} onPress={onCreateClass}>
                <Text style={styles.optionText}>Create a Class</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.optionButton} onPress={onJoinClass}>
                <Text style={styles.optionText}>Join a Class</Text>
              </TouchableOpacity>
            </>
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
});

export default OptionsModal;
