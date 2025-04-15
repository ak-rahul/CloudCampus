import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getFirestore, doc, getDoc, collection, onSnapshot, setDoc, Timestamp } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as DocumentPicker from 'expo-document-picker';
import UploadModal from '../../components/UploadModal';
import AssignmentBox from '../../components/AssignmentBox';

export default function Classroom() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [classroom, setClassroom] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isCreator, setIsCreator] = useState(false);
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

        <View style={styles.assignmentSection}>
          <Text style={styles.sectionTitle}>Assignments</Text>
          {assignments.length === 0 ? (
            <Text style={styles.noAssignments}>No assignments created yet.</Text>
          ) : (
            assignments.map((assignment) => {
              const isSubmitted = submittedAssignments.has(assignment.id);
              const canSubmit =
                !isCreator && assignment.dueDate && assignment.dueDate.toDate() > new Date();

              return (
                <AssignmentBox
                  key={assignment.id}
                  assignment={assignment}
                  isCreator={isCreator}
                  isSubmitted={isSubmitted}
                  canSubmit={canSubmit}
                  onUploadClick={() => openUploadModal(assignment.id)}
                />
              );
            })
          )}
        </View>
      </ScrollView>

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
    backgroundColor: '#f1f1f1',
  },
  container: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    position: 'absolute',
    left: 10,
    top: 10,
  },
  classTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  classSubtitle: {
    fontSize: 16,
    color: '#555',
  },
  assignmentSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  noAssignments: {
    fontSize: 16,
    color: '#777',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
