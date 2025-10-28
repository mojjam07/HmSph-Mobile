import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { Star, X, Send } from 'lucide-react-native';
import ApiService from '../api/ApiService';

export default function ReviewModal({ isVisible, onClose, propertyId, propertyTitle, onReviewSubmitted }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleRatingPress = (selectedRating) => {
    setRating(selectedRating);
    setError('');
  };

  const validateForm = () => {
    if (rating === 0) {
      setError('Please select a rating');
      return false;
    }
    if (!comment.trim()) {
      setError('Please write a review comment');
      return false;
    }
    if (comment.trim().length < 10) {
      setError('Review comment must be at least 10 characters long');
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
      const reviewData = {
        rating,
        comment: comment.trim(),
        propertyId: propertyId || null
      };

      await ApiService.submitReview(reviewData);

      // Reset form
      setRating(0);
      setComment('');
      setError('');

      // Close modal and notify parent
      onClose();
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }

      Alert.alert('Success', 'Your review has been submitted successfully!');
    } catch (err) {
      console.error('Error submitting review:', err);
      setError(err.message || 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setRating(0);
      setComment('');
      setError('');
      onClose();
    }
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => (
      <TouchableOpacity
        key={index}
        onPress={() => handleRatingPress(index + 1)}
        style={styles.starButton}
        disabled={isSubmitting}
      >
        <Star
          size={32}
          color={index < rating ? '#fbbf24' : '#d1d5db'}
          fill={index < rating ? '#fbbf24' : 'transparent'}
        />
      </TouchableOpacity>
    ));
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      onRequestClose={handleClose}
      transparent={true}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Write a Review</Text>
            <TouchableOpacity
              onPress={handleClose}
              style={styles.closeButton}
              disabled={isSubmitting}
            >
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Property Info */}
            {propertyTitle && (
              <View style={styles.propertyInfo}>
                <Text style={styles.propertyLabel}>Reviewing:</Text>
                <Text style={styles.propertyTitle}>{propertyTitle}</Text>
              </View>
            )}

            {/* Rating Section */}
            <View style={styles.ratingSection}>
              <Text style={styles.sectionTitle}>Rate your experience</Text>
              <View style={styles.starsContainer}>
                {renderStars()}
              </View>
              {rating > 0 && (
                <Text style={styles.ratingText}>
                  {rating} star{rating !== 1 ? 's' : ''} - {
                    rating === 5 ? 'Excellent' :
                    rating === 4 ? 'Very Good' :
                    rating === 3 ? 'Good' :
                    rating === 2 ? 'Fair' :
                    'Poor'
                  }
                </Text>
              )}
            </View>

            {/* Comment Section */}
            <View style={styles.commentSection}>
              <Text style={styles.sectionTitle}>Share your thoughts</Text>
              <TextInput
                style={styles.commentInput}
                placeholder="Tell others about your experience..."
                value={comment}
                onChangeText={(text) => {
                  setComment(text);
                  if (error) setError('');
                }}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                editable={!isSubmitting}
                maxLength={1000}
              />
              <Text style={styles.charCount}>
                {comment.length}/1000 characters
              </Text>
            </View>

            {/* Error Message */}
            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Guidelines */}
            <View style={styles.guidelines}>
              <Text style={styles.guidelinesTitle}>Review Guidelines:</Text>
              <Text style={styles.guidelineText}>• Be honest and constructive</Text>
              <Text style={styles.guidelineText}>• Focus on your experience</Text>
              <Text style={styles.guidelineText}>• Keep it respectful and relevant</Text>
              <Text style={styles.guidelineText}>• Minimum 10 characters required</Text>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleClose}
              disabled={isSubmitting}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Send size={18} color="#fff" />
                  <Text style={styles.submitButtonText}>Submit Review</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    minHeight: '70%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  propertyInfo: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  propertyLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  propertyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  ratingSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
  },
  starButton: {
    padding: 4,
  },
  ratingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#4b5563',
    fontWeight: '500',
  },
  commentSection: {
    marginBottom: 24,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1f2937',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  charCount: {
    textAlign: 'right',
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
  },
  guidelines: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  guidelinesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  guidelineText: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 4,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  submitButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007bff',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
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
});
