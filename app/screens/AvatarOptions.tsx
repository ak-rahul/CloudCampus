import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';

export default function AvatarOptions() {
  return (
      <View style={styles.modalContainer}>
        <View style={styles.drawer}>
          <Text style={styles.option}>Option 1</Text>
          <Text style={styles.option}>Option 2</Text>
          <Text style={styles.option}>Option 3</Text>
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
  closeButton: {
    alignSelf: 'flex-end',
  },
  closeText: {
    fontSize: 16,
    color: '#007BFF',
  },
  option: {
    fontSize: 18,
    marginVertical: 10,
  },
});
