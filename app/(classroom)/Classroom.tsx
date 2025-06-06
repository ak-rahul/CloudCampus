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
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  onSnapshot,
  setDoc,
  Timestamp,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as DocumentPicker from 'expo-document-picker';
import UploadModal from '../../components/UploadModal';
import AssignmentBox from '../../components/AssignmentBox';
import AssignmentModal from '../../components/AssignmentModal';

export default function Classroom() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [classroom, setClassroom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCreator, setIsCreator] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [submittedAssignments, setSubmittedAssignments] = useState(new Set());
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [assignmentModalVisible, setAssignmentModalVisible] = useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);

  const db = getFirestore();
  const auth = getAuth();

  useEffect(() => {
    if (!id) return;

    const fetchClassroom = async () => {
      const classroomRef = doc(db, 'classrooms', id);
      const classroomDoc = await getDoc(classroomRef);

      if (classroomDoc.exists()) {
        const data = { id: classroomDoc.id, ...classroomDoc.data() };
        setClassroom(data);
        if (auth.currentUser?.email === data.createdBy) {
          setIsCreator(true);
        }
      }

      setLoading(false);
    };

    const unsubscribe = onSnapshot(collection(db, 'classrooms', id, 'assignments'), async (snapshot) => {
      const fetched = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      // Sort assignments by dueDate in descending order
      const sortedAssignments = fetched.sort((a, b) => b.dueDate?.toDate() - a.dueDate?.toDate());
      setAssignments(sortedAssignments);

      const currentUser = auth.currentUser;
      const submitted = new Set();
      for (const snap of snapshot.docs) {
        const submissionRef = doc(db, snap.id, currentUser.email);
        const submissionDoc = await getDoc(submissionRef);
        if (submissionDoc.exists()) submitted.add(snap.id);
      }
      setSubmittedAssignments(submitted);
    });

    fetchClassroom();
    return () => unsubscribe();
  }, [id]);

  const openUploadModal = (assignmentId) => {
    setSelectedAssignmentId(assignmentId);
    setUploadModalVisible(true);
  };

  const handleUploadOption = async (option) => {
    setUploadModalVisible(false);
    if (!selectedAssignmentId) return;

    if (option === 'scanner') {
      router.push(`/scanner?assignmentId=${selectedAssignmentId}&classroomId=${id}`);
    } else if (option === 'file') {
      try {
        const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
        if (result.canceled) return;

        const file = result.assets[0];
        const response = await fetch(file.uri);
        const blob = await response.blob();

        const storage = getStorage();
        const storageRef = ref(storage, `submissions/${id}/${selectedAssignmentId}/${auth.currentUser?.uid}_${file.name}`);
        await uploadBytes(storageRef, blob);

        const downloadURL = await getDownloadURL(storageRef);
        const submissionRef = doc(db, selectedAssignmentId, auth.currentUser?.email);
        await setDoc(submissionRef, {
          submittedAt: Timestamp.now(),
          downloadURL,
          fileName: file.name,
          submittedBy: auth.currentUser?.email,
        });

        Alert.alert('Success', 'Document uploaded successfully!');
        setSubmittedAssignments((prev) => new Set(prev.add(selectedAssignmentId)));
      } catch (err) {
        console.error(err);
        Alert.alert('Error', 'Failed to upload document');
      }
    }
  };

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color="#007BFF" /></View>;
  }

  if (!classroom) {
    return <View style={styles.centered}><Text>Classroom not found</Text></View>;
  }

  return (
    <View style={styles.wrapper}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.classTitle}>{classroom.name}</Text>
          <Text style={styles.classSubtitle}>{classroom.description || 'No description'}</Text>

          {/* Cards for classroom code and created by */}
          <View style={styles.cardContainer}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Classroom Code</Text>
              <Text style={styles.cardContent}>{classroom.code}</Text>
              <TouchableOpacity
                style={styles.copyButton}
                onPress={() => {
                  Clipboard.setString(classroom.code);
                  Alert.alert('Success', 'Classroom code copied to clipboard!');
                }}
              >
                <Ionicons name="copy" size={24} color="#6200EE" />
              </TouchableOpacity>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Created By</Text>
              <Text style={styles.cardContent}>{classroom.createdBy}</Text>
            </View>
          </View>
        </View>

        <View style={styles.assignmentSection}>
          <Text style={styles.sectionTitle}>Assignments</Text>
          {assignments.length === 0 ? (
            <Text style={styles.noAssignments}>No assignments created yet.</Text>
          ) : (
            assignments.map((assignment) => {
              const isSubmitted = submittedAssignments.has(assignment.id);
              const canSubmit = !isCreator && assignment.dueDate?.toDate() > new Date();

              return (
                <AssignmentBox
                  key={assignment.id}
                  assignment={assignment}
                  isCreator={isCreator}
                  isSubmitted={isSubmitted}
                  canSubmit={canSubmit}
                  onUploadClick={() => openUploadModal(assignment.id)}
                  classroomId={id}
                />
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      {isCreator && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setAssignmentModalVisible(true)}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      )}

      {/* Modals */}
      <UploadModal
        visible={uploadModalVisible}
        onClose={() => setUploadModalVisible(false)}
        onSelectOption={handleUploadOption}
        classroomId={id}
        assignmentId={selectedAssignmentId}
      />

      <AssignmentModal
        visible={assignmentModalVisible}
        onClose={() => setAssignmentModalVisible(false)}
        classroomId={id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#fff' },
  container: { padding: 20 },
  header: { alignItems: 'center', marginBottom: 20, backgroundColor: '#6200EE', padding: 15, borderRadius: 10 },
  backButton: { position: 'absolute', left: 10, top: 10 },
  classTitle: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  classSubtitle: { fontSize: 16, color: '#ddd' },
  cardContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, width: '100%' },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 8, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 5, width: '48%' },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  cardContent: { fontSize: 14, color: '#777' },
  assignmentSection: { marginTop: 20, marginBottom: 30 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold' },
  noAssignments: { fontSize: 16, color: '#777' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#6200EE',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
  },
  copyButton: {
    marginTop: 10,
    padding: 8,
    borderRadius: 5,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
  },
});
