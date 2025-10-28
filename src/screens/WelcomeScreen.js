import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

export default function WelcomeScreen({ navigation }) {
  const handleRoleSelect = (role) => {
    // Navigate to login with selected role
    navigation.navigate('Login', { role });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to HomeSphere</Text>
      <Text style={styles.subtitle}>Choose your role to continue</Text>

      
      <Image
          source={{ uri: 'https://picsum.photos/400/400' }}
          style={styles.bannerImage}
      />
    
      <TouchableOpacity
        style={styles.roleButton}
        onPress={() => handleRoleSelect('agent')}
      >
        {/* <Text style={styles.roleDescription}>Are you a registered user of HomeSphere?</Text> */}
        <Text style={styles.roleButtonText}>Continue to Login</Text>
      </TouchableOpacity>

      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    color: '#666',
  },
  roleButton: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  roleButtonText: {
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  roleDescription: {
    fontSize: 14,
    color: '#666',
  },
  bannerImage: {
    width: '100%',
    height: 400,
    borderRadius: 10,
    marginBottom: 20,
  },
});
