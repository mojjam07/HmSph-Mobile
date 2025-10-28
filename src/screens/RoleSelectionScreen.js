import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function RoleSelectionScreen({ navigation }) {
  const handleRoleSelect = (role) => {
    // Navigate to login with selected role
    navigation.navigate('Login', { role });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to HomeSphere</Text>
      <Text style={styles.subtitle}>Choose your role to continue</Text>

      <TouchableOpacity
        style={styles.roleButton}
        onPress={() => handleRoleSelect('user')}
      >
        <Text style={styles.roleButtonText}>Continue as User</Text>
        <Text style={styles.roleDescription}>Browse and buy properties</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.roleButton}
        onPress={() => handleRoleSelect('agent')}
      >
        <Text style={styles.roleButtonText}>Continue as Agent</Text>
        <Text style={styles.roleDescription}>List and manage properties</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.roleButton}
        onPress={() => handleRoleSelect('admin')}
      >
        <Text style={styles.roleButtonText}>Continue as Admin</Text>
        <Text style={styles.roleDescription}>Manage the platform</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  roleDescription: {
    fontSize: 14,
    color: '#666',
  },
});
