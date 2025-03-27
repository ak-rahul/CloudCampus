import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth';
import AssignmentModal from '../../components/AssignmentModal'; // Adjust path if different

export default function Classroom() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [classroom, setClassroom] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isCreator, setIsCreator] = useState(false);
  const [showModal, setShowModal] = useState(false);

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
  }, []);

  const handleCreateAssignment = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
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
  wrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#f6f6f6',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#3f51b5',
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 15,
    zIndex: 1,
  },
  classTitle: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: 10,
  },
  classSubtitle: {
    color: '#e0e0e0',
    fontSize: 16,
    marginTop: 5,
  },
  infoSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
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
  fabText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
});
