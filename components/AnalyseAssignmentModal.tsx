import React, { useState, useEffect } from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, ActivityIndicator, FlatList, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

interface AnalyseAssignmentModalProps {
  visible: boolean;
  onClose: () => void;
  assignment: any; // Replace with more specific type if available
  classroomId: string;
  loading?: boolean;
}

const AnalyseAssignmentModal: React.FC<AnalyseAssignmentModalProps> = ({
  visible,
  onClose,
  assignment,
  classroomId,
  loading = false,
}) => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const assignmentId = assignment["id"];

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, assignmentId));
        const docs: any[] = [];
        
        querySnapshot.forEach((doc) => {
          docs.push({ id: doc.id, ...doc.data() });
        });

        setDocuments(docs);
      } catch (error) {
        console.error('Error fetching documents: ', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (visible) {
      fetchDocuments();
    }
  }, [visible, assignmentId]);

  const renderMetaData = (metaDoc: any) => {
    return (
      <View key={metaDoc.id} style={styles.card}>
        <Text style={styles.cardTitle}>Meta Data</Text>
        <Text>Assignment ID: {metaDoc.assignmentId}</Text>
        <Text>Classroom ID: {metaDoc.classroomId}</Text>
        <Text>Created At: {metaDoc.createdAt ? new Date(metaDoc.createdAt).toLocaleString() : 'N/A'}</Text>
      </View>
    );
  };

  const renderOtherDocuments = ({ item }: { item: any }) => {
    return (
      <View key={item.id} style={styles.tableRow}>
        <Text style={styles.tableCell}>{item.email}</Text>
        <Text style={styles.tableCell}>{item.submittedAt ? new Date(item.submittedAt).toLocaleString() : 'N/A'}</Text>
      </View>
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return <ActivityIndicator size="large" color="#007BFF" />;
    }

    if (documents.length === 0) {
      return <Text style={styles.noDataText}>No submissions</Text>;
    }

    const metaDoc = documents.find(doc => doc.id === 'meta');

    const filteredDocuments = documents.filter(doc => doc.id !== 'meta'); // Filter out meta doc

    return (
      <FlatList
        data={[metaDoc, ...filteredDocuments]} // Render meta data first, followed by the rest of the docs
        renderItem={({ item }) => item.id === 'meta' ? renderMetaData(item) : renderOtherDocuments({ item })}
        keyExtractor={(item) => item.id}
      />
    );
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalContent}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close-circle" size={30} color="red" />
        </TouchableOpacity>

        {renderContent()}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
    paddingTop: 50, // Add extra padding to prevent content from overlapping with close button
  },
  closeButton: {
    position: 'absolute',
    top: 20, // Position close button 20px from the top
    right: 10,
    zIndex: 10, // Ensure the button stays above the content
  },
  card: {
    marginBottom: 15,
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  tableCell: {
    flex: 1,
    fontSize: 16,
  },
  noDataText: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
  }
});

export default AnalyseAssignmentModal;
