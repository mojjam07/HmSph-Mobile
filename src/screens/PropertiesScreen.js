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
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Filter, MapPin, Bed, Bath, Square, Heart, RefreshCw, AlertCircle, ArrowLeft } from 'lucide-react-native';
import PropertyCard from '../components/PropertyCard';
import AgentPropertyForm from '../components/AgentPropertyForm';
import ApiService from '../api/ApiService';

export default function PropertiesScreen({ route }) {
  const navigation = useNavigation();
  const { showAgentForm, showAgentProperties } = route?.params || {};
  const [showFilters, setShowFilters] = useState(false);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [favorites, setFavorites] = useState(new Set());
  const [showAgentPropertyForm, setShowAgentPropertyForm] = useState(showAgentForm || false);

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
    if (showAgentForm) {
      setShowAgentPropertyForm(true);
    }
    fetchProperties();
    fetchFavorites();
  }, [showAgentForm, showAgentProperties]);

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

      let data;
      if (showAgentProperties) {
        // Fetch agent's own properties
        const agentProfile = await ApiService.getAgentProfile();
        if (agentProfile) {
          data = await ApiService.getAgentProperties(agentProfile.id);
        } else {
          setError('Agent profile not found');
          return;
        }
      } else {
        // Fetch all properties with filters
        const filters = {};
        if (searchQuery) filters.search = searchQuery;
        if (selectedPropertyType !== 'all') filters.type = selectedPropertyType;
        if (priceRange !== 'all') filters.priceRange = priceRange;
        if (sortBy !== 'newest') filters.sort = sortBy;

        data = await ApiService.getProperties(filters);
      }

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

  // Show agent property form if requested
  if (showAgentPropertyForm) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              setShowAgentPropertyForm(false);
              navigation.goBack();
            }}
          >
            <ArrowLeft size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add New Property</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.agentFormContainer}>
          <Text style={styles.agentFormTitle}>Create Property Listing</Text>
          <Text style={styles.agentFormSubtitle}>
            Fill in the details below to add a new property to your portfolio
          </Text>
          <AgentPropertyForm
            navigation={navigation}
            onSuccess={() => {
              setShowAgentPropertyForm(false);
              // Optionally refresh the properties list
              fetchProperties();
            }}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading properties...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {showAgentProperties ? 'My Properties' : 'Find Your Dream Property'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Hero Section - Only show for general property search */}
      {!showAgentProperties && (
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Find Your Dream Property</Text>
          <Text style={styles.heroSubtitle}>Discover premium properties across Nigeria</Text>
        </View>
      )}

      {/* Search Bar - Only show for general property search */}
      {!showAgentProperties && (
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
      )}

      {/* Results Section */}
      <View style={styles.resultsSection}>
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            {loading ? 'Loading properties...' : `${properties.length} ${showAgentProperties ? 'Properties' : 'Properties Found'}`}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  heroSection: {
    backgroundColor: '#007bff',
    padding: 24,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#e6f2ff',
    textAlign: 'center',
  },
  searchSection: {
    backgroundColor: '#ffffff',
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
    backgroundColor: '#f8f9fa',
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
    color: '#000000',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  filterButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#666666',
  },
  filtersContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12,
    marginTop: 8,
  },
  filterOptions: {
    marginBottom: 8,
  },
  filterOption: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#cccccc',
  },
  filterOptionSelected: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  filterOptionText: {
    fontSize: 14,
    color: '#666666',
  },
  filterOptionTextSelected: {
    color: '#ffffff',
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
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc',
  },
  resultsCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
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
    color: '#000000',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dc3545',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
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
    color: '#000000',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
  },
  agentFormContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8fafc',
  },
  agentFormTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  agentFormSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 32,
  },
  formPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  placeholderText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  placeholderSubtext: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
});
