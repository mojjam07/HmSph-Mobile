import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function RegistrationScreen({ navigation }) {
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    businessName: '',
    registrationNumber: '',
    yearsOfExperience: '',
    bankName: '',
    accountNumber: '',
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setStep(2);
  };

  const validateStep = (currentStep) => {
    const { firstName, lastName, email, password, confirmPassword, phone, businessName, registrationNumber, bankName, accountNumber } = formData;

    if (currentStep === 2) {
      if (!firstName || !lastName || !email || !password || !confirmPassword || !phone) {
        Alert.alert('Error', 'Please fill in all required fields');
        return false;
      }
      if (password !== confirmPassword) {
        Alert.alert('Error', 'Passwords do not match');
        return false;
      }
      if (!/\S+@\S+\.\S+/.test(email)) {
        Alert.alert('Error', 'Please enter a valid email');
        return false;
      }
      if (password.length < 6) {
        Alert.alert('Error', 'Password must be at least 6 characters');
        return false;
      }
    }

    if (currentStep === 3 && selectedRole === 'agent') {
      if (!businessName || !registrationNumber || !bankName || !accountNumber) {
        Alert.alert('Error', 'Please fill in all agent-specific fields');
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleRegister = async () => {
    if (!validateStep(3)) return;

    setLoading(true);
    try {
      const registrationData = {
        role: selectedRole.toUpperCase(),
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
      };

      if (selectedRole === 'agent') {
        registrationData.businessName = formData.businessName;
        registrationData.registrationNumber = formData.registrationNumber;
        registrationData.yearsOfExperience = formData.yearsOfExperience;
        registrationData.bankName = formData.bankName;
        registrationData.accountNumber = formData.accountNumber;
      }

      const result = await register(registrationData);

      if (result.success) {
        Alert.alert('Success', 'Registration successful!', [
          { text: 'OK', onPress: () => navigation.navigate('Login') }
        ]);
      } else {
        Alert.alert('Registration Failed', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Choose Your Role</Text>
            <Text style={styles.subtitle}>Select how you'll be using our platform</Text>

            <TouchableOpacity
              style={[styles.roleButton, selectedRole === 'user' && styles.roleButtonSelected]}
              onPress={() => handleRoleSelect('user')}
            >
              <Text style={[styles.roleTitle, selectedRole === 'user' && styles.roleTitleSelected]}>
                Property Seeker
              </Text>
              <Text style={[styles.roleDescription, selectedRole === 'user' && styles.roleDescriptionSelected]}>
                Find your dream property
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.roleButton, selectedRole === 'agent' && styles.roleButtonSelected]}
              onPress={() => handleRoleSelect('agent')}
            >
              <Text style={[styles.roleTitle, selectedRole === 'agent' && styles.roleTitleSelected]}>
                Real Estate Agent
              </Text>
              <Text style={[styles.roleDescription, selectedRole === 'agent' && styles.roleDescriptionSelected]}>
                List and manage properties
              </Text>
            </TouchableOpacity>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Personal Information</Text>
            <Text style={styles.subtitle}>Tell us about yourself</Text>

            <TextInput
              style={styles.input}
              placeholder="First Name"
              value={formData.firstName}
              onChangeText={(value) => handleInputChange('firstName', value)}
            />

            <TextInput
              style={styles.input}
              placeholder="Last Name"
              value={formData.lastName}
              onChangeText={(value) => handleInputChange('lastName', value)}
            />

            <TextInput
              style={styles.input}
              placeholder="Email"
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              style={styles.input}
              placeholder="Phone"
              value={formData.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
              keyboardType="phone-pad"
            />

            <TextInput
              style={styles.input}
              placeholder="Password"
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
              secureTextEntry
            />

            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChangeText={(value) => handleInputChange('confirmPassword', value)}
              secureTextEntry
            />

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                <Text style={styles.nextButtonText}>Next</Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>
              {selectedRole === 'agent' ? 'Professional Details' : 'Review Information'}
            </Text>
            <Text style={styles.subtitle}>
              {selectedRole === 'agent' ? 'Additional information for agents' : 'Please review your details'}
            </Text>

            {selectedRole === 'agent' && (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Business Name"
                  value={formData.businessName}
                  onChangeText={(value) => handleInputChange('businessName', value)}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Registration Number"
                  value={formData.registrationNumber}
                  onChangeText={(value) => handleInputChange('registrationNumber', value)}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Years of Experience"
                  value={formData.yearsOfExperience}
                  onChangeText={(value) => handleInputChange('yearsOfExperience', value)}
                  keyboardType="numeric"
                />

                <TextInput
                  style={styles.input}
                  placeholder="Bank Name"
                  value={formData.bankName}
                  onChangeText={(value) => handleInputChange('bankName', value)}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Account Number"
                  value={formData.accountNumber}
                  onChangeText={(value) => handleInputChange('accountNumber', value)}
                />
              </>
            )}

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.registerButton, loading && styles.buttonDisabled]}
                onPress={handleRegister}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.registerButtonText}>Register</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.container}>
      {renderStep()}

      <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginLink}>
        <Text style={styles.link}>Already have an account? Login</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  stepContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    marginTop: 50,
    color: '#000000',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666666',
  },
  roleButton: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#e9ecef',
  },
  roleButtonSelected: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3',
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 5,
  },
  roleTitleSelected: {
    color: '#2196f3',
  },
  roleDescription: {
    fontSize: 14,
    color: '#666666',
  },
  roleDescriptionSelected: {
    color: '#1976d2',
  },
  input: {
    borderWidth: 1,
    borderColor: '#cccccc',
    padding: 15,
    marginBottom: 15,
    borderRadius: 5,
    backgroundColor: '#ffffff',
    color: '#000000',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  backButton: {
    backgroundColor: '#6c757d',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  nextButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    flex: 1,
    marginLeft: 10,
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    flex: 1,
    marginLeft: 10,
  },
  registerButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    backgroundColor: '#6c757d',
  },
  loginLink: {
    marginTop: 20,
    marginBottom: 40,
  },
  link: {
    color: '#007bff',
    textAlign: 'center',
  },
});
