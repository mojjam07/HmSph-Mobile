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
  Modal,
  Dimensions
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Star, MessageSquare, User, Calendar, ThumbsUp, ThumbsDown, Search, CheckCircle, Shield, Users, Award, AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react-native';
import ApiService from '../api/ApiService';

export default function ReviewsScreen() {
  const navigation = useNavigation();
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Calculate review statistics
  const reviewStats = {
    totalReviews: reviews.length,
    averageRating: reviews.length > 0
      ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
      : 4.8,
    ratingDistribution: {
      5: reviews.filter(r => r.rating === 5).length,
      4: reviews.filter(r => r.rating === 4).length,
      3: reviews.filter(r => r.rating === 3).length,
      2: reviews.filter(r => r.rating === 2).length,
      1: reviews.filter(r => r.rating === 1).length
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [filter]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await ApiService.getReviews();
      //console.log('Reviews data received:', data);

      // Ensure data is an array or has reviews array
      let reviewsArray = [];
      if (Array.isArray(data)) {
        reviewsArray = data;
      } else if (data && Array.isArray(data.reviews)) {
        reviewsArray = data.reviews;
      } else if (data && Array.isArray(data.data)) {
        reviewsArray = data.data;
      } else {
        throw new Error('Unexpected response format from reviews API');
      }

      setReviews(reviewsArray);
    } catch (err) {
      console.error('Error fetching reviews:', err);

      // Provide more specific error messages
      let errorMessage = 'Failed to load reviews';

      if (err.message.includes('NetworkError') || err.message.includes('Failed to fetch')) {
        errorMessage = 'Unable to connect to the server. Please check your internet connection.';
      } else if (err.message.includes('401')) {
        errorMessage = 'Authentication required. Please login to view reviews.';
      } else if (err.message.includes('404')) {
        errorMessage = 'Reviews service not found. Please try again later.';
      } else if (err.message.includes('500')) {
        errorMessage = 'Server error. Our team has been notified.';
      } else if (err.message.includes('Unexpected response format')) {
        errorMessage = 'Unexpected response format received from server.';
      } else {
        errorMessage = err.message || 'Failed to load reviews. Please try again later.';
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (reviewId) => {
    try {
      await ApiService.likeReview(reviewId);
      fetchReviews(); // Refresh reviews after liking
    } catch (err) {
      console.error('Error liking review:', err);
      Alert.alert('Error', 'Failed to like review. Please try again.');
    }
  };

  const handleDislike = async (reviewId) => {
    try {
      await ApiService.dislikeReview(reviewId);
      fetchReviews(); // Refresh reviews after disliking
    } catch (err) {
      console.error('Error disliking review:', err);
      Alert.alert('Error', 'Failed to dislike review. Please try again.');
    }
  };

  const handleWriteReview = (property) => {
    setSelectedProperty(property);
    setShowReviewModal(true);
  };

  const handleReviewSubmitted = () => {
    setShowReviewModal(false);
    fetchReviews(); // Refresh reviews after submission
  };

  const getFilteredReviews = () => {
    let filtered = [...reviews];

    // Apply rating filter
    if (ratingFilter !== 'all') {
      filtered = filtered.filter(review => review.rating === parseInt(ratingFilter));
    }

    // Apply legacy filter (for backward compatibility)
    if (filter === 'positive') {
      filtered = filtered.filter(review => review.rating >= 4);
    } else if (filter === 'negative') {
      filtered = filtered.filter(review => review.rating <= 2);
    }

    // Apply search query
    if (searchQuery) {
      filtered = filtered.filter(review =>
        review.comment?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.User?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.Property?.title?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'oldest':
        return filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case 'highest':
        return filtered.sort((a, b) => b.rating - a.rating);
      case 'lowest':
        return filtered.sort((a, b) => a.rating - b.rating);
      default:
        return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  };

  const filteredReviews = getFilteredReviews();

  const getRatingPercentage = (rating) => {
    const total = Object.values(reviewStats.ratingDistribution).reduce((sum, count) => sum + count, 0);
    if (total === 0) return 0;
    return Math.round((reviewStats.ratingDistribution[rating] / total) * 100);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={16}
        color={index < rating ? '#fbbf24' : '#d1d5db'}
        fill={index < rating ? '#fbbf24' : 'transparent'}
      />
    ));
  };

  const renderReview = ({ item: review }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.userInfo}>
          <View style={styles.userAvatar}>
            <User size={20} color="#6b7280" />
          </View>
          <View>
            <Text style={styles.userName}>
              {review.User?.name || review.userName || 'Anonymous User'}
            </Text>
            <View style={styles.ratingContainer}>
              <View style={styles.starsContainer}>
                {renderStars(review.rating)}
              </View>
              <Text style={styles.ratingValue}>{review.rating}/5</Text>
            </View>
          </View>
        </View>
        <View style={styles.reviewDate}>
          <Calendar size={14} color="#6b7280" />
          <Text style={styles.dateText}>
            {new Date(review.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>

      <Text style={styles.reviewComment}>{review.comment}</Text>

      {review.Property && (
        <View style={styles.propertyInfo}>
          <Text style={styles.propertyLabel}>Property: </Text>
          <Text style={styles.propertyTitle}>{review.Property.title}</Text>
        </View>
      )}

      <View style={styles.reviewActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleLike(review.id)}
        >
          <ThumbsUp size={16} color="#6b7280" />
          <Text style={styles.actionText}>{review.likes || 0}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDislike(review.id)}
        >
          <ThumbsDown size={16} color="#6b7280" />
          <Text style={styles.actionText}>{review.dislikes || 0}</Text>
        </TouchableOpacity>
      </View>
    </View>
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading reviews...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <AlertCircle size={48} color="#ef4444" />
        <Text style={styles.errorTitle}>Unable to load reviews</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchReviews}>
          <RefreshCw size={20} color="#fff" />
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={true}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reviews from Our People</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Hero Section */}
      <View style={styles.heroSection}>
        <Text style={styles.heroTitle}>Reviews from Our People</Text>
        <Text style={styles.heroSubtitle}>
          Discover what our community says about their experiences
        </Text>

        <View style={styles.searchContainer}>
          <Search size={20} color="#6b7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search reviews..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Stats Section */}
      <View style={styles.statsSection}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{reviewStats.averageRating}</Text>
          <View style={styles.starsContainer}>
            {[1,2,3,4,5].map(s => (
              <Star
                key={s}
                size={20}
                color={s <= Math.round(reviewStats.averageRating) ? '#fbbf24' : '#d1d5db'}
                fill={s <= Math.round(reviewStats.averageRating) ? '#fbbf24' : 'transparent'}
              />
            ))}
          </View>
          <Text style={styles.statLabel}>Based on {reviewStats.totalReviews} reviews</Text>
        </View>

        <View style={styles.ratingDistribution}>
          {[5,4,3,2,1].map(rating => (
            <View key={rating} style={styles.ratingBar}>
              <Text style={styles.ratingNumber}>{rating}</Text>
              <View style={styles.progressBar}>
                <View
                  style={[styles.progressFill, { width: `${getRatingPercentage(rating)}%` }]}
                />
              </View>
              <Text style={styles.ratingCount}>
                {reviewStats.ratingDistribution[rating]}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Filters Section */}
      <View style={styles.filtersSection}>
        <View style={styles.filterTabs}>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'all' && styles.filterTabSelected]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterTabText, filter === 'all' && styles.filterTabTextSelected]}>
              All Reviews ({reviews.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'positive' && styles.filterTabSelected]}
            onPress={() => setFilter('positive')}
          >
            <Text style={[styles.filterTabText, filter === 'positive' && styles.filterTabTextSelected]}>
              Positive ({reviews.filter(r => r.rating >= 4).length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'negative' && styles.filterTabSelected]}
            onPress={() => setFilter('negative')}
          >
            <Text style={[styles.filterTabText, filter === 'negative' && styles.filterTabTextSelected]}>
              Negative ({reviews.filter(r => r.rating <= 2).length})
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filterControls}>
          <Text style={styles.filterLabel}>Rating</Text>
          {renderFilterOption([
            { value: 'all', label: 'All Ratings' },
            { value: 5, label: '5 Stars' },
            { value: 4, label: '4 Stars' },
            { value: 3, label: '3 Stars' },
            { value: 2, label: '2 Stars' },
            { value: 1, label: '1 Star' }
          ], ratingFilter, setRatingFilter)}

          <Text style={styles.filterLabel}>Sort By</Text>
          {renderFilterOption([
            { value: 'newest', label: 'Newest First' },
            { value: 'oldest', label: 'Oldest First' },
            { value: 'highest', label: 'Highest Rated' },
            { value: 'lowest', label: 'Lowest Rated' }
          ], sortBy, setSortBy)}

          <Text style={styles.resultsCount}>
            Showing {filteredReviews.length} of {reviews.length} reviews
          </Text>
        </View>

        <TouchableOpacity
          style={styles.writeReviewButton}
          onPress={() => handleWriteReview(null)}
        >
          <Text style={styles.writeReviewText}>Write a Review</Text>
        </TouchableOpacity>
      </View>

      {/* Reviews List */}
      {filteredReviews.map((review) => (
        <View key={review.id} style={styles.reviewCard}>
          <View style={styles.reviewHeader}>
            <View style={styles.userInfo}>
              <View style={styles.userAvatar}>
                <User size={20} color="#6b7280" />
              </View>
              <View>
                <Text style={styles.userName}>
                  {review.User?.name || review.userName || 'Anonymous User'}
                </Text>
                <View style={styles.ratingContainer}>
                  <View style={styles.starsContainer}>
                    {renderStars(review.rating)}
                  </View>
                  <Text style={styles.ratingValue}>{review.rating}/5</Text>
                </View>
              </View>
            </View>
            <View style={styles.reviewDate}>
              <Calendar size={14} color="#6b7280" />
              <Text style={styles.dateText}>
                {new Date(review.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>

          <Text style={styles.reviewComment}>{review.comment}</Text>

          {review.Property && (
            <View style={styles.propertyInfo}>
              <Text style={styles.propertyLabel}>Property: </Text>
              <Text style={styles.propertyTitle}>{review.Property.title}</Text>
            </View>
          )}

          <View style={styles.reviewActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleLike(review.id)}
            >
              <ThumbsUp size={16} color="#6b7280" />
              <Text style={styles.actionText}>{review.likes || 0}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDislike(review.id)}
            >
              <ThumbsDown size={16} color="#6b7280" />
              <Text style={styles.actionText}>{review.dislikes || 0}</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {filteredReviews.length === 0 && (
        <View style={styles.emptyContainer}>
          <MessageSquare size={48} color="#9ca3af" />
          <Text style={styles.emptyTitle}>No reviews found</Text>
          <Text style={styles.emptyMessage}>
            {searchQuery ? 'Try adjusting your search terms' :
             filter === 'all' ? 'Be the first to write a review!' :
             `No ${filter} reviews found. Try a different filter.`}
          </Text>
          <TouchableOpacity
            style={styles.writeReviewButton}
            onPress={() => handleWriteReview(null)}
          >
            <Text style={styles.writeReviewText}>Write a Review</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Review Modal Placeholder */}
      <Modal
        visible={showReviewModal}
        animationType="slide"
        onRequestClose={() => setShowReviewModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowReviewModal(false)}>
              <ArrowLeft size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Write a Review</Text>
            <View style={{ width: 24 }} />
          </View>
          <View style={styles.modalContent}>
            <Text style={styles.modalMessage}>
              Review modal functionality will be implemented with the ReviewModal component.
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowReviewModal(false)}
            >
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
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
    backgroundColor: '#1e293b',
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
    color: '#cbd5e1',
    textAlign: 'center',
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    width: '100%',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  statsSection: {
    backgroundColor: '#fff',
    padding: 20,
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statCard: {
    alignItems: 'center',
    marginBottom: 20,
  },
  statValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  ratingDistribution: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 20,
  },
  ratingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingNumber: {
    width: 20,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginHorizontal: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fbbf24',
    borderRadius: 4,
  },
  ratingCount: {
    width: 30,
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'right',
  },
  filtersSection: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterTabs: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 2,
    backgroundColor: '#f9fafb',
  },
  filterTabSelected: {
    backgroundColor: '#007bff',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    textAlign: 'center',
  },
  filterTabTextSelected: {
    color: '#fff',
  },
  filterControls: {
    marginBottom: 20,
  },
  filterLabel: {
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
  resultsCount: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  writeReviewButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  writeReviewText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  reviewsList: {
    padding: 16,
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
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingValue: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
  },
  reviewDate: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  reviewComment: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    marginBottom: 12,
  },
  propertyInfo: {
    backgroundColor: '#f9fafb',
    padding: 8,
    borderRadius: 6,
    marginBottom: 12,
  },
  propertyLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  propertyTitle: {
    fontSize: 14,
    color: '#007bff',
    fontWeight: '600',
  },
  reviewActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  actionText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 4,
    fontWeight: '600',
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
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  modalContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  modalMessage: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
