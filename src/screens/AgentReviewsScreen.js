import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Dimensions
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import ApiService from '../api/ApiService';
import {
  ArrowLeft,
  Star,
  MessageSquare,
  TrendingUp,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

const AgentReviewsScreen = () => {
  const navigation = useNavigation();
  const { user, isAgent } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    fiveStarReviews: 0,
    responseRate: 0
  });

  useEffect(() => {
    if (!isAgent()) {
      Alert.alert('Access Denied', 'You need agent privileges to access this screen.');
      navigation.goBack();
      return;
    }
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      setLoading(true);

      // Get agent profile to get agent ID
      const agentProfile = await ApiService.getAgentProfile();
      if (!agentProfile) {
        Alert.alert('Error', 'Agent profile not found');
        return;
      }

      // Load agent's reviews
      const reviewsResponse = await ApiService.getAgentReviews(agentProfile.id);
      const reviewsData = reviewsResponse || [];

      setReviews(reviewsData);

      // Calculate stats
      const totalReviews = reviewsData.length;
      const averageRating = totalReviews > 0
        ? reviewsData.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0;
      const fiveStarReviews = reviewsData.filter(r => r.rating === 5).length;

      setStats({
        totalReviews,
        averageRating: Math.round(averageRating * 10) / 10,
        fiveStarReviews,
        responseRate: 85 // Default for now
      });
    } catch (error) {
      console.error('Error loading reviews:', error);
      Alert.alert('Error', 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReviews();
    setRefreshing(false);
  };

  const renderStatCard = (title, value, subtitle, icon, color) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statIcon}>
        {icon}
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
        {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
      </View>
    </View>
  );

  const getStatusIcon = (status) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle size={16} color="#10b981" />;
      case 'REJECTED':
        return <XCircle size={16} color="#ef4444" />;
      default:
        return <Clock size={16} color="#f59e0b" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED':
        return '#dcfce7';
      case 'REJECTED':
        return '#fef2f2';
      default:
        return '#fef3c7';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading reviews...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Reviews</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View key="total-reviews">
          {renderStatCard(
            'Total Reviews',
            stats.totalReviews,
            null,
            <MessageSquare size={24} color="#3b82f6" />,
            '#3b82f6'
          )}
        </View>
        <View key="average-rating">
          {renderStatCard(
            'Average Rating',
            stats.averageRating,
            null,
            <Star size={24} color="#f59e0b" />,
            '#f59e0b'
          )}
        </View>
        <View key="five-star-reviews">
          {renderStatCard(
            '5-Star Reviews',
            stats.fiveStarReviews,
            null,
            <TrendingUp size={24} color="#10b981" />,
            '#10b981'
          )}
        </View>
        <View key="response-rate">
          {renderStatCard(
            'Response Rate',
            `${stats.responseRate}%`,
            null,
            <RefreshCw size={24} color="#8b5cf6" />,
            '#8b5cf6'
          )}
        </View>
      </View>

      {/* Reviews List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>All Reviews</Text>

        {reviews.length > 0 ? (
          reviews.map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <View style={styles.reviewUser}>
                  <Text style={styles.reviewUserName}>
                    {review.User ? `${review.User.firstName} ${review.User.lastName}` : (review.userName || 'Anonymous')}
                  </Text>
                  <View style={styles.reviewRating}>
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={`star-${review.id}-${i}`}
                        size={14}
                        color={i < review.rating ? '#f59e0b' : '#d1d5db'}
                        fill={i < review.rating ? '#f59e0b' : 'transparent'}
                      />
                    ))}
                  </View>
                </View>
                <View style={styles.reviewMeta}>
                  <Text style={styles.reviewDate}>
                    {new Date(review.createdAt).toLocaleDateString()}
                  </Text>
                  <View style={[styles.statusBadge,
                    { backgroundColor: getStatusColor(review.status) }
                  ]}>
                    {getStatusIcon(review.status)}
                    <Text style={styles.statusText}>{review.status}</Text>
                  </View>
                </View>
              </View>

              <Text style={styles.reviewProperty}>
                Property: {review.propertyTitle || 'N/A'}
              </Text>
              <Text style={styles.reviewLocation}>
                Location: {review.propertyLocation || 'N/A'}
              </Text>

              <Text style={styles.reviewComment}>
                {review.comment}
              </Text>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <MessageSquare size={48} color="#9ca3af" />
            <Text style={styles.emptyTitle}>No reviews yet</Text>
            <Text style={styles.emptyMessage}>
              Reviews will appear here once clients leave feedback on your properties
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
  statSubtitle: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
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
  reviewMeta: {
    alignItems: 'flex-end',
  },
  reviewDate: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 4,
  },
  reviewProperty: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  reviewLocation: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  reviewComment: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
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
  },
});

export default AgentReviewsScreen;
