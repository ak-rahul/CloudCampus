import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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
            accessibilityLabel="Learn more about this purple button"
          />
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
  },
  drawer: {
    height: '100%',
    width: '100%',
    backgroundColor: '#ffffff',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  headerBox: {
    flexDirection: 'row', // Align items horizontally
    alignItems: 'center', // Align items vertically// Center contents vertically
    justifyContent: 'space-between', // Center contents horizontally
    paddingBottom: 20, // Space between header and options
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginBottom: 10, // Allow absolute positioning of close button
  },
  closeButton: {
    position: 'absolute',
    right: 10, // Adjust as needed
    top: 0, // Adjust as needed
    padding: 12, // Increase touchable area
    backgroundColor: '#f5f5f5', // Background color for the button
    borderRadius: 5, // Rounded corners for the button
  },
  closeText: {
    fontSize: 16,
    color: '#007BFF', // Text color
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1, // Ensure text takes remaining space
  },
  optionsContainer: {
    flex: 1,
  },
  option: {
    fontSize: 18,
    marginVertical: 10,
  },
});
