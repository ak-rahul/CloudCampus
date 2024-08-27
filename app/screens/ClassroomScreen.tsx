import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useRouter } from "expo-router";
import { useNavigation } from '@react-navigation/native'; // Use the correct hook

export default function ClassroomScreen() {
  const router = useRouter();
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.headerBox}>
        <Text style={styles.headingText}>Classroom</Text>
        <TouchableOpacity onPress={() => navigation.navigate('AvatarOptions')}>
          <Image
            style={styles.avatar}
            source={require('../../assets/avatar.png')}
          />
        </TouchableOpacity>
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
    backgroundColor: '#f0f0f0',
    paddingTop: 55,
    paddingLeft: 20,
    paddingBottom: 10,
    paddingRight: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headingText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
