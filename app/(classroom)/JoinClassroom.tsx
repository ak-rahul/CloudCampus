import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { firestore, auth } from '../../firebase/firebaseConfig';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { useRouter } from 'expo-router';

export default function JoinClassroom() {
  const [classroomCode, setClassroomCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleJoinClassroom = async () => {
    if (!classroomCode.trim()) {
      Alert.alert('Error', 'Classroom code is required!');
      return;
    }

    setIsLoading(true);

    try {
      // Reference to the classroom
      const classroomRef = doc(firestore, 'classrooms', classroomCode);
      const classroomSnap = await getDoc(classroomRef);

      if (!classroomSnap.exists()) {
        Alert.alert('Error', 'Invalid classroom code!');
        return;
      }

      // Update the classroom's students array
      await updateDoc(classroomRef, {
        students: arrayUnion(auth.currentUser.uid),
      });

      // Update the student's "joinedClassrooms" array in user-info
      const studentRef = doc(firestore, 'user-info', auth.currentUser.uid);
      await updateDoc(studentRef, {
        joinedClassrooms: arrayUnion(classroomCode),
      });

      Alert.alert('Success', 'You have joined the classroom!');
      router.push('/dashboard'); // Navigate to dashboard or another page
    } catch (error) {
      console.error('Error joining classroom: ', error);
      Alert.alert('Error', 'Could not join the classroom. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Join a Classroom</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Classroom Code"
        value={classroomCode}
        onChangeText={setClassroomCode}
      />
      <TouchableOpacity style={styles.button} onPress={handleJoinClassroom} disabled={isLoading}>
        {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Join Classroom</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 15 },
  button: { backgroundColor: '#28A745', padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
