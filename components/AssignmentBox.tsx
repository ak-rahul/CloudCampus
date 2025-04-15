import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AnalyseAssignmentModal from '../components/AnalyseAssignmentModal'; // adjust path if needed

const AssignmentBox = ({
  assignment,
  classroomId,
  isCreator,
  isSubmitted,
  canSubmit,
  onUploadClick,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const openModal = () => setIsModalVisible(true);
  const closeModal = () => setIsModalVisible(false);

  return (
    <View style={styles.box}>
      <Text style={styles.title}>{assignment.title}</Text>
      <Text style={styles.description}>{assignment.description || 'No description'}</Text>
      <Text style={styles.dueDate}>
        Due: {assignment.dueDate?.toDate().toLocaleString() || 'N/A'}
      </Text>

      {!isCreator && canSubmit && (
        <TouchableOpacity style={styles.button} onPress={onUploadClick}>
          <Ionicons name="cloud-upload" size={20} color="#fff" />
          <Text style={styles.buttonText}>Upload</Text>
        </TouchableOpacity>
      )}

      {isCreator && (
        <TouchableOpacity style={styles.analyseButton} onPress={openModal}>
          <Ionicons name="analytics" size={20} color="#fff" />
          <Text style={styles.buttonText}>Analyse</Text>
        </TouchableOpacity>
      )}

      <AnalyseAssignmentModal
        visible={isModalVisible}
        onClose={closeModal}
        assignment={assignment}
        classroomId={classroomId}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginVertical: 10,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  description: {
    marginTop: 6,
    color: '#555',
  },
  dueDate: {
    marginTop: 6,
    fontSize: 14,
    color: '#888',
  },
  button: {
    marginTop: 10,
    backgroundColor: '#007BFF',
    flexDirection: 'row',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  analyseButton: {
    marginTop: 10,
    backgroundColor: '#28A745',
    flexDirection: 'row',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '600',
  },
});

export default AssignmentBox;
