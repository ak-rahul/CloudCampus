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
import { auth } from '../../firebase/firebaseConfig'; // Firebase authentication

// Function to generate a random classroom code
const generateClassroomCode = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
};

export default function CreateClassroom() {
  const [className, setClassName] = useState('');
  const [emailFields, setEmailFields] = useState<string[]>(['']);
  const [creatorName, setCreatorName] = useState<string>(''); // State to store the creator's name
  const navigation = useNavigation();
  const db = getFirestore();

  // Fetch the creator's name from Firestore
  const getCreatorName = async () => {
    const user = auth.currentUser;
    if (user && user.email) {
      try {
        const userDoc = await getDoc(doc(db, 'user-info', user.uid)); // Use email to fetch user data
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setCreatorName(userData?.name || 'Unknown'); // Set the name or fallback to 'Unknown'
        } else {
          console.log('No user found with that email');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        Alert.alert('Error', 'Could not fetch creator name.');
      }
    }
  };

  useEffect(() => {
    getCreatorName(); // Fetch creator name when the component mounts
  }, []);

  const handleEmailChange = (text: string, index: number) => {
    const updatedEmails = [...emailFields];
    updatedEmails[index] = text;
    setEmailFields(updatedEmails);

    // Check if the last field is filled, and if so, add a new email field
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
    // Filter out any empty email fields
    const validEmails = emailFields.filter(email => email.trim() !== '');

    // If className is empty or no valid email fields exist, show an error
    if (!className || validEmails.length === 0 || !creatorName) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    try {
      // Generate a unique classroom code
      const classroomCode = generateClassroomCode();

      // Create the classroom in Firestore with the code and creator's name
      await addDoc(collection(db, 'classrooms'), {
        name: className,
        emails: validEmails,
        code: classroomCode, // Store the generated code
        createdBy: creatorName, // Store the creator's name
        createdAt: new Date(),
      });

      Alert.alert('Success', `Classroom created successfully! Code: ${classroomCode}`);
      
      // Navigate to the ClassroomScreen (or any other screen you want after creating a classroom)
      router.push('/(screens)/ClassroomScreen');
    } catch (error) {
      console.error('Error creating classroom: ', error);
      Alert.alert('Error', 'Could not create classroom.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Close Icon */}
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
            {/* Remove button appears only when there's more than one email field */}
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
    justifyContent: 'flex-start', // Align the content to the top of the screen
    paddingTop: 60, // Added padding from top for the title and form
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
    alignSelf: 'center', // Center the title horizontally
  },
  input: {
    width: '85%', // Slightly reduced width to leave space for the remove button
    padding: 10,
    marginVertical: 10,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
  },
  emailContainer: {
    paddingBottom: 20,
    flexGrow: 1, // Allows ScrollView to grow and fill available space
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
    marginTop: 20,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
