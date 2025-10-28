import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, ScrollView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { Info, Phone, Building, Users, Star, ArrowRight, Heart } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import ApiService from '../api/ApiService';
import PropertyCard from '../components/PropertyCard';

export default function HomeScreen() {
  const [properties, setProperties] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    fetchProperties();
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  const fetchProperties = async () => {
    try {
      const data = await ApiService.getProperties({ limit: 20 });
      setProperties(data);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const data = await ApiService.getFavorites();
      const favoriteIds = data.map(fav => fav.id);
      setFavorites(new Set(favoriteIds));
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchProperties(), fetchFavorites()]);
    setRefreshing(false);
  };

  const toggleFavorite = async (propertyId) => {
    if (!user) {
      // Navigate to login if not authenticated
      navigation.navigate('RoleSelection');
      return;
    }

    const wasFavorite = favorites.has(propertyId);
    const newFavorites = new Set(favorites);

    // Optimistic update
    if (wasFavorite) {
      newFavorites.delete(propertyId);
    } else {
      newFavorites.add(propertyId);
    }
    setFavorites(newFavorites);

    // iOS haptic feedback
    if (Platform.OS === 'ios') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (error) {
        console.error('Haptic feedback failed:', error);
      }
    }

    try {
      if (wasFavorite) {
        await ApiService.removeFromFavorites(propertyId);
      } else {
        await ApiService.addToFavorites(propertyId);
      }
    } catch (error) {
      // Revert on error
      const revertFavorites = new Set(favorites);
      if (wasFavorite) {
        revertFavorites.add(propertyId);
      } else {
        revertFavorites.delete(propertyId);
      }
      setFavorites(revertFavorites);
      console.error('Error updating favorites:', error);
    }
  };

  const handlePropertyPress = (property) => {
    navigation.navigate('PropertyDetails', { property });
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Welcome to HomeSphere</Text>
              <Text style={styles.welcomeText}>
                Hello, {user?.firstName || 'User'}!
              </Text>
            </View>
          </View>
        </View>

      {/* Quick Access Menu */}
      <View style={styles.quickAccessSection}>
        <Text style={styles.sectionTitle}>Quick Access</Text>
        <View style={styles.quickAccessGrid}>
          <TouchableOpacity
            style={styles.quickAccessCard}
            onPress={() => navigation.navigate('Properties')}
          >
            <Building size={24} color="#007bff" />
            <Text style={styles.quickAccessText}>Browse Properties</Text>
            <ArrowRight size={16} color="#007bff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAccessCard}
            onPress={() => navigation.navigate('Agents')}
          >
            <Users size={24} color="#007bff" />
            <Text style={styles.quickAccessText}>Find Agents</Text>
            <ArrowRight size={16} color="#007bff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAccessCard}
            onPress={() => navigation.navigate('Reviews')}
          >
            <Star size={24} color="#007bff" />
            <Text style={styles.quickAccessText}>Read Reviews</Text>
            <ArrowRight size={16} color="#007bff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAccessCard}
            onPress={() => navigation.navigate('Contact')}
          >
            <Phone size={24} color="#007bff" />
            <Text style={styles.quickAccessText}>Contact Us</Text>
            <ArrowRight size={16} color="#007bff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* About Section */}
      <View style={styles.aboutSection}>
        <TouchableOpacity
          style={styles.aboutCard}
          onPress={() => navigation.navigate('About')}
        >
          <View style={styles.aboutContent}>
            <Info size={24} color="#007bff" />
            <View style={styles.aboutTextContainer}>
              <Text style={styles.aboutTitle}>About HomeSphere</Text>
              <Text style={styles.aboutSubtitle}>Learn more about our mission and values</Text>
            </View>
            <ArrowRight size={20} color="#007bff" />
          </View>
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>Featured Properties</Text>

      {properties.length > 0 ? (
        <FlatList
          data={properties}
          renderItem={({ item }) => (
            <PropertyCard
              property={item}
              isFavorite={favorites.has(item.id)}
              onToggleFavorite={toggleFavorite}
              onPress={() => handlePropertyPress(item)}
            />
          )}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          scrollEnabled={false}
        />
      ) : (
        <View style={styles.centerContainer}>
          <Text style={styles.noPropertiesText}>No properties available</Text>
        </View>
      )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  welcomeText: {
    fontSize: 16,
    marginBottom: 10,
  },

  quickAccessSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  quickAccessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAccessCard: {
    borderRadius: 12,
    padding: 16,
    width: '48%',
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#888',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickAccessText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 12,
  },
  aboutSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  aboutCard: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#888',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  aboutContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aboutTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  aboutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  aboutSubtitle: {
    fontSize: 14,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  noPropertiesText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
