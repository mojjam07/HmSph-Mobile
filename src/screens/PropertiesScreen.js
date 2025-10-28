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
  RefreshControl
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Search, Filter, MapPin, Bed, Bath, Square, Heart, RefreshCw, AlertCircle, ArrowLeft } from 'lucide-react-native';
import PropertyCard from '../components/PropertyCard';
import ApiService from '../api/ApiService';

export default function PropertiesScreen() {
  const navigation = useNavigation();
  const [showFilters, setShowFilters] = useState(false);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [favorites, setFavorites] = useState(new Set());

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPropertyType, setSelectedPropertyType] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const propertyTypeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'house', label: 'House' },
    { value: 'apartment', label: 'Apartment' },
    { value: 'villa', label: 'Villa' },
    { value: 'condo', label: 'Condo' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'land', label: 'Land' }
  ];

  const priceRangeOptions = [
    { value: 'all', label: 'All Prices' },
    { value: 'under50', label: 'Under ₦50M' },
    { value: '50to100', label: '₦50M - ₦100M' },
    { value: 'over100', label: 'Over ₦100M' }
  ];

  const sortByOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'featured', label: 'Featured First' }
  ];

  useEffect(() => {
    fetchProperties();
    fetchFavorites();
  }, []);

  useEffect(() => {
    // Debounce search
    const timeoutId = setTimeout(() => {
      fetchProperties();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedPropertyType, priceRange, sortBy]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters = {};
      if (searchQuery) filters.search = searchQuery;
      if (selectedPropertyType !== 'all') filters.type = selectedPropertyType;
      if (priceRange !== 'all') filters.priceRange = priceRange;
      if (sortBy !== 'newest') filters.sort = sortBy;

      const data = await ApiService.getProperties(filters);
      setProperties(data.properties || data || []);
    } catch (err) {
      console.error('Error fetching properties:', err);
      setError(err.message || 'Failed to load properties');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const data = await ApiService.getFavorites();
      const favoriteIds = new Set((data.properties || []).map(prop => prop.id || prop.listingId));
      setFavorites(favoriteIds);
    } catch (err) {
      console.error('Error fetching favorites:', err);
    }
  };

  const toggleFavorite = async (propertyId) => {
    try {
      const isFavorite = favorites.has(propertyId);
      if (isFavorite) {
        await ApiService.removeFromFavorites(propertyId);
        setFavorites(prev => {
          const newFavorites = new Set(prev);
          newFavorites.delete(propertyId);
          return newFavorites;
        });
      } else {
        await ApiService.addToFavorites(propertyId);
        setFavorites(prev => new Set([...prev, propertyId]));
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
      Alert.alert('Error', 'Failed to update favorites. Please try again.');
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchProperties();
    fetchFavorites();
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedPropertyType('all');
    setPriceRange('all');
    setSortBy('newest');
  };

  const handlePropertyPress = (property) => {
    navigation.navigate('PropertyDetails', { property });
  };

  const renderProperty = ({ item }) => (
    <PropertyCard
      property={item}
      onPress={() => handlePropertyPress(item)}
      onToggleFavorite={() => toggleFavorite(item.id || item.listingId)}
      isFavorite={favorites.has(item.id || item.listingId)}
    />
  );

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

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading properties...</Text>
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
        <Text style={styles.headerTitle}>Find Your Dream Property</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Hero Section */}
      <View style={styles.heroSection}>
        <Text style={styles.heroTitle}>Find Your Dream Property</Text>
        <Text style={styles.heroSubtitle}>Discover premium properties across Nigeria</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color="#6b7280" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by location, property type..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Filter size={20} color="#6b7280" />
            <Text style={styles.filterButtonText}>Filters</Text>
          </TouchableOpacity>
        </View>

        {/* Filters */}
        {showFilters && (
          <View style={styles.filtersContainer}>
            <Text style={styles.filtersTitle}>Property Type</Text>
            {renderFilterOption(propertyTypeOptions, selectedPropertyType, setSelectedPropertyType)}

            <Text style={styles.filtersTitle}>Price Range</Text>
            {renderFilterOption(priceRangeOptions, priceRange, setPriceRange)}

            <Text style={styles.filtersTitle}>Sort By</Text>
            {renderFilterOption(sortByOptions, sortBy, setSortBy)}

            <TouchableOpacity style={styles.clearFiltersButton} onPress={clearFilters}>
              <Text style={styles.clearFiltersText}>Clear All Filters</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Results Section */}
      <View style={styles.resultsSection}>
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            {loading ? 'Loading properties...' : `${properties.length} Properties Found`}
          </Text>
        </View>

        {/* Error State */}
        {error && (
          <View style={styles.errorContainer}>
            <AlertCircle size={48} color="#ef4444" />
            <Text style={styles.errorTitle}>Unable to load properties</Text>
            <Text style={styles.errorMessage}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchProperties}>
              <RefreshCw size={20} color="#fff" />
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Properties List */}
        {!error && (
          <FlatList
            data={properties}
            renderItem={renderProperty}
            keyExtractor={(item) => (item.id || item.listingId).toString()}
            numColumns={1}
            contentContainerStyle={styles.propertiesList}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListEmptyComponent={
              !loading && (
                <View style={styles.emptyContainer}>
                  <Search size={48} color="#9ca3af" />
                  <Text style={styles.emptyTitle}>No properties found</Text>
                  <Text style={styles.emptyMessage}>
                    Try adjusting your search criteria or filters
                  </Text>
                  <TouchableOpacity style={styles.clearFiltersButton} onPress={clearFilters}>
                    <Text style={styles.clearFiltersText}>Clear Filters</Text>
                  </TouchableOpacity>
                </View>
              )
            }
          />
        )}
      </View>
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
  },
  searchSection: {
    backgroundColor: '#fff',
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  filterButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#6b7280',
  },
  filtersContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
  },
  filtersTitle: {
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
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterOptionSelected: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  filterOptionText: {
    fontSize: 14,
    color: '#6b7280',
  },
  filterOptionTextSelected: {
    color: '#fff',
  },
  clearFiltersButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  clearFiltersText: {
    color: '#007bff',
    fontSize: 14,
    fontWeight: '600',
  },
  resultsSection: {
    flex: 1,
  },
  resultsHeader: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  resultsCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ef4444',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  propertiesList: {
    padding: 16,
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
    marginBottom: 24,
  },
});
