// CreateClassroom.tsx
import React, { useState } from 'react';
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
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function CreateClassroom() {
  const [className, setClassName] = useState('');
  const [emailFields, setEmailFields] = useState<string[]>(['']);
  const navigation = useNavigation();
  const db = getFirestore();

  const handleAddEmailField = () => {
    setEmailFields([...emailFields, '']);
  };

  const handleEmailChange = (text: string, index: number) => {
    const updatedEmails = [...emailFields];
    updatedEmails[index] = text;
    setEmailFields(updatedEmails);
  };

  const handleRemoveEmailField = (index: number) => {
    const updatedEmails = emailFields.filter((_, i) => i !== index);
    setEmailFields(updatedEmails);
  };

  const handleCreateClass = async () => {
    if (!className || emailFields.some(email => email.trim() === '')) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    try {
      await addDoc(collection(db, 'classrooms'), {
        name: className,
        emails: emailFields.map(email => email.trim()),
        createdAt: new Date(),
      });
      Alert.alert('Success', 'Classroom created successfully!');
      navigation.goBack();
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
            {emailFields.length > 1 && (
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveEmailField(index)}
              >
                <Text style={styles.removeButtonText}>Remove</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </ScrollView>
      <TouchableOpacity style={styles.addButton} onPress={handleAddEmailField}>
        <Text style={styles.addButtonText}>Add Email</Text>
      </TouchableOpacity>
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
    zIndex: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 60,
  },
  input: {
    width: '100%',
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
    backgroundColor: '#FF6347',
    padding: 10,
    borderRadius: 5,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  addButton: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
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
