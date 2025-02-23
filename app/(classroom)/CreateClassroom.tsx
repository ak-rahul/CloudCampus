import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { auth, firestore } from '../../firebase/firebaseConfig';
import { collection, addDoc, getDoc, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

const generateClassroomCode = (creatorName) => {
  const cleanedName = creatorName.replace(/\s+/g, '').toLowerCase();
  const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${cleanedName}-${randomCode}`;
};

const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

export default function CreateClassroom() {
  const [className, setClassName] = useState('');
  const [emailFields, setEmailFields] = useState(['']);
  const [creatorName, setCreatorName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const user = auth.currentUser;

  const fetchCreatorName = async () => {
    if (user) {
      try {
        const userDoc = await getDoc(doc(firestore, 'user-info', user.uid));
        if (userDoc.exists()) {
          setCreatorName(userDoc.data()?.name || 'user');
        }
      } catch (error) {
        console.error('Error fetching creator name:', error);
        Alert.alert('Error', 'Could not fetch your information.');
      }
    }
  };

  useEffect(() => {
    fetchCreatorName();
  }, []);

  const handleEmailChange = (text, index) => {
    const updatedEmails = [...emailFields];
    updatedEmails[index] = text;
    setEmailFields(updatedEmails);

    if (index === emailFields.length - 1 && text.trim() !== '') {
      setEmailFields([...updatedEmails, '']);
    }
  };

  const handleRemoveEmailField = (index) => {
    if (emailFields.length > 1) {
      setEmailFields(emailFields.filter((_, i) => i !== index));
    }
  };

  const handleCreateClassroom = async () => {
    const validEmails = emailFields.filter((email) => email.trim() !== '');

    if (!className.trim() || !creatorName || validEmails.length === 0) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    if (validEmails.some((email) => !isValidEmail(email))) {
      Alert.alert('Error', 'One or more email addresses are invalid.');
      return;
    }

    setIsLoading(true);
    try {
      const classroomCode = generateClassroomCode(creatorName);
      const classroomRef = await addDoc(collection(firestore, 'classrooms'), {
        name: className,
        emails: validEmails,
        code: classroomCode,
        createdBy: creatorName,
        createdAt: new Date(),
      });

      const userRef = doc(firestore, 'user-info', user.uid);
      await updateDoc(userRef, {
        role: 'teacher',
        classrooms: arrayUnion(classroomCode),
      });

      const notificationsRef = collection(firestore, 'notifications');
      validEmails.forEach(async (email) => {
        await addDoc(notificationsRef, {
          email,
          message: `You have been invited to join "${className}". Use Code: ${classroomCode}`,
          timestamp: new Date(),
          classroomCode: classroomCode,
        });
      });

      Alert.alert('Success', `Classroom created! Code: ${classroomCode}`);
      router.push('/(screens)/ClassroomScreen');
    } catch (error) {
      console.error('Error creating classroom:', error);
      Alert.alert('Error', 'Failed to create classroom. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#f0f4f7', '#dfe7ed']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Create a Classroom</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Classroom Name"
          value={className}
          onChangeText={setClassName}
        />
        <Text style={styles.subtitle}>Invite Students/Teachers</Text>
        {emailFields.map((email, index) => (
          <View key={index} style={styles.emailFieldContainer}>
            <TextInput
              style={styles.emailInput}
              placeholder={`Enter Email ${index + 1}`}
              value={email}
              onChangeText={(text) => handleEmailChange(text, index)}
              keyboardType="email-address"
            />
            {emailFields.length > 1 && (
              <TouchableOpacity onPress={() => handleRemoveEmailField(index)}>
                <Icon name="remove-circle" size={24} color="#FF6347" />
              </TouchableOpacity>
            )}
          </View>
        ))}
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateClassroom}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.createButtonText}>Create Classroom</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  subtitle: { fontSize: 18, marginVertical: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  emailFieldContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  emailInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#fff',
  },
  createButton: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  createButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
