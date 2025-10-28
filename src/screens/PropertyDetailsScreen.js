import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Heart, MapPin, Bed, Bath, Square, Phone, Mail, ArrowLeft, Share } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import ApiService from '../api/ApiService';

export default function PropertyDetailsScreen() {
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const { user } = useAuth();
  const navigation = useNavigation();
  const route = useRoute();
  const { property: initialProperty } = route.params;

  useEffect(() => {
    setProperty(initialProperty);
    checkIfFavorite();
    setLoading(false);
  }, [initialProperty]);

  const checkIfFavorite = async () => {
    if (!user) return;

    try {
      const favorites = await ApiService.getFavorites();
      const isFav = favorites.some(fav => fav.id === initialProperty.id);
      setIsFavorite(isFav);
    } catch (error) {
      console.error('Error checking favorites:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to save favorites');
      navigation.navigate('RoleSelection');
      return;
    }

    const newFavoriteState = !isFavorite;
    setIsFavorite(newFavoriteState);

    try {
      if (newFavoriteState) {
        await ApiService.addToFavorites(property.id);
      } else {
        await ApiService.removeFromFavorites(property.id);
      }
    } catch (error) {
      setIsFavorite(!newFavoriteState); // Revert on error
      Alert.alert('Error', 'Failed to update favorites');
    }
  };

  const formatPrice = (amount) => {
    if (amount >= 1000000) {
      return `₦${(amount / 1000000).toFixed(1)}M`;
    }
    return `₦${amount.toLocaleString()}`;
  };

  const handleContactAgent = () => {
    Alert.alert(
      'Contact Agent',
      `Call ${property.agent?.user?.firstName} ${property.agent?.user?.lastName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => {/* Implement phone call */} },
      ]
    );
  };

  const handleShare = () => {
    Alert.alert('Share', 'Share functionality coming soon!');
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  if (!property) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Property not found</Text>
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
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Share size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: property.images?.[0] || 'https://via.placeholder.com/400x300' }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.priceBadge}>
          <Text style={styles.priceText}>{formatPrice(property.price)}</Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={2}>{property.title}</Text>
          <TouchableOpacity
            style={[styles.favoriteButton, isFavorite && styles.favoriteButtonActive]}
            onPress={toggleFavorite}
          >
            <Heart size={24} color={isFavorite ? '#fff' : '#666'} fill={isFavorite ? '#fff' : 'none'} />
          </TouchableOpacity>
        </View>

        <View style={styles.location}>
          <MapPin size={16} color="#666" />
          <Text style={styles.locationText}>
            {property.address}, {property.city}, {property.state}
          </Text>
        </View>

        {/* Features */}
        <View style={styles.features}>
          <View style={styles.feature}>
            <Bed size={20} color="#666" />
            <Text style={styles.featureText}>{property.bedrooms} Bedrooms</Text>
          </View>
          <View style={styles.feature}>
            <Bath size={20} color="#666" />
            <Text style={styles.featureText}>{property.bathrooms} Bathrooms</Text>
          </View>
          <View style={styles.feature}>
            <Square size={20} color="#666" />
            <Text style={styles.featureText}>{property.squareFootage} sqft</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{property.description}</Text>
        </View>

        {/* Agent Info */}
        {property.agent && (
          <View style={styles.agentSection}>
            <Text style={styles.sectionTitle}>Listed by</Text>
            <View style={styles.agentCard}>
              <Image
                source={{ uri: 'https://via.placeholder.com/60x60' }}
                style={styles.agentAvatar}
              />
              <View style={styles.agentInfo}>
                <Text style={styles.agentName}>
                  {property.agent.user?.firstName} {property.agent.user?.lastName}
                </Text>
                <Text style={styles.agentRating}>⭐ 4.8 • Licensed Agent</Text>
              </View>
              <View style={styles.agentActions}>
                <TouchableOpacity style={styles.contactButton} onPress={handleContactAgent}>
                  <Phone size={16} color="#fff" />
                  <Text style={styles.contactButtonText}>Call</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.messageButton}>
                  <Mail size={16} color="#007bff" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Property Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Property Details</Text>
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Property Type</Text>
              <Text style={styles.detailValue}>{property.propertyType}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Year Built</Text>
              <Text style={styles.detailValue}>{property.yearBuilt || 'N/A'}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Parking</Text>
              <Text style={styles.detailValue}>{property.parking || 'N/A'}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Furnished</Text>
              <Text style={styles.detailValue}>{property.furnished ? 'Yes' : 'No'}</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
  },
  backButton: {
    padding: 8,
  },
  shareButton: {
    padding: 8,
  },
  imageContainer: {
    position: 'relative',
    height: 300,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  priceBadge: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  priceText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
    marginRight: 12,
  },
  favoriteButton: {
    padding: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  favoriteButtonActive: {
    backgroundColor: '#ef4444',
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
  },
  features: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
    paddingVertical: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
  },
  feature: {
    alignItems: 'center',
  },
  featureText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  agentSection: {
    marginBottom: 24,
  },
  agentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
  },
  agentAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  agentInfo: {
    flex: 1,
  },
  agentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  agentRating: {
    fontSize: 14,
    color: '#666',
  },
  agentActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007bff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  messageButton: {
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#007bff',
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  detailItem: {
    width: '50%',
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
  },
});
