import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, MessageSquare, Headphones, Building, Users, AlertCircle, ArrowLeft } from 'lucide-react-native';
import ApiService from '../api/ApiService';

export default function ContactScreen() {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    inquiryType: 'general'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const contactInfo = [
    {
      icon: MapPin,
      title: "Visit Our Office",
      details: [
        "123 Victoria Island Road",
        "Lagos Island, Lagos State",
        "Nigeria"
      ],
      color: "blue"
    },
    {
      icon: Phone,
      title: "Call Us",
      details: [
        "+234 803 123 4567",
        "+234 806 789 0123",
        "Mon - Fri: 8AM - 6PM"
      ],
      color: "green"
    },
    {
      icon: Mail,
      title: "Email Us",
      details: [
        "info@homesphere.com",
        "support@homesphere.com",
        "careers@homesphere.com"
      ],
      color: "purple"
    },
    {
      icon: Clock,
      title: "Business Hours",
      details: [
        "Monday - Friday: 8AM - 6PM",
        "Saturday: 9AM - 4PM",
        "Sunday: Closed"
      ],
      color: "orange"
    }
  ];

  const departments = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'sales', label: 'Sales & Listings' },
    { value: 'support', label: 'Technical Support' },
    { value: 'partnership', label: 'Partnership' },
    { value: 'careers', label: 'Careers' },
    { value: 'feedback', label: 'Feedback' }
  ];

  const supportOptions = [
    {
      icon: MessageSquare,
      title: "Live Chat",
      description: "Get instant help from our support team",
      action: "Start Chat",
      actionType: "chat",
      available: true
    },
    {
      icon: Headphones,
      title: "Phone Support",
      description: "Speak directly with our experts",
      action: "Call Now",
      actionType: "phone",
      available: true
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "Send us detailed questions",
      action: "Send Email",
      actionType: "email",
      available: true
    },
    {
      icon: Building,
      title: "Office Visit",
      description: "Schedule an in-person meeting",
      action: "Book Meeting",
      actionType: "meeting",
      available: true
    }
  ];

  const faqs = [
    {
      question: "How do I list my property?",
      answer: "You can list your property by creating an account and using our easy-to-use listing form. Our team will review and approve your listing within 24 hours."
    },
    {
      question: "What are your service fees?",
      answer: "Our fees vary depending on the service. Property listings start from 2.5% commission. Contact us for detailed pricing information."
    },
    {
      question: "Do you provide property management?",
      answer: "Yes, we offer comprehensive property management services including tenant screening, rent collection, and property maintenance coordination."
    },
    {
      question: "How can I schedule a property viewing?",
      answer: "You can schedule viewings directly through our platform or by contacting the listing agent. We also offer virtual tours for remote viewing."
    },
    {
      question: "What locations do you cover?",
      answer: "We currently operate in major Nigerian cities including Lagos, Abuja, Port Harcourt, and Kano, with plans to expand to more cities."
    },
    {
      question: "How do I become a partner agent?",
      answer: "We welcome experienced real estate professionals. Apply through our careers page or contact our partnership team for more information."
    }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!formData.subject.trim()) {
      setError('Subject is required');
      return false;
    }
    if (!formData.message.trim()) {
      setError('Message is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await ApiService.submitContact(formData);
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        inquiryType: 'general'
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      setError(error.message || 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSupportAction = async (actionType) => {
    try {
      switch (actionType) {
        case 'chat':
          Alert.alert('Coming Soon', 'Live chat feature will be available soon!');
          break;
        case 'phone':
          await Linking.openURL('tel:+2348031234567');
          break;
        case 'email':
          await Linking.openURL('mailto:support@homesphere.com');
          break;
        case 'meeting':
          Alert.alert('Book Meeting', 'Please call us to schedule an in-person meeting.');
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error handling support action:', error);
      Alert.alert('Error', 'Unable to perform this action. Please try again.');
    }
  };

  const getColorClasses = (color) => {
    const colors = {
      blue: { bg: '#dbeafe', text: '#1d4ed8' },
      green: { bg: '#dcfce7', text: '#166534' },
      purple: { bg: '#ede9fe', text: '#6b21a8' },
      orange: { bg: '#fed7aa', text: '#c2410c' }
    };
    return colors[color] || colors.blue;
  };

  if (submitted) {
    return (
      <View style={styles.successContainer}>
        <View style={styles.successCard}>
          <CheckCircle size={64} color="#10b981" />
          <Text style={styles.successTitle}>Message Sent!</Text>
          <Text style={styles.successMessage}>
            Thank you for contacting us. We'll get back to you within 24 hours.
          </Text>
          <TouchableOpacity
            style={styles.successButton}
            onPress={() => setSubmitted(false)}
          >
            <Text style={styles.successButtonText}>Send Another Message</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Get In Touch</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Hero Section */}
      <View style={styles.heroSection}>
        <Text style={styles.heroTitle}>Get In Touch</Text>
        <Text style={styles.heroSubtitle}>
          We're here to help you find your perfect property or answer any questions you may have
        </Text>
      </View>

      {/* Contact Info Cards */}
      <View style={styles.contactInfoSection}>
        {contactInfo.map((info, index) => {
          const colors = getColorClasses(info.color);
          return (
            <View key={index} style={styles.contactCard}>
              <View style={[styles.contactIcon, { backgroundColor: colors.bg }]}>
                <info.icon size={24} color={colors.text} />
              </View>
              <Text style={styles.contactTitle}>{info.title}</Text>
              {info.details.map((detail, idx) => (
                <Text key={idx} style={styles.contactDetail}>{detail}</Text>
              ))}
            </View>
          );
        })}
      </View>

      {/* Contact Form */}
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Send Us a Message</Text>

        {error ? (
          <View style={styles.errorContainer}>
            <AlertCircle size={20} color="#ef4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.formRow}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              placeholder="Enter your full name"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address *</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={styles.formRow}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={formData.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Inquiry Type</Text>
            <View style={styles.pickerContainer}>
              {departments.map((dept) => (
                <TouchableOpacity
                  key={dept.value}
                  style={[
                    styles.pickerOption,
                    formData.inquiryType === dept.value && styles.pickerOptionSelected
                  ]}
                  onPress={() => handleInputChange('inquiryType', dept.value)}
                >
                  <Text style={[
                    styles.pickerOptionText,
                    formData.inquiryType === dept.value && styles.pickerOptionTextSelected
                  ]}>
                    {dept.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Subject *</Text>
          <TextInput
            style={styles.input}
            value={formData.subject}
            onChangeText={(value) => handleInputChange('subject', value)}
            placeholder="What is this regarding?"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Message *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.message}
            onChangeText={(value) => handleInputChange('message', value)}
            placeholder="Tell us more about your inquiry..."
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Send size={20} color="#fff" />
              <Text style={styles.submitButtonText}>Send Message</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Support Options */}
      <View style={styles.supportSection}>
        <Text style={styles.sectionTitle}>Other Ways to Reach Us</Text>
        {supportOptions.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={styles.supportCard}
            onPress={() => handleSupportAction(option.actionType)}
          >
            <View style={styles.supportHeader}>
              <View style={styles.supportIcon}>
                <option.icon size={20} color="#007bff" />
              </View>
              <View style={styles.supportContent}>
                <Text style={styles.supportTitle}>{option.title}</Text>
                <Text style={styles.supportDescription}>{option.description}</Text>
              </View>
              <Text style={styles.supportAction}>{option.action}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* FAQ Section */}
      <View style={styles.faqSection}>
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        <Text style={styles.sectionSubtitle}>
          Quick answers to common questions about our services
        </Text>

        {faqs.map((faq, index) => (
          <View key={index} style={styles.faqCard}>
            <Text style={styles.faqQuestion}>{faq.question}</Text>
            <Text style={styles.faqAnswer}>{faq.answer}</Text>
          </View>
        ))}

        <TouchableOpacity
          style={styles.contactSupportButton}
          onPress={() => handleSupportAction('email')}
        >
          <Text style={styles.contactSupportText}>Still have questions? Contact Support</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 50,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  heroSection: {
    backgroundColor: '#007bff',
    padding: 24,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#e6f3ff',
    textAlign: 'center',
    lineHeight: 24,
  },
  contactInfoSection: {
    padding: 16,
  },
  contactCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  contactDetail: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  formSection: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#dc2626',
    marginLeft: 8,
    fontSize: 14,
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  inputGroup: {
    flex: 1,
    marginRight: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  pickerOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  pickerOptionSelected: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  pickerOptionText: {
    fontSize: 14,
    color: '#374151',
  },
  pickerOptionTextSelected: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#007bff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  supportSection: {
    padding: 16,
  },
  supportCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  supportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  supportIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e6f3ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  supportContent: {
    flex: 1,
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  supportDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  supportAction: {
    fontSize: 14,
    color: '#007bff',
    fontWeight: '600',
  },
  faqSection: {
    padding: 16,
    paddingBottom: 32,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
  },
  faqCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  contactSupportButton: {
    backgroundColor: '#007bff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  contactSupportText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  successContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
    padding: 20,
  },
  successCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  successButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  successButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
