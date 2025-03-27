// app/(screens)/ClassroomScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ClassroomBox from '../../components/ClassroomBox';
import OptionsModal from '../../components/OptionsModal';
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore';
import { auth } from '../../firebase/firebaseConfig';

export default function ClassroomScreen() {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [notificationCount, setNotificationCount] = useState<number>(0);
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
            const role = userData.role || 'student';
            setUserRole(role);
            fetchClassrooms(userData, role);
            listenToNotifications(user.email);
          }
        } catch (error) {
          Alert.alert('Error', 'Could not fetch user data.');
        }
      }
    };

    fetchUserData();
  }, []);

  const listenToNotifications = (email: string) => {
    const notificationsRef = collection(db, 'notifications', email, 'messages');
    return onSnapshot(notificationsRef, (snapshot) => {
      setNotificationCount(snapshot.size);
    });
  };

  const fetchClassrooms = async (userData: any, role: string) => {
    try {
      const user = auth.currentUser;
      if (!user || !userData) return;

      let fetchedClassrooms: any[] = [];

      if (role === 'teacher') {
        const createdQuery = query(
          collection(db, 'classrooms'),
          where('createdBy', '==', userData.name)
        );
        const createdSnapshot = await getDocs(createdQuery);
        createdSnapshot.forEach((doc) => {
          fetchedClassrooms.push({ id: doc.id, ...doc.data() });
        });
      } else {
        const joinedIds = userData.joinedClassrooms || [];
        if (joinedIds.length > 0) {
          const joinedQuery = query(
            collection(db, 'classrooms'),
            where('code', 'in', joinedIds)
          );
          const joinedSnapshot = await getDocs(joinedQuery);
          joinedSnapshot.forEach((doc) => {
            fetchedClassrooms.push({ id: doc.id, ...doc.data() });
          });
        }
      }

      setClassrooms(fetchedClassrooms);
    } catch (error) {
      Alert.alert('Error', 'Could not fetch classrooms.');
    }
  };

  const handleCreateClass = () => {
    setModalVisible(false);
    router.push('/(classroom)/CreateClassroom');
  };

  const handleJoinClass = () => {
    setModalVisible(false);
    router.push('/(classroom)/JoinClassroom');
  };

  const handleNotifications = () => {
    router.push('/(screens)/NotificationScreen');
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerBox}>
        <Text style={styles.headingText}>Classrooms</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleNotifications}>
            <Icon
              name={notificationCount > 0 ? 'notifications-active' : 'notifications-none'}
              size={24}
              color={notificationCount > 0 ? '#FF3B30' : '#000'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.avatarTouchableArea}
            onPress={() => router.push('/(screens)/AvatarOptions')}
          >
            <Image
              style={styles.avatar}
              source={
                userAvatar
                  ? { uri: userAvatar }
                  : require('../../assets/avatar.png')
              }
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
                onPress={() =>
                  router.push({
                    pathname: '/(classroom)/Classroom',
                    params: { id: classroom.id },
                  })
                }
              />
            ))
          ) : (
            <Text style={styles.noClassroomText}>
              {userRole === 'teacher'
                ? 'You haven’t created any classrooms yet.'
                : 'You haven’t joined any classrooms yet.'}
            </Text>
          )}
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
        onCreateClass={handleCreateClass}
        onJoinClass={handleJoinClass}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerBox: {
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headingText: { fontSize: 24, fontWeight: 'bold' },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  avatarTouchableArea: {
    marginLeft: 10,
    width: 47,
    height: 47,
    borderRadius: 24,
    overflow: 'hidden',
  },
  avatar: { width: 47, height: 47 },
  boxContainer: { flex: 1 },
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
    elevation: 5,
  },
});
