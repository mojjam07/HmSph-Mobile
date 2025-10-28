import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Heart, MapPin, Bed, Bath, Square } from 'lucide-react-native';

const PropertyCard = ({ property, isFavorite, onToggleFavorite, onPress }) => {
  const formatPrice = (amount) => {
    if (amount >= 1000000) {
      return `₦${(amount / 1000000).toFixed(1)}M`;
    }
    return `₦${amount.toLocaleString()}`;
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: property.images?.[0] || 'https://via.placeholder.com/400x300' }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Favorite Button */}
        <TouchableOpacity
          style={[styles.favoriteButton, isFavorite && styles.favoriteButtonActive]}
          onPress={() => onToggleFavorite(property.id)}
        >
          <Heart
            size={20}
            color={isFavorite ? '#fff' : '#666'}
            fill={isFavorite ? '#fff' : 'none'}
          />
        </TouchableOpacity>

        {/* Price Badge */}
        <View style={styles.priceBadge}>
          <Text style={styles.priceText}>
            {formatPrice(property.price)}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {property.title}
        </Text>

        <View style={styles.location}>
          <MapPin size={16} color="#666" />
          <Text style={styles.locationText} numberOfLines={1}>
            {property.city}, {property.state}
          </Text>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {property.description}
        </Text>

        {/* Features */}
        <View style={styles.features}>
          <View style={styles.feature}>
            <Bed size={16} color="#666" />
            <Text style={styles.featureText}>{property.bedrooms} beds</Text>
          </View>
          <View style={styles.feature}>
            <Bath size={16} color="#666" />
            <Text style={styles.featureText}>{property.bathrooms} baths</Text>
          </View>
          <View style={styles.feature}>
            <Square size={16} color="#666" />
            <Text style={styles.featureText}>{property.squareFootage} sqft</Text>
          </View>
        </View>

        {/* Agent Info */}
        {property.agent && (
          <View style={styles.agent}>
            <Image
              source={{ uri: 'https://via.placeholder.com/32x32' }}
              style={styles.agentAvatar}
            />
            <View style={styles.agentInfo}>
              <Text style={styles.agentName}>
                {property.agent.user?.firstName} {property.agent.user?.lastName}
              </Text>
              <Text style={styles.agentRating}>⭐ 4.8</Text>
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
    height: 200,
  },
  image: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 8,
  },
  favoriteButtonActive: {
    backgroundColor: '#ef4444',
  },
  priceBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  priceText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  features: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  agent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  agentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  agentInfo: {
    flex: 1,
  },
  agentName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  agentRating: {
    fontSize: 12,
    color: '#666',
  },
});

export default PropertyCard;
