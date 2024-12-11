import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Function to generate a random classroom code
const generateClassroomCode = () => {
  return Math.random().toString(36).substr(2, 8).toUpperCase();
};

export default function CreateClassroom() {
  const [className, setClassName] = useState('');
  const [emailFields, setEmailFields] = useState(['']);
  const [isVerified, setIsVerified] = useState(false); // Checkbox equivalent
  const navigation = useNavigation();
  const db = getFirestore();

  // Function to validate input before submission
  const validateInputs = () => {
    if (!className.trim()) {
      Alert.alert('Error', 'Classroom name is required.');
      return false;
    }
    if (!isVerified) {
      Alert.alert('Error', 'You must confirm the notice.');
      return false;
    }
    return true;
  };

  // Function to handle classroom creation
  const handleCreateClass = async () => {
    if (!validateInputs()) return;

    const filteredEmails = emailFields.filter(email => email.trim() !== '');
    const classroomCode = generateClassroomCode();

    try {
      const classroomRef = await addDoc(collection(db, 'classrooms'), {
        name: className,
        emails: filteredEmails,
        createdAt: new Date(),
        code: classroomCode,
      });

      // Save invitations
      const classroomId = classroomRef.id;
      const invitations = filteredEmails.map(email => ({
        email,
        classroomId,
        classroomName: className,
        status: 'pending',
      }));

      invitations.forEach(async invitation => {
        await addDoc(collection(db, 'invitations'), invitation);
      });

      Alert.alert('Success', `Classroom created successfully! Code: ${classroomCode}`);
      navigation.goBack();
    } catch (error) {
      console.error('Error creating classroom:', error);
      Alert.alert('Error', 'Could not create the classroom. Please try again.');
    }
  };

  // Function to handle email input changes
  const handleEmailChange = (text, index) => {
    const updatedEmails = [...emailFields];
    updatedEmails[index] = text;
    setEmailFields(updatedEmails);

    // Add a new field if the last one is filled
    if (index === emailFields.length - 1 && text.trim() !== '') {
      setEmailFields([...emailFields, '']);
    }
  };

  // Function to remove an email field
  const handleRemoveEmailField = (index) => {
    const updatedEmails = emailFields.filter((_, i) => i !== index);
    setEmailFields(updatedEmails);
  };

  return (
    <View style={styles.container}>
      {/* Close Button */}
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => navigation.goBack()}
      >
        <Icon name="close" size={24} color="#000" />
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.title}>Create a Classroom</Text>

      {/* Classroom Name Input */}
      <TextInput
        style={styles.input}
        placeholder="Enter Classroom Name"
        value={className}
        onChangeText={setClassName}
      />

      {/* Emails */}
      <ScrollView contentContainerStyle={styles.emailContainer}>
        {emailFields.map((email, index) => (
          <View key={index} style={styles.emailFieldContainer}>
            <TextInput
              style={styles.input}
              placeholder={`Enter Email ${index + 1}`}
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

      {/* Verification Checkbox */}
      <TouchableOpacity
        style={styles.checkboxContainer}
        onPress={() => setIsVerified(!isVerified)}
      >
        <Icon
          name={isVerified ? 'check-box' : 'check-box-outline-blank'}
          size={24}
          color={isVerified ? '#28A745' : '#000'}
        />
        <Text style={styles.checkboxText}>
          I confirm I am not using Classroom at a school with students.
        </Text>
      </TouchableOpacity>

      {/* Create Button */}
      <TouchableOpacity style={styles.createButton} onPress={handleCreateClass}>
        <Text style={styles.createButtonText}>Create Classroom</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 60,
  },
  input: {
    padding: 10,
    marginVertical: 10,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
  },
  emailContainer: {
    paddingBottom: 20,
  },
  emailFieldContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  removeButton: {
    marginLeft: 10,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  checkboxText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#000',
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
