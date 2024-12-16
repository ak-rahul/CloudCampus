import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getFirestore, collection, addDoc, getDoc, doc } from 'firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { auth } from '../../firebase/firebaseConfig';

// Function to generate a random classroom code
const generateClassroomCode = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
};

// Utility function to validate email
const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

export default function CreateClassroom() {
  const [className, setClassName] = useState('');
  const [emailFields, setEmailFields] = useState<string[]>(['']);
  const [creatorName, setCreatorName] = useState<string>(''); // Creator's name
  const navigation = useNavigation();
  const db = getFirestore();

  // Fetch creator's name from Firestore
  const getCreatorName = async () => {
    const user = auth.currentUser;
    if (user && user.email) {
      try {
        const userDoc = await getDoc(doc(db, 'user-info', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setCreatorName(userData?.name || 'Unknown');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        Alert.alert('Error', 'Could not fetch creator name.');
      }
    }
  };

  useEffect(() => {
    getCreatorName();
  }, []);

  const handleEmailChange = (text: string, index: number) => {
    const updatedEmails = [...emailFields];
    updatedEmails[index] = text;
    setEmailFields(updatedEmails);

    if (index === emailFields.length - 1 && text.trim() !== '') {
      setEmailFields([...updatedEmails, '']);
    }
  };

  const handleRemoveEmailField = (index: number) => {
    if (emailFields.length > 1) {
      const updatedEmails = emailFields.filter((_, i) => i !== index);
      setEmailFields(updatedEmails);
    }
  };

  const handleCreateClass = async () => {
    const validEmails = emailFields.filter(email => email.trim() !== '');
    if (!className || validEmails.length === 0 || !creatorName) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    // Check for invalid emails
    if (validEmails.some(email => !isValidEmail(email))) {
      Alert.alert('Error', 'One or more email addresses are invalid.');
      return;
    }

    try {
      const classroomCode = generateClassroomCode();

      // Create classroom in Firestore
      await addDoc(collection(db, 'classrooms'), {
        name: className,
        emails: validEmails,
        code: classroomCode,
        createdBy: creatorName,
        createdAt: new Date(),
      });

      // Send notifications to invited users
      const notificationsRef = collection(db, 'notifications');
      validEmails.forEach(async (email) => {
        await addDoc(notificationsRef, {
          email,
          message: `You are invited to join the classroom "${className}". Use code: ${classroomCode}`,
          timestamp: new Date(),
          classroomName: className,
          classroomCode,
        });
      });

      Alert.alert('Success', `Classroom created successfully! Code: ${classroomCode}`);
      router.push('/(screens)/ClassroomScreen');
    } catch (error) {
      console.error('Error creating classroom: ', error);
      Alert.alert('Error', 'Could not create classroom.');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => navigation.goBack()}
      >
        <Icon name="close" size={24} color="#000" />
      </TouchableOpacity>

      <Text style={styles.title}>Create a Classroom</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Classroom Name"
        value={className}
        onChangeText={setClassName}
      />
      <ScrollView contentContainerStyle={styles.emailContainer}>
        {emailFields.map((email, index) => (
          <View key={index} style={styles.emailFieldContainer}>
            <TextInput
              style={styles.input}
              placeholder={`Enter Email ID ${index + 1}`}
              value={email}
              onChangeText={text => handleEmailChange(text, index)}
            />
            {emailFields.length > 1 && (
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveEmailField(index)}
              >
                <Icon name="remove-circle" size={24} color="#FF6347" />
              </TouchableOpacity>
            )}
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.createButton} onPress={handleCreateClass}>
        <Text style={styles.createButtonText}>Create Classroom</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    justifyContent: 'flex-start',
    paddingTop: 60,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    alignSelf: 'center',
  },
  input: {
    width: '85%',
    padding: 10,
    marginVertical: 10,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
  },
  emailContainer: {
    flexGrow: 0,
    paddingBottom: 10,
  },
  emailFieldContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    width: '100%',
  },
  removeButton: {
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
  },
  createButton: {
    backgroundColor: '#28A745',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 20,
    alignSelf: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
