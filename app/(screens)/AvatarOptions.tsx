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
import Icon from 'react-native-vector-icons/MaterialIcons';
import { auth, signOut } from '../../firebase/firebaseConfig';
import { useRouter } from 'expo-router';

export default function AvatarOptions() {
  const router = useRouter();
  const [name, setName] = useState('Guest');
  const [email, setEmail] = useState('');
  const [userAvatar, setUserAvatar] = useState(null);
  const [loading, setLoading] = useState(true);
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
            setName(userData.name);
            setEmail(user.email);
          } else {
            console.log('No such document!');
          }
        } catch (error) {
          console.error('Error fetching user avatar: ', error);
          Alert.alert('Error', 'Could not fetch user avatar.');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserAvatar();
  }, []);

  const handleClose = () => {
    console.log('Close button pressed');
    router.push('/(screens)/ClassroomScreen');
  };

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        console.log('User signed out');
        router.push('/(auth)/SignIn');
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
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Icon name="close" size={40} color="#841584" />
          </TouchableOpacity>
        </View>

        <View style={styles.avatarBox}>
          <View style={styles.avatarContainer}>
            {loading ? (
              <ActivityIndicator size="large" color="#841584" /> // Show loading spinner while fetching data
            ) : userAvatar ? (
              <Image
                style={styles.avatar}
                source={{ uri: userAvatar }}
              />
            ) : (
              <Text style={styles.noAvatarText}>{name}</Text>
            )}
            <View style={styles.userInfo}>
              <Text style={styles.personName}>{name}</Text>
              {email && <Text style={styles.userEmail}>{email}</Text>}
            </View>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Icon name="exit-to-app" size={40} color="#841584" />
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
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginBottom: 5,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
  },
  closeButton: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
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
    justifyContent: 'space-between',
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
    flex: 1,
  },
  personName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 16,
    color: '#555',
  },
  logoutButton: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
  },
});
