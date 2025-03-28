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
  getDocs,
} from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as DocumentPicker from 'expo-document-picker';
import AssignmentModal from '../../components/AssignmentModal';

export default function Classroom() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [classroom, setClassroom] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isCreator, setIsCreator] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [submittedAssignments, setSubmittedAssignments] = useState<Set<string>>(new Set());

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

        // Fetch submitted assignments for current user
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

  const handleUploadDocument = async (assignmentId: string) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });

      if (result.canceled) return;

      const file = result.assets[0];
      const response = await fetch(file.uri);
      const blob = await response.blob();

      const storage = getStorage();
      const storageRef = ref(
        storage,
        `submissions/${id}/${assignmentId}/${auth.currentUser?.uid}_${file.name}`
      );

      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);

      const submissionRef = doc(
        db,
        'classrooms',
        id as string,
        'assignments',
        assignmentId,
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
      setSubmittedAssignments((prev) => new Set(prev.add(assignmentId)));
    } catch (err) {
      console.error('Upload failed:', err);
      Alert.alert('Error', 'Failed to upload document');
    }
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
                      onPress={() => handleUploadDocument(assignment.id)}
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
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  container: { flex: 1, backgroundColor: '#f6f6f6' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    backgroundColor: '#3f51b5',
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: { position: 'absolute', top: 20, left: 15, zIndex: 1 },
  classTitle: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: 10,
  },
  classSubtitle: { color: '#e0e0e0', fontSize: 16, marginTop: 5 },
  infoSection: { paddingHorizontal: 20, paddingTop: 20 },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    elevation: 2,
  },
  infoTitle: { fontSize: 14, color: '#555', marginBottom: 5 },
  infoValue: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  assignmentSection: { paddingHorizontal: 20, marginTop: 10, marginBottom: 40 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  noAssignments: { color: '#777', fontStyle: 'italic' },
  assignmentCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
  },
  assignmentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#3f51b5',
  },
  assignmentDescription: { color: '#555', marginBottom: 5 },
  assignmentDueDate: { fontSize: 13, color: '#888' },
  fabContainer: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    backgroundColor: '#3f51b5',
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    elevation: 5,
  },
  fabText: { color: '#fff', fontSize: 16, fontWeight: '600', marginLeft: 10 },
  uploadButton: {
    marginTop: 10,
    backgroundColor: '#4caf50',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  uploadText: { color: '#fff', marginLeft: 6, fontWeight: 'bold' },
});
