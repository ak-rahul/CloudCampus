import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getFirestore, collection, doc, getDocs, orderBy, query } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

export default function AnalyseAssignment() {
  const { id, classroomId } = useLocalSearchParams();
  const router = useRouter();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const db = getFirestore();

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const submissionsRef = collection(db, 'assignments', id as string, 'submissions');
        const q = query(submissionsRef, orderBy('submittedAt', 'asc'));
        const querySnapshot = await getDocs(q);
        const fetchedSubmissions = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSubmissions(fetchedSubmissions);
      } catch (error) {
        console.error('Error fetching submissions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <FlatList
        data={submissions}
        renderItem={({ item }) => (
          <View style={styles.submissionCard}>
            <Text style={styles.submissionTitle}>{item.submittedBy}</Text>
            <Text style={styles.submissionTime}>
              Submitted At: {item.submittedAt.toDate().toLocaleString()}
            </Text>
            <TouchableOpacity
              style={styles.viewButton}
              onPress={() => console.log(`View Submission for ${item.submittedBy}`)}
            >
              <Ionicons name="eye-outline" size={18} color="#fff" />
              <Text style={styles.viewText}>View</Text>
            </TouchableOpacity>
          </View>
        )}
        keyExtractor={(item) => item.id}
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
  submissionCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  submissionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
  },
  submissionTime: {
    color: '#555',
    marginTop: 6,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007BFF',
    padding: 8,
    borderRadius: 6,
    marginTop: 10,
  },
  viewText: {
    color: '#fff',
    marginLeft: 6,
  },
});
