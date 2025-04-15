import React, { useState, useEffect } from 'react';
import {
  Modal, View, StyleSheet, TouchableOpacity, ActivityIndicator,
  FlatList, Text, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { COLAB_SERVER_URL } from "../constants/constants";

interface AnalyseAssignmentModalProps {
  visible: boolean;
  onClose: () => void;
  assignment: any;
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
  const [evaluating, setEvaluating] = useState<boolean>(false);
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

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleString();
  };

  const handleEvaluateAll = async () => {
    const filteredDocs = documents.filter(
      doc => doc.id !== 'meta' && doc.email && doc.content
    );

    try {
      setEvaluating(true);

      const payload = filteredDocs.map(doc => ({
        email: doc.email,
        text: doc.content,
      }));

      const response = await fetch(`${COLAB_SERVER_URL}/check-plagiarism`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: payload }),
      });

      const result = await response.json();
      console.log("Plagiarism Results:", result);

      if (!Array.isArray(result) || result.length === 0) {
        Alert.alert("Evaluation Complete", "No plagiarism detected.");
      } else {
        const message = result.map(res =>
          `${res.email} is ${res.status} with ${res.with}\nSimilarity: ${res.percentage}%`
        ).join('\n\n');
        Alert.alert("Plagiarism Results", message);
      }
    } catch (error) {
      console.error("Evaluation error:", error);
      Alert.alert("Error", "Failed to evaluate submissions.");
    } finally {
      setEvaluating(false);
    }
  };

  const renderMetaData = (metaDoc: any) => (
    <View key={metaDoc.id} style={styles.card}>
      <Text style={styles.cardTitle}>Meta Data</Text>
      <Text>Assignment ID: {metaDoc.assignmentId}</Text>
      <Text>Classroom ID: {metaDoc.classroomId}</Text>
      <Text>Created At: {formatDate(metaDoc.createdAt)}</Text>
    </View>
  );

  const renderOtherDocuments = ({ item }: { item: any }) => (
    <View key={item.id} style={styles.tableRow}>
      <View style={styles.tableCellContainer}>
        <Text style={styles.tableCell}>{item.email}</Text>
      </View>
      <View style={styles.tableCellContainer}>
        <Text style={styles.tableCell}>
          {item.submittedAt ? formatDate(item.submittedAt) : 'N/A'}
        </Text>
      </View>
    </View>
  );

  const renderContent = () => {
    if (isLoading || loading) {
      return <ActivityIndicator size="large" color="#007BFF" />;
    }

    if (documents.length === 0) {
      return <Text style={styles.noDataText}>No submissions</Text>;
    }

    const metaDoc = documents.find(doc => doc.id === 'meta');
    const filteredDocuments = documents.filter(doc => doc.id !== 'meta');
    const anyPastDue = filteredDocuments.some(doc => doc.submittedAt?.seconds * 1000 < Date.now());

    return (
      <>
        <FlatList
          data={[metaDoc, ...filteredDocuments]}
          renderItem={({ item }) =>
            item.id === 'meta' ? renderMetaData(item) : renderOtherDocuments({ item })
          }
          keyExtractor={(item) => item.id}
        />

        {anyPastDue && (
          <TouchableOpacity
            style={[styles.evaluateAllButton, evaluating && { opacity: 0.6 }]}
            onPress={handleEvaluateAll}
            disabled={evaluating}
          >
            <Text style={styles.evaluateAllButtonText}>
              {evaluating ? 'Evaluating...' : 'Evaluate All'}
            </Text>
          </TouchableOpacity>
        )}
      </>
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
    paddingTop: 50,
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 10,
    zIndex: 100,
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
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  tableCellContainer: {
    flex: 1,
  },
  tableCell: {
    fontSize: 16,
  },
  noDataText: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
    marginTop: 20,
  },
  evaluateAllButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  evaluateAllButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AnalyseAssignmentModal;
