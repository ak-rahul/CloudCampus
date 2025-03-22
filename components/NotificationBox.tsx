import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import {
  getFirestore,
  updateDoc,
  doc,
  arrayUnion,
  deleteDoc,
} from 'firebase/firestore';
import { auth } from '../firebase/firebaseConfig';

const NotificationBox = ({ notification }) => {
  const db = getFirestore();

  const handleAccept = async () => {
    const user = auth.currentUser;
    if (!user || !user.uid || !user.email) return;

    const userRef = doc(db, 'user-info', user.uid);
    const notificationRef = doc(db, 'notifications', user.email, 'messages', notification.id);

    try {
      // Add classroom code to both 'classrooms' and 'joinedClassrooms'
      await updateDoc(userRef, {
        joinedClassrooms: arrayUnion(notification.classroomCode),
      });

      Alert.alert('Accepted', `You joined classroom: ${notification.classroomCode}`);
    } catch (error) {
      console.error('Error accepting classroom:', error);
      Alert.alert('Error', 'Failed to accept the classroom invitation.');
    } finally {
      // Delete the notification regardless of outcome
      try {
        await deleteDoc(notificationRef);
      } catch (deleteError) {
        console.error('Failed to delete notification after accept:', deleteError);
      }
    }
  };

  const handleDecline = async () => {
    const user = auth.currentUser;
    if (!user || !user.email) return;

    const notificationRef = doc(db, 'notifications', user.email, 'messages', notification.id);

    try {
      Alert.alert('Declined', 'Invitation removed.');
    } catch (error) {
      console.error('Error declining invitation:', error);
      Alert.alert('Error', 'Failed to decline the invitation.');
    } finally {
      // Always delete the notification
      try {
        await deleteDoc(notificationRef);
      } catch (deleteError) {
        console.error('Failed to delete notification after decline:', deleteError);
      }
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.messageText}>{notification.message}</Text>
      <View style={styles.buttonRow}>
        <TouchableOpacity style={[styles.button, styles.accept]} onPress={handleAccept}>
          <Text style={styles.buttonText}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.decline]} onPress={handleDecline}>
          <Text style={styles.buttonText}>Decline</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default NotificationBox;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    marginHorizontal: 15,
    marginVertical: 8,
    padding: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  messageText: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  button: {
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  accept: {
    backgroundColor: '#4CAF50',
  },
  decline: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});
