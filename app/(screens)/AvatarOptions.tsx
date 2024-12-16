import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Import the icon library
import { auth, signOut } from '../../firebase/firebaseConfig'; // Ensure auth and signOut are correctly imported
import { useRouter } from 'expo-router';

export default function AvatarOptions() {
  const router = useRouter();
  const [name, setName] = useState('Guest');
  const [email, setEmail] = useState(''); // Added email state
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
            setEmail(user.email); // Set the user's email
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
    console.log('Close button pressed');
    router.push('/(screens)/ClassroomScreen');
  };

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        console.log('User signed out');
        router.push('/(auth)/SignIn'); // Navigate to login screen after logout
      })
      .catch((error) => {
        console.error('Error signing out: ', error);
        Alert.alert('Error', 'Could not log out.');
      });
  };

  return (
    <View style={styles.modalContainer}>
      <View style={styles.drawer}>
        <View style={styles.headerBox}>
          <Text style={styles.headerText}>Profile</Text>
          {/* Close button as an icon */}
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Icon name="close" size={40} color="#841584" /> {/* Large close icon */}
          </TouchableOpacity>
        </View>

        <View style={styles.avatarBox}>
          <View style={styles.avatarContainer}>
            {loading ? (
              <ActivityIndicator size="large" color="#841584" /> // Show loading spinner while fetching data
            ) : userAvatar ? (
              <Image
                style={styles.avatar}
                source={{ uri: userAvatar }} // Use user avatar from Firestore
              />
            ) : (
              <Text style={styles.noAvatarText}>{name}</Text>
            )}
            <View style={styles.userInfo}>
              <Text style={styles.personName}>{name}</Text>
              {email && <Text style={styles.userEmail}>{email}</Text>} {/* Display email if available */}
            </View>
            
            {/* Logout Icon for logout */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Icon name="exit-to-app" size={40} color="#841584" /> {/* "Opening door" icon */}
            </TouchableOpacity>
          </View>
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: '#f8f8f8',
  },
  drawer: {
    height: '100%',
    width: '100%',
    backgroundColor: '#f8f8f8',
    padding: 20,
  },
  headerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10, // Reduced space at the bottom
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginBottom: 5, // Reduced space between the border and the content below
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
  },
  closeButton: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5, // Reduced padding for the close button
  },
  avatarBox: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Ensures the avatar and the logout icon are spaced out
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
  userInfo: {
    flexDirection: 'column',
    flex: 1, // Allow the name and email to take available space
  },
  personName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 16,
    color: '#555', // Light grey color for email
  },
  logoutButton: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5, // Reduced padding for the logout button
  },
  optionsContainer: {
    flex: 1,
  },
  option: {
    fontSize: 18,
    marginVertical: 10,
  },
});
