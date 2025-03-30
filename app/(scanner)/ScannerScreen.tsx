import React, { useState, useEffect } from 'react';
import { View, Image, Button, StyleSheet, Text } from 'react-native';
import DocumentScanner from 'react-native-document-scanner-plugin';

const ScannerScreen = () => {
  const [scannedImage, setScannedImage] = useState<string | null>(null);

  const scanDocument = async () => {
    try {
      const { scannedImages } = await DocumentScanner.scanDocument();

      if (scannedImages.length > 0) {
        setScannedImage(scannedImages[0]); // Show first scanned image
      } else {
        alert('No image scanned.');
      }
    } catch (error) {
      console.error('Scan failed: ', error);
      alert('Scanning failed.');
    }
  };

  useEffect(() => {
    scanDocument();
  }, []);

  return (
    <View style={styles.container}>
      {scannedImage ? (
        <Image
          source={{ uri: scannedImage }}
          style={styles.image}
          resizeMode="contain"
        />
      ) : (
        <Text style={styles.placeholder}>No document scanned yet.</Text>
      )}
      <Button title="Scan Another Document" onPress={scanDocument} />
    </View>
  );
};

export default ScannerScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  image: {
    width: '100%',
    height: 400,
    marginBottom: 20,
    borderRadius: 10,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  placeholder: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
});
