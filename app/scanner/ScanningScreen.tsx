import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';

export default function ScanningScreen() {
  const handleSavePDF = () => {
    Alert.alert('Scanned pages saved as PDF!');
    // Logic to save scanned images as a PDF in storage can be added here.
  };

  return (
    <View style={styles.container}>
      <Text style={styles.instructions}>Start scanning your documents</Text>

      {/* Add scanning functionality here using a package like react-native-document-scanner */}

      <TouchableOpacity style={styles.saveButton} onPress={handleSavePDF}>
        <Text style={styles.saveButtonText}>Save as PDF</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  instructions: {
    fontSize: 18,
    marginBottom: 20,
  },
  saveButton: {
    marginTop: 30,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#007BFF',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
