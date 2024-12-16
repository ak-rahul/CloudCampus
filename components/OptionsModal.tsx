import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

interface OptionsModalProps {
  visible: boolean;
  onClose: () => void;
  onCreateClass: () => void;
  onJoinClass: () => void;
}

const OptionsModal: React.FC<OptionsModalProps> = ({ visible, onClose, onCreateClass, onJoinClass }) => {
  const [role, setRole] = useState<string | null>(null); // Role can be 'teacher', 'student', or null while loading
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible) {
      const fetchUserRole = async () => {
        const user = auth.currentUser;
        if (!user) return;

        try {
          const db = getFirestore();
          const userRef = doc(db, 'user-info', user.uid); // Fetch user info by UID
          const userDoc = await getDoc(userRef);

          if (userDoc.exists()) {
            setRole(userDoc.data()?.role); // Get the user role (teacher/student)
          } else {
            console.error('User document not found');
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchUserRole();
    }
  }, [visible]);

  if (loading) {
    return (
      <Modal
        transparent={true}
        visible={visible}
        animationType="slide"
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ActivityIndicator size="large" color="#007BFF" />
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      transparent={true}
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
          {role === 'teacher' && (
            <TouchableOpacity style={styles.optionButton} onPress={onCreateClass}>
              <Text style={styles.optionText}>Create a Class</Text>
            </TouchableOpacity>
          )}
          {role === 'student' && (
            <TouchableOpacity style={styles.optionButton} onPress={onJoinClass}>
              <Text style={styles.optionText}>Join a Class</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  optionButton: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    width: '100%',
    alignItems: 'center',
  },
  optionText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default OptionsModal;
