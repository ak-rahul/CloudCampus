import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getFirestore, collection, orderBy, onSnapshot, query } from 'firebase/firestore';
import { auth } from '../../firebase/firebaseConfig';
import NotificationBox from '../../components/NotificationBox';

export default function NotificationScreen() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const router = useRouter();
  const db = getFirestore();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user || !user.email) return;

    const userMessagesRef = collection(db, 'notifications', user.email, 'messages');
    const notificationsQuery = query(userMessagesRef, orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(
      notificationsQuery,
      (snapshot) => {
        const notificationsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setNotifications(notificationsList);
      },
      (error) => {
        console.error('Error fetching notifications: ', error);
        Alert.alert('Error', 'Could not fetch notifications.');
      }
    );

    return () => unsubscribe();
  }, []);

  const renderItem = ({ item }: { item: any }) => (
    <NotificationBox notification={item} />
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerBox}>
        <TouchableOpacity onPress={() => router.push('/(screens)/ClassroomScreen')} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#007BFF" />
        </TouchableOpacity>
        <Text style={styles.headingText}>Notifications</Text>
      </View>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No notifications available.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  headerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#DDD',
  },
  backButton: {
    marginRight: 10,
  },
  headingText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: 20,
    fontSize: 16,
    color: '#777',
  },
});
