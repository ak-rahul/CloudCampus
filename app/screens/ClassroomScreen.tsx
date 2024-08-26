import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ClassroomScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.headerBox}>
        <Text style={styles.headingText}>Classroom</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.text}>Classroom Screen</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBox: {
    backgroundColor: '#f0f0f0', // Background color of the box
    paddingTop: 50,
    paddingLeft: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    shadowColor: '#000', // Shadow color
    shadowOffset: { width: 0, height: 4 }, // Shadow offset
    shadowOpacity: 0.2, // Shadow opacity
    shadowRadius: 6, // Shadow radius
    elevation: 5, // Android-specific shadow
  },
  headingText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
