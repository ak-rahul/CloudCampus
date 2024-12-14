import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Alert } from 'react-native';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

interface ClassroomModalProps {
  visible: boolean;
  onClose: () => void;
  onCreateClass: () => void;
}

const ClassroomModal: React.FC<ClassroomModalProps> = ({ visible, onClose, onCreateClass }) => {
  const [className, setClassName] = useState('');
  const [emailIds, setEmailIds] = useState('');

  const db = getFirestore();

  const handleCreateClass = async () => {
    if (!className || !emailIds) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      await addDoc(collection(db, 'classrooms'), {
        name: className,
        emails: emailIds.split(',').map(email => email.trim()),
        createdAt: new Date(),
      });
      onCreateClass(); // Call the function passed from the parent to close the modal
      Alert.alert('Success', 'Classroom created successfully');
      onClose(); // Close the modal
    } catch (error) {
      console.error('Error creating classroom: ', error);
      Alert.alert('Error', 'Could not create classroom');
    }
  };

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Create a Classroom</Text>
          <TextInput
            style={styles.input}
            placeholder="Classroom Name"
            value={className}
            onChangeText={setClassName}
          />
          <TextInput
            style={styles.input}
            placeholder="Enter email IDs separated by commas"
            value={emailIds}
            onChangeText={setEmailIds}
          />
          <TouchableOpacity style={styles.button} onPress={handleCreateClass}>
            <Text style={styles.buttonText}>Create Classroom</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
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
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    width: '100%',
    padding: 10,
    marginVertical: 10,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
    marginTop: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  closeButton: {
    marginTop: 10,
  },
  closeButtonText: {
    color: '#007BFF',
    fontSize: 16,
  },
});

export default ClassroomModal;
