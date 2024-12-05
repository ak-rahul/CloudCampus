import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, Button, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { auth } from '../../firebase/firebaseConfig'; // Ensure auth is correctly imported

export default function AvatarOptions() {
  const navigation = useNavigation();
  const [name, setName] =  useState("Guest");
  const [userAvatar, setUserAvatar] = useState(null);
  const [loading, setLoading] = useState(true); // State to track loading
  const db = getFirestore(); // Get Firestore instance

  useEffect(() => {
    const fetchUserAvatar = async () => {
      const user = auth.currentUser; // Get the currently signed-in user
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'user-info', user.uid)); // Get user document from the 'user-info' collection
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserAvatar(userData.avatar); // Set the user's avatar URL
            setName(userData.name);
          } else {
            console.log('No such document!');
          }
        } catch (error) {
          console.error('Error fetching user avatar: ', error);
          Alert.alert('Error', 'Could not fetch user avatar.');
        } finally {
          setLoading(false); // Set loading to false after data is fetched
        }
      }
    };

    fetchUserAvatar(); // Call the function to fetch the user's avatar
  }, []);

  const handleClose = () => {
    console.log("Close button pressed");
    navigation.goBack();
  };

  return (
    <View style={styles.modalContainer}>
      <View style={styles.drawer}>
        <View style={styles.headerBox}>
          <Text style={styles.headerText}>Settings</Text>
          <Button
            onPress={handleClose}
            title="Close"
            color="#841584"
            accessibilityLabel="Close modal"
          />
        </View>
        <View style={styles.avatarBox}>
          <View style={styles.avatarContainer}>
            {loading ? (
              <ActivityIndicator size="large" color="#841584" /> // Show loading spinner while fetching data
            ) : (
              userAvatar ? (
                <Image
                  style={styles.avatar}
                  source={{ uri: userAvatar }} // Use user avatar from Firestore
                />
              ) : (
                <Text style={styles.noAvatarText}>{name}</Text>
              )
            )}
            <Text style={styles.personName}>{name}</Text>
          </View>
        </View>
        <View style={styles.optionsContainer}>
          <Text style={styles.option}>Option 1</Text>
          <Text style={styles.option}>Option 2</Text>
          <Text style={styles.option}>Option 3</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: '#f8f8f8', // Off-white background for the entire modal
  },
  drawer: {
    height: '100%',
    width: '100%',
    backgroundColor: '#f8f8f8', // Off-white background for the drawer
    padding: 20,
  },
  headerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginBottom: 10,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1, // Ensure text takes remaining space
  },
  avatarBox: {
    backgroundColor: '#ffffff', // White background for the avatar box
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 20,
  },
  noAvatarText: {
    fontSize: 18,
    fontStyle: 'italic',
    marginRight: 20,
  },
  personName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  optionsContainer: {
    flex: 1,
  },
  option: {
    fontSize: 18,
    marginVertical: 10,
  },
});
