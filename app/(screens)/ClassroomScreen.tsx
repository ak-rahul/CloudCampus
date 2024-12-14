import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from "expo-router";
import Icon from 'react-native-vector-icons/MaterialIcons';
import ClassroomBox from '../../components/ClassroomBox';
import OptionsModal from '../../components/OptionsModal';
import { getFirestore, doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { auth } from '../../firebase/firebaseConfig';

export default function ClassroomScreen() {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const db = getFirestore();

  useEffect(() => {
    const fetchUserAvatar = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'user-info', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserAvatar(userData.avatar);
          } else {
            console.log('No such document!');
          }
        } catch (error) {
          console.error('Error fetching user avatar: ', error);
          Alert.alert('Error', 'Could not fetch user avatar.');
        }
      }
    };

    const fetchClassrooms = async () => {
      try {
        const classroomsRef = collection(db, 'classrooms');
        const classroomsSnapshot = await getDocs(classroomsRef);
        const classroomsList = classroomsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setClassrooms(classroomsList);
      } catch (error) {
        console.error('Error fetching classrooms: ', error);
        Alert.alert('Error', 'Could not fetch classrooms.');
      }
    };

    fetchUserAvatar();
    fetchClassrooms();
  }, []);

  const handleCreateClass = async () => {
    setModalVisible(false);
    router.push("/(classroom)/CreateClassroom");

    // Optionally, fetch classrooms again after classroom creation
    const classroomsRef = collection(db, 'classrooms');
    const classroomsSnapshot = await getDocs(classroomsRef);
    const classroomsList = classroomsSnapshot.docs.map(doc => doc.data());
    setClassrooms(classroomsList); // Update the classrooms list
  };

  const handleJoinClass = () => {
    setModalVisible(false);
    // Navigate or show functionality to join a class
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerBox}>
        <Text style={styles.headingText}>Classrooms</Text>
        <TouchableOpacity
          style={styles.avatarTouchableArea}
          onPress={() => router.push('/(screens)/AvatarOptions')}
        >
          <Image
            style={styles.avatar}
            source={userAvatar ? { uri: userAvatar } : require('../../assets/avatar.png')}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.boxContainer}>
        <ScrollView>
          {classrooms.map((classroom, index) => (
            <ClassroomBox
              key={index}
              heading={classroom.name}
              subtitle={`Created by: ${classroom.createdBy}`} // Display creator's name
            />
          ))}
        </ScrollView>
      </View>
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => setModalVisible(true)}
      >
        <Icon name="add" size={24} color="#fff" />
      </TouchableOpacity>

      <OptionsModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onCreateClass={handleCreateClass} // Navigate to CreateClassroomScreen
        onJoinClass={handleJoinClass}
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
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
    backgroundColor: 'transparent',
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
