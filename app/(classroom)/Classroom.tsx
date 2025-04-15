import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  onSnapshot,
  getDocs,
  setDoc,
  Timestamp,
} from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as DocumentPicker from 'expo-document-picker';
import AssignmentModal from '../../components/AssignmentModal';
import UploadModal from '../../components/UploadModal'; // ✅ NEW

export default function Classroom() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [classroom, setClassroom] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isCreator, setIsCreator] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [submittedAssignments, setSubmittedAssignments] = useState<Set<string>>(new Set());
  const [uploadModalVisible, setUploadModalVisible] = useState(false); // ✅ NEW
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null); // ✅ NEW

  const db = getFirestore();
  const auth = getAuth();

  useEffect(() => {
    const fetchClassroom = async () => {
      try {
        const classroomDoc = await getDoc(doc(db, 'classrooms', id as string));
        if (classroomDoc.exists()) {
          const data = { id: classroomDoc.id, ...classroomDoc.data() };
          setClassroom(data);

          const currentUser = auth.currentUser;
          if (currentUser && currentUser.email === data.createdBy) {
            setIsCreator(true);
          }
        }
      } catch (error) {
        console.error('Error loading classroom:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClassroom();

    const unsubscribe = onSnapshot(
      collection(db, 'classrooms', id as string, 'assignments'),
      async (snapshot) => {
        const fetchedAssignments = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAssignments(fetchedAssignments);

        const currentUser = auth.currentUser;
        if (currentUser) {
          const submittedSet = new Set<string>();

          for (const docSnap of snapshot.docs) {
            const assignmentId = docSnap.id;
            const submissionRef = doc(db, assignmentId, currentUser.email);
            const submissionDoc = await getDoc(submissionRef);
            if (submissionDoc.exists()) {
              submittedSet.add(assignmentId);
            }
          }

          setSubmittedAssignments(submittedSet);
        }
      },
      (error) => {
        console.error('Error fetching assignments:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleCreateAssignment = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const openUploadModal = (assignmentId: string) => {
    setSelectedAssignmentId(assignmentId);
    setUploadModalVisible(true);
  };

  const handleUploadOption = async (option: 'scanner' | 'file') => {
    setUploadModalVisible(false);
    if (!selectedAssignmentId) return;

    if (option === 'scanner') {
      router.push(`/scanner?assignmentId=${selectedAssignmentId}&classroomId=${id}`);
      return;
    }

    if (option === 'file') {
      try {
        const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });

        if (result.canceled) return;

        const file = result.assets[0];
        const response = await fetch(file.uri);
        const blob = await response.blob();

        const storage = getStorage();
        const storageRef = ref(
          storage,
          `submissions/${id}/${selectedAssignmentId}/${auth.currentUser?.uid}_${file.name}`
        );

        await uploadBytes(storageRef, blob);
        const downloadURL = await getDownloadURL(storageRef);

        const submissionRef = doc(
          db,
          selectedAssignmentId, // assignment ID as collection name
          auth.currentUser?.email! // user ID as document ID
        );

        await setDoc(submissionRef, {
          submittedAt: Timestamp.now(),
          downloadURL,
          fileName: file.name,
          submittedBy: auth.currentUser?.email,
        });

        Alert.alert('Success', 'Document uploaded successfully!');
        setSubmittedAssignments((prev) => new Set(prev.add(selectedAssignmentId)));
      } catch (err) {
        console.error('Upload failed:', err);
        Alert.alert('Error', 'Failed to upload document');
      }
    }
  };

  const formatDateTime = (timestamp: Timestamp) => {
    const date = timestamp.toDate();
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  };

  const isBeforeDue = (dueDate: Timestamp) => {
    const now = new Date();
    return dueDate.toDate() > now;
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  if (!classroom) {
    return (
      <View style={styles.centered}>
        <Text>Classroom not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.classTitle}>{classroom.name}</Text>
          <Text style={styles.classSubtitle}>
            {classroom.description || 'No description'}
          </Text>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Class Code</Text>
            <Text style={styles.infoValue}>{classroom.code}</Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Created By</Text>
            <Text style={styles.infoValue}>{classroom.createdBy}</Text>
          </View>
        </View>

        <View style={styles.assignmentSection}>
          <Text style={styles.sectionTitle}>Assignments</Text>
          {assignments.length === 0 ? (
            <Text style={styles.noAssignments}>No assignments created yet.</Text>
          ) : (
            assignments.map((assignment) => {
              const isSubmitted = submittedAssignments.has(assignment.id);
              const canSubmit =
                !isCreator && assignment.dueDate && isBeforeDue(assignment.dueDate);

              return (
                <View key={assignment.id} style={styles.assignmentCard}>
                  <Text style={styles.assignmentTitle}>{assignment.title}</Text>
                  {assignment.description && (
                    <Text style={styles.assignmentDescription}>
                      {assignment.description}
                    </Text>
                  )}
                  {assignment.dueDate && (
                    <Text style={styles.assignmentDueDate}>
                      Due: {formatDateTime(assignment.dueDate)}
                    </Text>
                  )}

                  {isSubmitted ? (
                    <Text style={{ marginTop: 8, color: '#4caf50', fontWeight: 'bold' }}>
                      Submitted
                    </Text>
                  ) : canSubmit ? (
                    <TouchableOpacity
                      style={styles.uploadButton}
                      onPress={() => openUploadModal(assignment.id)}
                    >
                      <Ionicons name="cloud-upload-outline" size={18} color="#fff" />
                      <Text style={styles.uploadText}>Upload Document</Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={{ marginTop: 8, color: '#d32f2f', fontWeight: 'bold' }}>
                      Submission Closed
                    </Text>
                  )}
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {isCreator && (
        <TouchableOpacity style={styles.fabContainer} onPress={handleCreateAssignment}>
          <Ionicons name="document-text-outline" size={24} color="#fff" />
          <Text style={styles.fabText}>Create Assignment</Text>
        </TouchableOpacity>
      )}

      <AssignmentModal
        visible={showModal}
        onClose={handleCloseModal}
        classroomId={id as string}
      />

      <UploadModal
        visible={uploadModalVisible}
        onClose={() => setUploadModalVisible(false)}
        onSelectOption={handleUploadOption}
        classroomId={id as string} // classroom ID
        assignmentId={selectedAssignmentId} // assignment ID
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#007BFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  backButton: {
    marginBottom: 8,
  },
  classTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  classSubtitle: {
    fontSize: 14,
    color: '#fff',
    marginTop: 4,
  },
  infoSection: {
    marginBottom: 20,
  },
  infoCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  infoTitle: {
    fontWeight: 'bold',
    color: '#555',
  },
  infoValue: {
    fontSize: 16,
    color: '#000',
  },
  assignmentSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  noAssignments: {
    color: '#999',
    fontStyle: 'italic',
  },
  assignmentCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  assignmentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
  },
  assignmentDescription: {
    marginTop: 6,
    color: '#444',
  },
  assignmentDueDate: {
    marginTop: 6,
    color: '#d32f2f',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4caf50',
    padding: 8,
    borderRadius: 6,
    marginTop: 10,
  },
  uploadText: {
    color: '#fff',
    marginLeft: 6,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#007BFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
  },
  fabText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: 'bold',
  },
});
