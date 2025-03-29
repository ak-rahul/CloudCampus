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
  Timestamp,
  setDoc,
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
            const submissionRef = doc(
              db,
              'classrooms',
              id as string,
              'assignments',
              docSnap.id,
              'submissions',
              currentUser.uid
            );
            const submissionDoc = await getDoc(submissionRef);
            if (submissionDoc.exists()) {
              submittedSet.add(docSnap.id);
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
          'classrooms',
          id as string,
          'assignments',
          selectedAssignmentId,
          'submissions',
          auth.currentUser?.uid!
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

                  {canSubmit && !isSubmitted && (
                    <TouchableOpacity
                      style={styles.uploadButton}
                      onPress={() => openUploadModal(assignment.id)}
                    >
                      <Ionicons name="cloud-upload-outline" size={18} color="#fff" />
                      <Text style={styles.uploadText}>Upload Document</Text>
                    </TouchableOpacity>
                  )}

                  {canSubmit && isSubmitted && (
                    <Text style={{ marginTop: 8, color: '#4caf50', fontWeight: 'bold' }}>
                      Document Submitted
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

      {/* ✅ Upload Modal */}
      <UploadModal
        visible={uploadModalVisible}
        onClose={() => setUploadModalVisible(false)}
        onSelectOption={handleUploadOption}
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
    fontSize: 16,
    color: '#e0e0e0',
    marginTop: 4,
  },
  infoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 4,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  assignmentSection: {
    marginBottom: 80,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  noAssignments: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 10,
  },
  assignmentCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },
  assignmentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#007BFF',
  },
  assignmentDescription: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
  },
  assignmentDueDate: {
    fontSize: 13,
    color: '#d32f2f',
  },
  uploadButton: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 8,
  },
  uploadText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: 'bold',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#007BFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 30,
    elevation: 5,
  },
  fabText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
