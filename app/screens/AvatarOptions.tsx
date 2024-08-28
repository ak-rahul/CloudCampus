import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button } from 'react-native';

export default function AvatarOptions() {
  const navigation = useNavigation();

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
            <Image
              style={styles.avatar}
              source={require('../../assets/avatar.png')} // Replace with your avatar image path
            />
            <Text style={styles.personName}>John Doe</Text>
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
