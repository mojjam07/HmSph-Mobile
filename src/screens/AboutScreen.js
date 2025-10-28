import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Building, Users, Award, Target, Heart, Shield, Zap, Globe, CheckCircle, ArrowLeft, Star } from 'lucide-react-native';

export default function AboutScreen() {
  const navigation = useNavigation();

  const stats = [
    { icon: Building, value: "5,000+", label: "Properties Listed" },
    { icon: Users, value: "10,000+", label: "Happy Clients" },
    { icon: Award, value: "50+", label: "Expert Agents" },
    { icon: Globe, value: "25+", label: "Cities Covered" }
  ];

  const values = [
    {
      icon: Shield,
      title: "Trust & Transparency",
      description: "We believe in complete transparency in all our dealings, ensuring our clients have all the information they need to make informed decisions."
    },
    {
      icon: Heart,
      title: "Client-Centric Approach",
      description: "Every client is unique, and we tailor our services to meet individual needs, preferences, and budgets."
    },
    {
      icon: Zap,
      title: "Innovation & Technology",
      description: "We leverage cutting-edge technology to provide seamless experiences and stay ahead in the digital real estate landscape."
    },
    {
      icon: Target,
      title: "Excellence in Service",
      description: "We strive for excellence in every interaction, ensuring the highest standards of professional service delivery."
    }
  ];

  const team = [
    {
      name: "David Okafor",
      role: "CEO & Founder",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
      bio: "With over 15 years in real estate, David founded HomeSphere to revolutionize property transactions in Nigeria."
    },
    {
      name: "Amina Hassan",
      role: "Head of Operations",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400",
      bio: "Amina oversees our day-to-day operations and ensures seamless service delivery across all departments."
    },
    {
      name: "Chidi Okwu",
      role: "Technology Director",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
      bio: "Chidi leads our tech innovation, developing platforms that make property search and transactions effortless."
    },
    {
      name: "Kemi Adebola",
      role: "Head of Sales",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
      bio: "Kemi manages our sales team and works closely with clients to understand and fulfill their property needs."
    }
  ];

  const achievements = [
    "Best Real Estate Platform 2023 - Nigerian Property Awards",
    "Technology Innovation Award 2023 - PropTech Nigeria",
    "Customer Service Excellence Award 2022",
    "Fastest Growing Real Estate Company 2022",
    "Digital Transformation Award 2021"
  ];

  const handleContactPress = () => {
    navigation.navigate('Contact');
  };

  const handleBrowseProperties = () => {
    navigation.navigate('Home');
  };

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
        <Text style={styles.headerTitle}>About HomeSphere</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Hero Section */}
      <View style={styles.heroSection}>
        <Text style={styles.heroTitle}>About HomeSphere</Text>
        <Text style={styles.heroSubtitle}>
          Transforming the Nigerian real estate landscape with innovative solutions,
          exceptional service, and unwavering commitment to our clients' success.
        </Text>
      </View>

      {/* Stats Section */}
      <View style={styles.statsSection}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <View style={styles.statIcon}>
              <stat.icon size={24} color="#007bff" />
            </View>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Story Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Our Story</Text>
        <Text style={styles.sectionText}>
          Founded in 2018, HomeSphere began with a simple vision: to make property
          transactions in Nigeria more transparent, efficient, and accessible to everyone.
          What started as a small team of passionate real estate professionals has grown
          into one of Nigeria's leading property platforms.
        </Text>
        <Text style={styles.sectionText}>
          We recognized the challenges faced by both property seekers and sellers in
          the traditional real estate market - from lack of transparency to limited
          access to quality listings. Our mission became clear: leverage technology
          to bridge these gaps and create a seamless experience for all stakeholders.
        </Text>
        <Text style={styles.sectionText}>
          Today, we're proud to have facilitated thousands of successful property
          transactions, helped families find their dream homes, and supported investors
          in building their portfolios. Our journey continues as we expand our reach
          and enhance our services.
        </Text>
      </View>

      {/* Mission & Vision */}
      <View style={styles.missionVisionSection}>
        <View style={styles.missionCard}>
          <View style={styles.missionIcon}>
            <Target size={24} color="#007bff" />
          </View>
          <Text style={styles.cardTitle}>Our Mission</Text>
          <Text style={styles.cardText}>
            To democratize access to quality real estate opportunities across Nigeria
            by providing a transparent, efficient, and technology-driven platform that
            connects buyers, sellers, and renters with their perfect properties.
          </Text>
        </View>

        <View style={styles.visionCard}>
          <View style={styles.visionIcon}>
            <Globe size={24} color="#9333ea" />
          </View>
          <Text style={styles.cardTitle}>Our Vision</Text>
          <Text style={styles.cardText}>
            To become Africa's leading real estate platform, setting the standard
            for innovation, transparency, and customer satisfaction while contributing
            to sustainable urban development across the continent.
          </Text>
        </View>
      </View>

      {/* Values Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Our Core Values</Text>
        <Text style={styles.sectionSubtitle}>
          The principles that guide everything we do
        </Text>

        {values.map((value, index) => (
          <View key={index} style={styles.valueCard}>
            <View style={styles.valueIcon}>
              <value.icon size={20} color="#007bff" />
            </View>
            <View style={styles.valueContent}>
              <Text style={styles.valueTitle}>{value.title}</Text>
              <Text style={styles.valueDescription}>{value.description}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Team Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Meet Our Leadership</Text>
        <Text style={styles.sectionSubtitle}>
          The visionary leaders driving HomeSphere's success
        </Text>

        {team.map((member, index) => (
          <View key={index} style={styles.teamCard}>
            <View style={styles.teamHeader}>
              <Text style={styles.teamName}>{member.name}</Text>
              <Text style={styles.teamRole}>{member.role}</Text>
            </View>
            <Text style={styles.teamBio}>{member.bio}</Text>
          </View>
        ))}
      </View>

      {/* Achievements Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Our Achievements</Text>
        <Text style={styles.sectionSubtitle}>
          Recognition for our commitment to excellence and innovation
        </Text>

        <View style={styles.achievementsContainer}>
          {achievements.map((achievement, index) => (
            <View key={index} style={styles.achievementItem}>
              <CheckCircle size={16} color="#10b981" />
              <Text style={styles.achievementText}>{achievement}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* CTA Section */}
      <View style={styles.ctaSection}>
        <Text style={styles.ctaTitle}>Ready to Find Your Dream Property?</Text>
        <Text style={styles.ctaSubtitle}>
          Join thousands of satisfied clients who have found their perfect homes with HomeSphere
        </Text>

        <View style={styles.ctaButtons}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleBrowseProperties}>
            <Text style={styles.primaryButtonText}>Browse Properties</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={handleContactPress}>
            <Text style={styles.secondaryButtonText}>Contact Our Team</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#e6f3ff',
    textAlign: 'center',
    lineHeight: 24,
  },
  statsSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    backgroundColor: '#f9fafb',
  },
  statCard: {
    width: '50%',
    alignItems: 'center',
    padding: 16,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e6f3ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 20,
  },
  sectionText: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 24,
    marginBottom: 16,
  },
  missionVisionSection: {
    padding: 20,
  },
  missionCard: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  visionCard: {
    backgroundColor: '#faf5ff',
    borderRadius: 12,
    padding: 20,
  },
  missionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e6f3ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  visionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3e8ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  valueCard: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  valueIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e6f3ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  valueContent: {
    flex: 1,
  },
  valueTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  valueDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  teamCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  teamHeader: {
    marginBottom: 8,
  },
  teamName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  teamRole: {
    fontSize: 14,
    color: '#007bff',
    fontWeight: '500',
  },
  teamBio: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  achievementsContainer: {
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 16,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  achievementText: {
    fontSize: 14,
    color: '#1f2937',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  ctaSection: {
    backgroundColor: '#007bff',
    padding: 24,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  ctaSubtitle: {
    fontSize: 16,
    color: '#e6f3ff',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  ctaButtons: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#007bff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    borderWidth: 2,
    borderColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
