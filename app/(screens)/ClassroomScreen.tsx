import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from "expo-router";
import Icon from 'react-native-vector-icons/MaterialIcons';
import ClassroomBox from '../../components/ClassroomBox';
import OptionsModal from '../../components/OptionsModal';
import { getFirestore, doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { auth } from '../../firebase/firebaseConfig';

export default function ClassroomScreen() {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const db = getFirestore();

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const userDocRef = doc(db, 'user-info', user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserAvatar(userData.avatar || null);
            setUserRole(userData.role || 'student');
            fetchClassrooms(userData);
          } else {
            console.log('No user document found!');
          }
        } catch (error) {
          console.error('Error fetching user data: ', error);
          Alert.alert('Error', 'Could not fetch user data.');
        }
      }
    };

    fetchUserData();
  }, []);

  const fetchClassrooms = async (userData: any) => {
    try {
      const user = auth.currentUser;
      if (!user || !userData) return;

      let classroomsList = [];
      if (userData.role === 'teacher') {
        // Fetch classrooms created by the teacher
        const classroomsQuery = query(collection(db, 'classrooms'), where('createdBy', '==', userData.name));
        const classroomsSnapshot = await getDocs(classroomsQuery);
        classroomsList = classroomsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } else if (userData.role === 'student' && userData.joinedClassrooms?.length > 0) {
        // Fetch classrooms that match the student's joinedClassrooms
        const classroomsQuery = query(
          collection(db, 'classrooms'),
          where('__name__', 'in', userData.joinedClassrooms) // Filter by document ID
        );
        const classroomsSnapshot = await getDocs(classroomsQuery);
        classroomsList = classroomsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }

      setClassrooms(classroomsList);
    } catch (error) {
      console.error('Error fetching classrooms: ', error);
      Alert.alert('Error', 'Could not fetch classrooms.');
    }
  };

  const handleCreateClass = () => {
    setModalVisible(false);
    router.push("/(classroom)/CreateClassroom");
  };

  const handleJoinClass = () => {
    setModalVisible(false);
    router.push("/(classroom)/JoinClassroom");
  };

  const handleNotifications = () => {
    router.push('/(screens)/NotificationScreen');
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerBox}>
        <Text style={styles.headingText}>Classrooms</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.notificationsButton} onPress={handleNotifications}>
            <Icon name="notifications" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.avatarTouchableArea} onPress={() => router.push('/(screens)/AvatarOptions')}>
            <Image
              style={styles.avatar}
              source={userAvatar ? { uri: userAvatar } : require('../../assets/avatar.png')}
            />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.boxContainer}>
        <ScrollView>
          {classrooms.length > 0 ? (
            classrooms.map((classroom) => (
              <ClassroomBox
                key={classroom.id}
                heading={classroom.name}
                subtitle={`Created by: ${classroom.createdBy}`}
              />
            ))
          ) : (
            <Text style={styles.noClassroomText}>
              {userRole === 'student'
                ? "You haven't joined any classrooms yet."
                : "You haven't created any classrooms yet."}
            </Text>
          )}
        </ScrollView>
      </View>
      <TouchableOpacity style={styles.floatingButton} onPress={() => setModalVisible(true)}>
        <Icon name="add" size={24} color="#fff" />
      </TouchableOpacity>

      <OptionsModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onCreateClass={handleCreateClass}
        onJoinClass={handleJoinClass}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  headingText: { fontSize: 24, fontWeight: 'bold' },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  notificationsButton: { marginRight: 10 },
  avatarTouchableArea: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
    backgroundColor: 'transparent',
  },
  avatar: { width: 47, height: 47, borderRadius: 20 },
  boxContainer: {
    flex: 1,
    flexGrow: 1,
    flexDirection: 'column',
    paddingBottom: 20,
  },
  noClassroomText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#777',
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
