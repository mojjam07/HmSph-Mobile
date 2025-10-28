import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  Alert,
  Linking,
  Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Search, MapPin, Star, Phone, Mail, MessageCircle, Award, Users, Home, AlertCircle, ArrowLeft } from 'lucide-react-native';
import ApiService from '../api/ApiService';

export default function AgentsScreen() {
  const navigation = useNavigation();
  const [agents, setAgents] = useState([]);
  const [agentReviews, setAgentReviews] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');

  const locationOptions = [
    { value: 'all', label: 'All Locations' },
    { value: 'Lagos', label: 'Lagos' },
    { value: 'Abuja', label: 'Abuja' },
    { value: 'Port Harcourt', label: 'Port Harcourt' },
    { value: 'Kano', label: 'Kano' },
    { value: 'Ibadan', label: 'Ibadan' }
  ];

  const specialtyOptions = [
    { value: 'all', label: 'All Specialties' },
    { value: 'luxury', label: 'Luxury Homes' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'residential', label: 'Residential' },
    { value: 'investment', label: 'Investment' },
    { value: 'land', label: 'Land Development' }
  ];

  useEffect(() => {
    fetchAgents();
  }, [searchQuery, selectedLocation, selectedSpecialty]);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters = {};
      if (searchQuery) filters.search = searchQuery;
      if (selectedLocation !== 'all') filters.location = selectedLocation;
      if (selectedSpecialty !== 'all') filters.specialty = selectedSpecialty;

      const data = await ApiService.getAgents(filters);
      const agentsData = data.agents || data || [];
      setAgents(agentsData);

      // Fetch reviews for each agent
      if (agentsData.length > 0) {
        fetchAgentReviews(agentsData);
      }
    } catch (err) {
      console.error('Error fetching agents:', err);
      setError(err.message || 'Failed to load agents');
    } finally {
      setLoading(false);
    }
  };

  const fetchAgentReviews = async (agentsList) => {
    try {
      const reviewsData = {};
      for (const agent of agentsList) {
        try {
          const reviews = await ApiService.getAgentReviews(agent.id);
          reviewsData[agent.id] = reviews || [];
        } catch (reviewErr) {
          console.error(`Error fetching reviews for agent ${agent.id}:`, reviewErr);
          reviewsData[agent.id] = [];
        }
      }
      setAgentReviews(reviewsData);
    } catch (err) {
      console.error('Error fetching agent reviews:', err);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const safeRating = Number(rating) || 0;
    const fullStars = Math.floor(safeRating);
    const hasHalfStar = safeRating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} size={16} color="#fbbf24" fill="#fbbf24" />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" size={16} color="#fbbf24" fill="#fbbf24" opacity={0.5} />);
    }

    const emptyStars = 5 - Math.ceil(safeRating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} size={16} color="#d1d5db" />);
    }

    return stars;
  };

  const calculateAverageRating = (agentId) => {
    const reviews = agentReviews[agentId] || [];
    if (reviews.length === 0) return 0;

    const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
    return totalRating / reviews.length;
  };

  const handleContactAgent = async (agentId, contactType) => {
    try {
      const response = await fetch(`${ApiService.BASE_URL}/agents/${agentId}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(ApiService.getAuthToken() && { 'Authorization': `Bearer ${ApiService.getAuthToken()}` })
        },
        body: JSON.stringify({
          contactType,
          userId: null // Will be handled by backend
        })
      });

      if (!response.ok) {
        throw new Error('Failed to initiate contact');
      }

      const result = await response.json();

      if (contactType === 'call') {
        await Linking.openURL(`tel:${result.phone || result.data?.phone}`);
      } else if (contactType === 'email') {
        await Linking.openURL(`mailto:${result.email || result.data?.email}`);
      } else if (contactType === 'message') {
        Alert.alert('Coming Soon', 'Messaging feature will be available soon!');
      }
    } catch (err) {
      console.error('Error contacting agent:', err);
      Alert.alert('Error', 'Failed to contact agent. Please try again.');
    }
  };

  const renderAgent = ({ item: agent }) => {
    if (!agent || typeof agent !== 'object') return null;

    // Only show agents with APPROVED verification status
    if (agent.verificationStatus !== 'APPROVED') return null;

    const averageRating = calculateAverageRating(agent.id);
    const reviewCount = (agentReviews[agent.id] || []).length;

    return (
      <View style={styles.agentCard}>
        <View style={styles.agentHeader}>
          <Image
            source={{ uri: agent.image || agent.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.name || 'Agent')}&background=3B82F6&color=fff` }}
            style={styles.agentImage}
            defaultSource={{ uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.name || 'Agent')}&background=3B82F6&color=fff` }}
          />
          <View style={styles.agentInfo}>
            <Text style={styles.agentName}>{agent.name || 'Unknown Agent'}</Text>
            <Text style={styles.agentTitle}>{agent.title || 'Real Estate Agent'}</Text>
          </View>
        </View>

        {/* Rating and Reviews */}
        <View style={styles.ratingContainer}>
          <View style={styles.starsContainer}>
            {renderStars(averageRating)}
          </View>
          <Text style={styles.ratingText}>
            {averageRating.toFixed(1)} ({reviewCount} reviews)
          </Text>
        </View>

        {/* Location */}
        <View style={styles.locationContainer}>
          <MapPin size={16} color="#6b7280" />
          <Text style={styles.locationText}>{agent.location || 'Location not specified'}</Text>
        </View>

        {/* Bio */}
        <Text style={styles.agentBio} numberOfLines={3}>
          {agent.bio || agent.description || 'Experienced real estate professional dedicated to helping clients find their perfect property.'}
        </Text>

        {/* Specialties */}
        <View style={styles.specialtiesContainer}>
          {(agent.specialties || ['Real Estate']).map((specialty, index) => (
            <View key={index} style={styles.specialtyTag}>
              <Text style={styles.specialtyText}>{specialty}</Text>
            </View>
          ))}
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Home size={16} color="#007bff" />
            <Text style={styles.statValue}>{agent.propertiesSold || 0}</Text>
            <Text style={styles.statLabel}>Sold</Text>
          </View>
          <View style={styles.statItem}>
            <Award size={16} color="#10b981" />
            <Text style={styles.statValue}>{agent.yearsExperience || 0}</Text>
            <Text style={styles.statLabel}>Years</Text>
          </View>
          <View style={styles.statItem}>
            <Users size={16} color="#8b5cf6" />
            <Text style={styles.statValue}>{reviewCount}</Text>
            <Text style={styles.statLabel}>Reviews</Text>
          </View>
        </View>

        {/* Contact Buttons */}
        <View style={styles.contactButtons}>
          <TouchableOpacity
            style={styles.contactButton}
            onPress={() => handleContactAgent(agent.id || agent._id, 'call')}
          >
            <Phone size={16} color="#007bff" />
            <Text style={styles.contactButtonText}>Call</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.contactButton}
            onPress={() => handleContactAgent(agent.id || agent._id, 'message')}
          >
            <MessageCircle size={16} color="#10b981" />
            <Text style={styles.contactButtonText}>Message</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.contactButton}
            onPress={() => handleContactAgent(agent.id || agent._id, 'email')}
          >
            <Mail size={16} color="#6b7280" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderFilterOption = (options, selectedValue, onSelect) => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterOptions}>
      {options.map((option) => (
        <TouchableOpacity
          key={option.value}
          style={[
            styles.filterOption,
            selectedValue === option.value && styles.filterOptionSelected
          ]}
          onPress={() => onSelect(option.value)}
        >
          <Text style={[
            styles.filterOptionText,
            selectedValue === option.value && styles.filterOptionTextSelected
          ]}>
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading agents...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <AlertCircle size={48} color="#ef4444" />
        <Text style={styles.errorTitle}>Error Loading Agents</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchAgents}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meet Our Expert Agents</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Hero Section */}
      <View style={styles.heroSection}>
        <Text style={styles.heroTitle}>Meet Our Expert Agents</Text>
        <Text style={styles.heroSubtitle}>
          Connect with experienced professionals who understand your needs
        </Text>
      </View>

      {/* Search and Filters */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Search size={20} color="#6b7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search agents by name or specialty..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <Text style={styles.filterTitle}>Location</Text>
        {renderFilterOption(locationOptions, selectedLocation, setSelectedLocation)}

        <Text style={styles.filterTitle}>Specialty</Text>
        {renderFilterOption(specialtyOptions, selectedSpecialty, setSelectedSpecialty)}
      </View>

      {/* Agents List */}
      <FlatList
        data={agents}
        renderItem={renderAgent}
        keyExtractor={(item) => (item.id || item._id).toString()}
        contentContainerStyle={styles.agentsList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Users size={48} color="#9ca3af" />
            <Text style={styles.emptyTitle}>No agents found</Text>
            <Text style={styles.emptyMessage}>
              Try adjusting your search criteria or filters
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#f9fafb',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
    backgroundColor: '#10b981',
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
    color: '#d1fae5',
    textAlign: 'center',
  },
  searchSection: {
    backgroundColor: '#fff',
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
    marginTop: 8,
  },
  filterOptions: {
    marginBottom: 8,
  },
  filterOption: {
    backgroundColor: '#f9fafb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterOptionSelected: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  filterOptionText: {
    fontSize: 14,
    color: '#6b7280',
  },
  filterOptionTextSelected: {
    color: '#fff',
  },
  agentsList: {
    padding: 16,
  },
  agentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  agentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  agentImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 12,
  },
  agentInfo: {
    flex: 1,
  },
  agentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  agentTitle: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '500',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingText: {
    fontSize: 14,
    color: '#6b7280',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 4,
  },
  agentBio: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    marginBottom: 12,
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  specialtyTag: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  specialtyText: {
    fontSize: 12,
    color: '#1d4ed8',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  contactButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginHorizontal: 2,
  },
  contactButtonText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
});
