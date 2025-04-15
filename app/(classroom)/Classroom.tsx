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
import UploadModal from '../../components/UploadModal';

export default function Classroom() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [classroom, setClassroom] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isCreator, setIsCreator] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [submittedAssignments, setSubmittedAssignments] = useState<Set<string>>(new Set());
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);

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

  const openAnalyseAssignmentPage = (assignmentId: string) => {
    router.push(`/analyse-assignment?id=${assignmentId}&classroomId=${id}`);
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
          selectedAssignmentId,
          auth.currentUser?.email!
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

                  {isCreator && (
                    <TouchableOpacity
                      style={styles.analyseButton}
                      onPress={() => openAnalyseAssignmentPage(assignment.id)}
                    >
                      <Ionicons name="analytics-outline" size={18} color="#fff" />
                      <Text style={styles.analyseText}>Analyse Assignment</Text>
                    </TouchableOpacity>
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
        classroomId={id as string}
        assignmentId={selectedAssignmentId}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#007BFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 1,
  },
  classTitle: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  classSubtitle: {
    fontSize: 14,
    color: '#fff',
    marginTop: 6,
  },
  infoSection: {
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
  },
  infoValue: {
    fontSize: 14,
    color: '#222',
    marginTop: 6,
  },
  assignmentSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  noAssignments: {
    fontSize: 14,
    color: '#888',
  },
  assignmentCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  assignmentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
  },
  assignmentDescription: {
    fontSize: 14,
    color: '#555',
    marginTop: 6,
  },
  assignmentDueDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 6,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007BFF',
    padding: 8,
    borderRadius: 6,
    marginTop: 10,
  },
  uploadText: {
    color: '#fff',
    marginLeft: 6,
  },
  analyseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007BFF',
    padding: 8,
    borderRadius: 6,
    marginTop: 10,
  },
  analyseText: {
    color: '#fff',
    marginLeft: 6,
  },
  fabContainer: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#007BFF',
    padding: 16,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabText: {
    color: '#fff',
    marginLeft: 6,
  },
});
