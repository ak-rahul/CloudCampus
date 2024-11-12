import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ClassroomBox from '../../components/ClassroomBox';
import OptionsModal from '../../components/OptionsModal';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { auth } from '../../firebase/firebaseConfig';

export default function ClassroomScreen() {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const db = getFirestore();

  useEffect(() => {
    const fetchUserAvatar = async () => {
      const user = auth.currentUser; 
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'user-info', user.uid)); // Adjusted to use 'user-info'
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserAvatar(userData.avatar); // Set the user's avatar URL from 'user-info' collection
          } else {
            console.log('No such document!');
          }
        } catch (error) {
          console.error('Error fetching user avatar: ', error);
          Alert.alert('Error', 'Could not fetch user avatar.');
        }
      }
    };

    fetchUserAvatar(); // Fetch the avatar when the component is mounted
  }, []);

  const handleCreateClass = () => {
    setModalVisible(false);
    // Handle class creation
  };

  const handleJoinClass = () => {
    setModalVisible(false);
    // Handle joining a class
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerBox}>
        <Text style={styles.headingText}>Classrooms</Text>
        <TouchableOpacity 
          style={styles.avatarTouchableArea} 
          onPress={() => navigation.navigate('AvatarOptions')}
        >
          <Image
            style={styles.avatar}
            source={userAvatar ? { uri: userAvatar } : require('../../assets/avatar.png')} // Use the avatar from Firestore or default avatar
          />
        </TouchableOpacity>
      </View>
      <View style={styles.boxContainer}>
        <ScrollView scrollEnabled>
          {/* Add ClassroomBox components here */}
          {[...Array(10)].map((_, index) => (
            <ClassroomBox 
              key={index}
              heading="Classroom"
              subtitle="Welcome to your classroom"
            />
          ))}
        </ScrollView>
      </View>
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => setModalVisible(true)} // Show the modal when the button is pressed
      >
        <Icon name="add" size={24} color="#fff" />
      </TouchableOpacity>

      <OptionsModal
        visible={modalVisible} // Pass the modal visibility state
        onClose={() => setModalVisible(false)} // Close the modal when requested
        onCreateClass={handleCreateClass} // Handle creating a class
        onJoinClass={handleJoinClass} // Handle joining a class
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBox: {
    backgroundColor: '#f0f0f0',
    paddingTop: 40,
    paddingLeft: 20,
    paddingBottom: 10,
    paddingRight: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headingText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  avatarTouchableArea: {
    width: 60, // Increased width for touchable area
    height: 60, // Increased height for touchable area
    justifyContent: 'center', 
    alignItems: 'center',
    borderRadius: 30, // Match the avatar border radius
    backgroundColor: 'transparent', // Ensure the background is transparent
  },
  avatar: {
    width: 47,
    height: 47,
    borderRadius: 20,
  },
  boxContainer: {
    flex: 1,
    flexGrow: 1,
    flexDirection: 'column',
    paddingBottom: 20,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007BFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
});
