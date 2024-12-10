import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

export default function JoinClassroom() {
  const [classCode, setClassCode] = useState('');
  const navigation = useNavigation();
  const db = getFirestore();

  const handleJoinClass = async () => {
    if (!classCode.trim()) {
      Alert.alert('Error', 'Please enter a valid classroom code.');
      return;
    }

    try {
      const classroomsRef = collection(db, 'classrooms');
      const q = query(classroomsRef, where('code', '==', classCode.trim()));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        Alert.alert('Success', 'You have joined the classroom!');
        navigation.goBack();
      } else {
        Alert.alert('Error', 'Classroom code not found.');
      }
    } catch (error) {
      console.error('Error joining classroom:', error);
      Alert.alert('Error', 'Could not join the classroom. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Join a Classroom</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Classroom Code"
        value={classCode}
        onChangeText={setClassCode}
      />
      <TouchableOpacity style={styles.joinButton} onPress={handleJoinClass}>
        <Text style={styles.joinButtonText}>Join Classroom</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 10,
    marginVertical: 10,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
  },
  joinButton: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
