import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import ApiService from '../api/ApiService';
import {
  Home,
  Plus,
  Star,
  DollarSign,
  TrendingUp,
  Users,
  Building,
  ArrowLeft,
  Edit3,
  Eye,
  MessageSquare,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

const AgentDashboardScreen = () => {
  const navigation = useNavigation();
  const { user, isAgent } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    properties: [],
    reviews: [],
    stats: {
      totalProperties: 0,
      activeListings: 0,
      totalReviews: 0,
      averageRating: 0,
      monthlyRevenue: 0,
      inquiries: 0
    }
  });

  useEffect(() => {
    if (!isAgent()) {
      Alert.alert('Access Denied', 'You need agent privileges to access this screen.');
      navigation.goBack();
      return;
    }
    loadDashboardData();
  }, []);

  const checkAgentProfile = async () => {
    try {
      const agentProfile = await ApiService.getAgentProfile();
      return agentProfile;
    } catch (error) {
      console.error('Error fetching agent profile:', error);
      return null;
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // First check if agent profile exists
      const agentProfile = await checkAgentProfile();
      if (!agentProfile) {
        Alert.alert(
          'Agent Profile Not Found',
          'Your agent profile is not set up yet. Please contact support or create an agent account.',
          [
            { text: 'OK', onPress: () => navigation.goBack() }
          ]
        );
        return;
      }

      // Load agent's properties using agent ID from profile
      const propertiesResponse = await ApiService.getAgentProperties(agentProfile.id);
      const properties = propertiesResponse || [];

      // Load agent's reviews using agent ID from profile
      const reviewsResponse = await ApiService.getAgentReviews(agentProfile.id);
      const reviews = reviewsResponse || [];

      // Calculate stats
      const activeListings = properties.filter(p => p.status === 'ACTIVE').length;
      const totalReviews = reviews.length;
      const averageRating = totalReviews > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0;

      setDashboardData({
        properties,
        reviews,
        stats: {
          totalProperties: properties.length,
          activeListings,
          totalReviews,
          averageRating: Math.round(averageRating * 10) / 10,
          monthlyRevenue: 0, // Would need payment data
          inquiries: 0 // Would need contact data
        }
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const renderStatCard = (title, value, icon, color) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statIcon}>
        {icon}
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </View>
  );

  const renderPropertyCard = (property) => (
    <TouchableOpacity
      key={property.id}
      style={styles.propertyCard}
      onPress={() => navigation.navigate('PropertyDetails', { propertyId: property.id })}
    >
      <View style={styles.propertyHeader}>
        <Text style={styles.propertyTitle} numberOfLines={1}>
          {property.title}
        </Text>
        <View style={[styles.statusBadge,
          property.status === 'ACTIVE' ? styles.activeBadge :
          property.status === 'PENDING' ? styles.pendingBadge :
          styles.soldBadge
        ]}>
          <Text style={styles.statusText}>{property.status}</Text>
        </View>
      </View>

      <Text style={styles.propertyPrice}>
        ₦{property.price?.toLocaleString() || 'N/A'}
      </Text>

      <View style={styles.propertyDetails}>
        <Text style={styles.propertyDetail}>
          {property.bedrooms || 0} bed • {property.bathrooms || 0} bath
        </Text>
        <Text style={styles.propertyLocation}>
          {property.city}, {property.state}
        </Text>
      </View>

      <View style={styles.propertyActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Edit3 size={16} color="#6b7280" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Eye size={16} color="#6b7280" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <MessageSquare size={16} color="#6b7280" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
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
        <Text style={styles.headerTitle}>Agent Dashboard</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeTitle}>
          Welcome back, {user?.firstName}!
        </Text>
        <Text style={styles.welcomeSubtitle}>
          Here's an overview of your real estate business
        </Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {renderStatCard(
          'Total Properties',
          dashboardData.stats.totalProperties,
          <Building size={24} color="#3b82f6" />,
          '#3b82f6'
        )}
        {renderStatCard(
          'Active Listings',
          dashboardData.stats.activeListings,
          <Home size={24} color="#10b981" />,
          '#10b981'
        )}
        {renderStatCard(
          'Average Rating',
          dashboardData.stats.averageRating,
          <Star size={24} color="#f59e0b" />,
          '#f59e0b'
        )}
        {renderStatCard(
          'Total Reviews',
          dashboardData.stats.totalReviews,
          <MessageSquare size={24} color="#8b5cf6" />,
          '#8b5cf6'
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsSection}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Properties', { showAgentForm: true })}
          >
            <Plus size={24} color="#007bff" />
            <Text style={styles.actionText}>Add Property</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Properties')}
          >
            <Building size={24} color="#10b981" />
            <Text style={styles.actionText}>View Listings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Reviews')}
          >
            <Star size={24} color="#f59e0b" />
            <Text style={styles.actionText}>View Reviews</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Profile')}
          >
            <Users size={24} color="#8b5cf6" />
            <Text style={styles.actionText}>Profile</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Properties */}
      <View style={styles.propertiesSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Properties</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Properties')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {dashboardData.properties.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.propertiesScroll}>
            {dashboardData.properties.slice(0, 3).map(renderPropertyCard)}
          </ScrollView>
        ) : (
          <View style={styles.emptyState}>
            <Building size={48} color="#9ca3af" />
            <Text style={styles.emptyTitle}>No properties yet</Text>
            <Text style={styles.emptyMessage}>
              Start building your portfolio by adding your first property
            </Text>
            <TouchableOpacity
              style={styles.addPropertyButton}
              onPress={() => navigation.navigate('Properties', { showAgentForm: true })}
            >
              <Text style={styles.addPropertyText}>Add Your First Property</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Recent Reviews */}
      <View style={styles.reviewsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Reviews</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Reviews')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {dashboardData.reviews.length > 0 ? (
          dashboardData.reviews.slice(0, 3).map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <View style={styles.reviewUser}>
                  <Text style={styles.reviewUserName}>
                    {review.User?.name || review.userName || 'Anonymous'}
                  </Text>
                  <View style={styles.reviewRating}>
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        color={i < review.rating ? '#f59e0b' : '#d1d5db'}
                        fill={i < review.rating ? '#f59e0b' : 'transparent'}
                      />
                    ))}
                  </View>
                </View>
                <Text style={styles.reviewDate}>
                  {new Date(review.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <Text style={styles.reviewComment} numberOfLines={2}>
                {review.comment}
              </Text>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Star size={48} color="#9ca3af" />
            <Text style={styles.emptyTitle}>No reviews yet</Text>
            <Text style={styles.emptyMessage}>
              Reviews will appear here once clients leave feedback
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  welcomeSection: {
    padding: 20,
    backgroundColor: '#fff',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    gap: 16,
  },
  statCard: {
    flex: 1,
    minWidth: (width - 40 - 16) / 2,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    marginBottom: 12,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  actionsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    minWidth: (width - 40 - 24) / 2,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
  },
  propertiesSection: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    color: '#007bff',
    fontWeight: '600',
  },
  propertiesScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  propertyCard: {
    width: 280,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  propertyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  propertyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadge: {
    backgroundColor: '#dcfce7',
  },
  pendingBadge: {
    backgroundColor: '#fef3c7',
  },
  soldBadge: {
    backgroundColor: '#fee2e2',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f2937',
  },
  propertyPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 8,
  },
  propertyDetails: {
    marginBottom: 12,
  },
  propertyDetail: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  propertyLocation: {
    fontSize: 14,
    color: '#6b7280',
  },
  propertyActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  actionButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  addPropertyButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addPropertyText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  reviewsSection: {
    padding: 20,
    paddingBottom: 40,
  },
  reviewCard: {
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
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  reviewUser: {
    flex: 1,
  },
  reviewUserName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  reviewRating: {
    flexDirection: 'row',
  },
  reviewDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  reviewComment: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
});

export default AgentDashboardScreen;
