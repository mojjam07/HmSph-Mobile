import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
  FlatList
} from 'react-native';
import { Star, X, Send, Search } from 'lucide-react-native';
import ApiService from '../api/ApiService';

export default function ReviewModal({ isVisible, onClose, propertyId, propertyTitle, onReviewSubmitted }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [properties, setProperties] = useState([]);
  const [agents, setAgents] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(propertyId ? { id: propertyId, title: propertyTitle } : null);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPropertyDropdown, setShowPropertyDropdown] = useState(false);
  const [showAgentDropdown, setShowAgentDropdown] = useState(false);
  const [reviewType, setReviewType] = useState('property'); // 'property' or 'agent'

  useEffect(() => {
    if (isVisible) {
      if (!propertyId && reviewType === 'property') {
        fetchProperties();
      } else if (reviewType === 'agent') {
        fetchAgents();
      }
    }
  }, [isVisible, propertyId, reviewType]);

  const fetchProperties = async () => {
    try {
      const data = await ApiService.getProperties();
      setProperties(data || []);
    } catch (err) {
      console.error('Error fetching properties:', err);
    }
  };

  const fetchAgents = async () => {
    try {
      const data = await ApiService.getAgents();
      setAgents(data || []);
    } catch (err) {
      console.error('Error fetching agents:', err);
    }
  };

  const handleRatingPress = (selectedRating) => {
    setRating(selectedRating);
    setError('');
  };

  const validateForm = () => {
    if (rating === 0) {
      setError('Please select a rating');
      return false;
    }
    if (comment.trim().length < 10) {
      setError('Please write at least 10 characters');
      return false;
    }
    if (!selectedProperty && !selectedAgent) {
      setError('Please select a property or agent to review');
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
      const reviewPayload = {
        rating,
        comment: comment.trim()
      };
      if (selectedProperty) {
        reviewPayload.propertyId = selectedProperty.id;
      }
      if (selectedAgent) {
        reviewPayload.agentId = selectedAgent.id;
      }

      await ApiService.createReview(reviewPayload);

      // Reset form
      setRating(0);
      setComment('');
      setSelectedProperty(null);
      setSelectedAgent(null);
      setSearchQuery('');
      onReviewSubmitted();
      onClose();

      Alert.alert('Success', 'Your review has been submitted and is pending approval. Thank you!');
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
      setSelectedProperty(null);
      setSelectedAgent(null);
      setSearchQuery('');
      onClose();
    }
  };

  const handleModalClick = (e) => {
    if (showPropertyDropdown && !e.target.closest('.property-dropdown')) {
      setShowPropertyDropdown(false);
    }
    if (showAgentDropdown && !e.target.closest('.agent-dropdown')) {
      setShowAgentDropdown(false);
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
      <View style={styles.overlay} onTouchStart={handleModalClick}>
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
            {/* Property/Agent Selection */}
            {selectedProperty ? (
              <>
                <View style={styles.propertyInfo}>
                  <Text style={styles.propertyLabel}>Reviewing Property:</Text>
                  <Text style={styles.propertyTitle}>{selectedProperty.title}</Text>
                  <TouchableOpacity
                    onPress={() => setSelectedProperty(null)}
                    style={styles.changeButton}
                  >
                    <Text style={styles.changeButtonText}>Change property</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : selectedAgent ? (
              <>
                <View style={styles.propertyInfo}>
                  <Text style={styles.propertyLabel}>Reviewing Agent:</Text>
                  <Text style={styles.propertyTitle}>{selectedAgent.name || selectedAgent.businessName}</Text>
                  <TouchableOpacity
                    onPress={() => setSelectedAgent(null)}
                    style={styles.changeButton}
                  >
                    <Text style={styles.changeButtonText}>Change agent</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <View style={styles.propertyInfo}>
                  <Text style={styles.propertyLabel}>Select Property to Review</Text>
                  <Text style={styles.propertyTitle}>Choose the property you want to review</Text>

                  <View style={styles.reviewTypeContainer}>
                    <TouchableOpacity
                      style={[styles.reviewTypeButton, reviewType === 'property' && styles.reviewTypeButtonActive]}
                      onPress={() => setReviewType('property')}
                    >
                      <Text style={[styles.reviewTypeText, reviewType === 'property' && styles.reviewTypeTextActive]}>Property</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.reviewTypeButton, reviewType === 'agent' && styles.reviewTypeButtonActive]}
                      onPress={() => setReviewType('agent')}
                    >
                      <Text style={[styles.reviewTypeText, reviewType === 'agent' && styles.reviewTypeTextActive]}>Agent</Text>
                    </TouchableOpacity>
                  </View>

                  {reviewType === 'property' ? (
                    <View style={styles.searchContainer}>
                      <View style={styles.searchInputContainer}>
                        <Search size={20} color="#6b7280" style={styles.searchIcon} />
                        <TextInput
                          style={styles.searchInput}
                          placeholder="Search properties..."
                          value={searchQuery}
                          onChangeText={(text) => {
                            setSearchQuery(text);
                            setShowPropertyDropdown(true);
                          }}
                          onFocus={() => setShowPropertyDropdown(true)}
                        />
                      </View>

                      {showPropertyDropdown && (
                        <View style={styles.dropdown}>
                          {properties
                            .filter(property =>
                              property.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              property.address?.toLowerCase().includes(searchQuery.toLowerCase())
                            )
                            .map((property) => (
                              <TouchableOpacity
                                key={property.id}
                                style={styles.dropdownItem}
                                onPress={() => {
                                  setSelectedProperty(property);
                                  setShowPropertyDropdown(false);
                                  setSearchQuery('');
                                }}
                              >
                                <Text style={styles.dropdownItemTitle}>{property.title}</Text>
                                <Text style={styles.dropdownItemAddress}>{property.address}</Text>
                              </TouchableOpacity>
                            ))}
                          {properties.filter(property =>
                            property.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            property.address?.toLowerCase().includes(searchQuery.toLowerCase())
                          ).length === 0 && (
                            <Text style={styles.noResultsText}>No properties found</Text>
                          )}
                        </View>
                      )}
                    </View>
                  ) : (
                    <View style={styles.searchContainer}>
                      <View style={styles.searchInputContainer}>
                        <Search size={20} color="#6b7280" style={styles.searchIcon} />
                        <TextInput
                          style={styles.searchInput}
                          placeholder="Search agents..."
                          value={searchQuery}
                          onChangeText={(text) => {
                            setSearchQuery(text);
                            setShowAgentDropdown(true);
                          }}
                          onFocus={() => setShowAgentDropdown(true)}
                        />
                      </View>

                      {showAgentDropdown && (
                        <View style={styles.dropdown}>
                          {agents
                            .filter(agent =>
                              agent.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              agent.businessName?.toLowerCase().includes(searchQuery.toLowerCase())
                            )
                            .map((agent) => (
                              <TouchableOpacity
                                key={agent.id}
                                style={styles.dropdownItem}
                                onPress={() => {
                                  setSelectedAgent(agent);
                                  setShowAgentDropdown(false);
                                  setSearchQuery('');
                                }}
                              >
                                <Text style={styles.dropdownItemTitle}>{agent.name || agent.businessName}</Text>
                                <Text style={styles.dropdownItemAddress}>{agent.phone}</Text>
                              </TouchableOpacity>
                            ))}
                          {agents.filter(agent =>
                            agent.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            agent.businessName?.toLowerCase().includes(searchQuery.toLowerCase())
                          ).length === 0 && (
                            <Text style={styles.noResultsText}>No agents found</Text>
                          )}
                        </View>
                      )}
                    </View>
                  )}
                </View>
              </>
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

            {/* Note */}
            <View style={styles.noteContainer}>
              <Text style={styles.noteText}>
                <Text style={styles.noteBold}>Note:</Text> Your review will be submitted for approval before it appears publicly.
                This helps maintain quality and authenticity across our platform.
              </Text>
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
  changeButton: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#e5e7eb',
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  changeButtonText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  reviewTypeContainer: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  reviewTypeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    alignItems: 'center',
  },
  reviewTypeButtonActive: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  reviewTypeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  reviewTypeTextActive: {
    color: '#fff',
  },
  searchContainer: {
    marginTop: 12,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  dropdown: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    marginTop: 4,
    backgroundColor: '#fff',
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  dropdownItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  dropdownItemAddress: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  noResultsText: {
    textAlign: 'center',
    padding: 16,
    color: '#6b7280',
    fontSize: 14,
  },
  noteContainer: {
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  noteText: {
    fontSize: 14,
    color: '#0369a1',
    lineHeight: 20,
  },
  noteBold: {
    fontWeight: '600',
  },
});
