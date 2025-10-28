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
  Users,
  Building,
  Star,
  MessageSquare,
  DollarSign,
  TrendingUp,
  ArrowLeft,
  Shield,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BarChart3,
  FileText,
  Settings
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

const AdminDashboardScreen = () => {
  const navigation = useNavigation();
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalAgents: 0,
      totalProperties: 0,
      totalReviews: 0,
      totalRevenue: 0,
      pendingApprovals: 0,
      activeUsers: 0
    },
    recentAgents: [],
    recentProperties: [],
    recentReviews: []
  });

  useEffect(() => {
    if (!isAdmin()) {
      Alert.alert('Access Denied', 'You need admin privileges to access this screen.');
      navigation.goBack();
      return;
    }
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load admin dashboard stats
      const statsResponse = await ApiService.getAdminDashboardStats();
      const stats = statsResponse?.stats || {};

      // Load recent agents
      const agentsResponse = await ApiService.getAdminAgents();
      const agents = agentsResponse?.agents || [];

      // Load recent properties
      const propertiesResponse = await ApiService.getProperties({ limit: 5 });
      const properties = propertiesResponse || [];

      // Load recent reviews
      const reviewsResponse = await ApiService.getReviews({ limit: 5 });
      const reviews = reviewsResponse || [];

      setDashboardData({
        stats: {
          totalAgents: stats.totalAgents || 0,
          totalProperties: stats.totalProperties || 0,
          totalReviews: stats.totalReviews || 0,
          totalRevenue: stats.totalRevenue || 0,
          pendingApprovals: stats.pendingApprovals || 0,
          activeUsers: stats.activeUsers || 0
        },
        recentAgents: agents.slice(0, 3),
        recentProperties: properties.slice(0, 3),
        recentReviews: reviews.slice(0, 3)
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const renderStatCard = (title, value, icon, color, trend) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statIcon}>
        {icon}
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
        {trend && (
          <View style={styles.trendContainer}>
            <TrendingUp size={12} color={trend > 0 ? '#10b981' : '#ef4444'} />
            <Text style={[styles.trendText, { color: trend > 0 ? '#10b981' : '#ef4444' }]}>
              {trend > 0 ? '+' : ''}{trend}%
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading admin dashboard...</Text>
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
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeTitle}>
          Welcome back, {user?.firstName}!
        </Text>
        <Text style={styles.welcomeSubtitle}>
          Manage your real estate platform
        </Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View key="total-agents">
          {renderStatCard(
            'Total Agents',
            dashboardData.stats.totalAgents,
            <Users size={24} color="#3b82f6" />,
            '#3b82f6',
            12
          )}
        </View>
        <View key="total-properties">
          {renderStatCard(
            'Total Properties',
            dashboardData.stats.totalProperties,
            <Building size={24} color="#10b981" />,
            '#10b981',
            8
          )}
        </View>
        <View key="total-reviews">
          {renderStatCard(
            'Total Reviews',
            dashboardData.stats.totalReviews,
            <Star size={24} color="#f59e0b" />,
            '#f59e0b',
            15
          )}
        </View>
        <View key="revenue">
          {renderStatCard(
            'Revenue',
            `₦${(dashboardData.stats.totalRevenue / 1000000).toFixed(1)}M`,
            <DollarSign size={24} color="#8b5cf6" />,
            '#8b5cf6',
            25
          )}
        </View>
        <View key="pending-approvals">
          {renderStatCard(
            'Pending Approvals',
            dashboardData.stats.pendingApprovals,
            <AlertTriangle size={24} color="#ef4444" />,
            '#ef4444',
            -5
          )}
        </View>
        <View key="active-users">
          {renderStatCard(
            'Active Users',
            dashboardData.stats.activeUsers,
            <Shield size={24} color="#06b6d4" />,
            '#06b6d4',
            20
          )}
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsSection}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Agents')}
          >
            <Users size={24} color="#3b82f6" />
            <Text style={styles.actionText}>Manage Agents</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Properties')}
          >
            <Building size={24} color="#10b981" />
            <Text style={styles.actionText}>Review Properties</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Reviews')}
          >
            <Star size={24} color="#f59e0b" />
            <Text style={styles.actionText}>Moderate Reviews</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => Alert.alert('Coming Soon', 'Analytics dashboard coming soon')}
          >
            <BarChart3 size={24} color="#8b5cf6" />
            <Text style={styles.actionText}>View Analytics</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => Alert.alert('Coming Soon', 'Reports dashboard coming soon')}
          >
            <FileText size={24} color="#06b6d4" />
            <Text style={styles.actionText}>Generate Reports</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => Alert.alert('Coming Soon', 'Settings panel coming soon')}
          >
            <Settings size={24} color="#ef4444" />
            <Text style={styles.actionText}>System Settings</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Agents */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Agents</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Agents')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {dashboardData.recentAgents.length > 0 ? (
          dashboardData.recentAgents.map((agent) => (
            <View key={agent.id} style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemTitle}>
                    {agent.user?.firstName} {agent.user?.lastName}
                  </Text>
                  <Text style={styles.itemSubtitle}>
                    {agent.businessName || 'No business name'}
                  </Text>
                </View>
                <View style={[styles.statusBadge,
                  agent.verificationStatus === 'APPROVED' ? styles.approvedBadge :
                  agent.verificationStatus === 'PENDING' ? styles.pendingBadge :
                  styles.rejectedBadge
                ]}>
                  <Text style={styles.statusText}>{agent.verificationStatus}</Text>
                </View>
              </View>

              <View style={styles.itemDetails}>
                <Text style={styles.itemDetail}>
                  {agent.registrationNumber || 'No registration'}
                </Text>
                <Text style={styles.itemDetail}>
                  {agent.user?.email}
                </Text>
              </View>

              <View style={styles.itemActions}>
                <TouchableOpacity style={styles.actionButton}>
                  <Eye size={16} color="#6b7280" />
                </TouchableOpacity>
                {agent.verificationStatus === 'PENDING' && (
                  <>
                    <TouchableOpacity style={styles.actionButton}>
                      <CheckCircle size={16} color="#10b981" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                      <XCircle size={16} color="#ef4444" />
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Users size={48} color="#9ca3af" />
            <Text style={styles.emptyTitle}>No agents yet</Text>
            <Text style={styles.emptyMessage}>
              Agent registrations will appear here
            </Text>
          </View>
        )}
      </View>

      {/* Recent Properties */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Properties</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Properties')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {dashboardData.recentProperties.length > 0 ? (
          dashboardData.recentProperties.map((property) => (
            <View key={property.id} style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemTitle} numberOfLines={1}>
                    {property.title}
                  </Text>
                  <Text style={styles.itemSubtitle}>
                    {property.city}, {property.state}
                  </Text>
                </View>
                <View style={[styles.statusBadge,
                  property.status === 'ACTIVE' ? styles.activeBadge :
                  property.status === 'PENDING' ? styles.pendingBadge :
                  styles.soldBadge
                ]}>
                  <Text style={styles.statusText}>{property.status}</Text>
                </View>
              </View>

              <View style={styles.itemDetails}>
                <Text style={styles.itemDetail}>
                  ₦{property.price?.toLocaleString() || 'N/A'}
                </Text>
                <Text style={styles.itemDetail}>
                  {property.bedrooms} bed • {property.bathrooms} bath
                </Text>
              </View>

              <View style={styles.itemActions}>
                <TouchableOpacity style={styles.actionButton}>
                  <Eye size={16} color="#6b7280" />
                </TouchableOpacity>
                {property.status === 'PENDING' && (
                  <>
                    <TouchableOpacity style={styles.actionButton}>
                      <CheckCircle size={16} color="#10b981" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                      <XCircle size={16} color="#ef4444" />
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Building size={48} color="#9ca3af" />
            <Text style={styles.emptyTitle}>No properties yet</Text>
            <Text style={styles.emptyMessage}>
              Property listings will appear here
            </Text>
          </View>
        )}
      </View>

      {/* Recent Reviews */}
      <View style={[styles.section, { paddingBottom: 40 }]}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Reviews</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Reviews')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {dashboardData.recentReviews.length > 0 ? (
          dashboardData.recentReviews.map((review) => (
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
                <View style={[styles.statusBadge,
                  review.status === 'APPROVED' ? styles.approvedBadge :
                  review.status === 'PENDING' ? styles.pendingBadge :
                  styles.rejectedBadge
                ]}>
                  <Text style={styles.statusText}>{review.status}</Text>
                </View>
              </View>
              <Text style={styles.reviewComment} numberOfLines={2}>
                {review.comment}
              </Text>
              <View style={styles.reviewActions}>
                {review.status === 'PENDING' && (
                  <>
                    <TouchableOpacity style={styles.reviewActionButton}>
                      <CheckCircle size={16} color="#10b981" />
                      <Text style={styles.approveText}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.reviewActionButton}>
                      <XCircle size={16} color="#ef4444" />
                      <Text style={styles.rejectText}>Reject</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Star size={48} color="#9ca3af" />
            <Text style={styles.emptyTitle}>No reviews yet</Text>
            <Text style={styles.emptyMessage}>
              User reviews will appear here for moderation
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
    minWidth: (width - 40 - 32) / 2,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 2,
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
    minWidth: (width - 40 - 36) / 3,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
  },
  section: {
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
  itemCard: {
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
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  approvedBadge: {
    backgroundColor: '#dcfce7',
  },
  pendingBadge: {
    backgroundColor: '#fef3c7',
  },
  rejectedBadge: {
    backgroundColor: '#fee2e2',
  },
  activeBadge: {
    backgroundColor: '#dcfce7',
  },
  soldBadge: {
    backgroundColor: '#fee2e2',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f2937',
  },
  itemDetails: {
    marginBottom: 12,
  },
  itemDetail: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
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
  reviewComment: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    marginBottom: 12,
  },
  reviewActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  reviewActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 4,
  },
  approveText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10b981',
  },
  rejectText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ef4444',
  },
});

export default AdminDashboardScreen;
