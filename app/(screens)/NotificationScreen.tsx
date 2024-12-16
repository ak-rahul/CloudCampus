import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from "expo-router";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getFirestore, collection, getDocs, query, orderBy } from 'firebase/firestore';

export default function NotificationScreen() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const router = useRouter();
  const db = getFirestore();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const notificationsRef = collection(db, 'notifications');
        const notificationsQuery = query(notificationsRef, orderBy('timestamp', 'desc'));
        const notificationsSnapshot = await getDocs(notificationsQuery);
        const notificationsList = notificationsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setNotifications(notificationsList);
      } catch (error) {
        console.error('Error fetching notifications: ', error);
        Alert.alert('Error', 'Could not fetch notifications.');
      }
    };

    fetchNotifications();
  }, []);

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.notificationBox}>
      <Text style={styles.notificationTitle}>{item.title}</Text>
      <Text style={styles.notificationMessage}>{item.message}</Text>
      <Text style={styles.notificationTimestamp}>
        {new Date(item.timestamp?.toDate()).toLocaleString()}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerBox}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#007BFF" />
        </TouchableOpacity>
        <Text style={styles.headingText}>Notifications</Text>
      </View>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerBox: {
    backgroundColor: '#f0f0f0',
    paddingTop: 40,
    paddingLeft: 10,
    paddingRight: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    flexDirection: 'row',
    alignItems: 'center',
  },
  headingText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 10, // Spacing between the icon and text
  },
  backButton: {
    padding: 10,
  },
  listContent: {
    padding: 20,
  },
  notificationBox: {
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  notificationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
  },
  notificationTimestamp: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
  },
});
