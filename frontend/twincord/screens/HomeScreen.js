import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  StatusBar,
  Animated,
  PanResponder,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { statsAPI } from '../services/api';

const { width, height } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const { logout, user } = useAuth();
  const [stats, setStats] = useState({ activeChats: 0, meetingsToday: 0, onlineUsers: 0 });
  const [loadingStats, setLoadingStats] = useState(false);
  const [activeSection, setActiveSection] = useState('public');
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const features = [
    {
      id: 'public',
      title: 'Public Rooms',
      description: 'Join public conversations and meet new people from around the world',
      icon: 'globe-outline',
      color: ['#FF6B6B', '#FF8E53'],
      bgColor: '#FFE5E5',
      // stats now computed live from backend data
      activities: [
        { name: 'Tech Talk', members: '234 online' },
        { name: 'Gaming Hub', members: '189 online' },
        { name: 'Music Lounge', members: '156 online' },
      ],
    },
    {
      id: 'private',
      title: 'Private Chats',
      description: 'Secure one-on-one conversations with end-to-end encryption',
      icon: 'lock-closed-outline',
      color: ['#4ECDC4', '#44A08D'],
      bgColor: '#E8F8F6',
      // stats now computed live from backend data
      activities: [
        { name: 'Alice Johnson', members: 'Online now' },
        { name: 'Team Discussion', members: '3 unread' },
        { name: 'Project Updates', members: '1 unread' },
      ],
    },
    {
      id: 'meet',
      title: 'Video Meetings',
      description: 'Start or join high-quality video conferences with screen sharing',
      icon: 'videocam-outline',
      color: ['#A8EDEA', '#6B73FF'],
      bgColor: '#F0F7FF',
      // stats now computed live from backend data
      activities: [
        { name: 'Team Standup', members: 'in 30 minutes' },
        { name: 'Client Call', members: 'at 2:00 PM' },
        { name: 'Project Review', members: 'at 4:30 PM' },
      ],
    },
  ];

  // --- MODIFIED SECTION ---
  // Cleaned up duplicate actions and updated "Start Meet" onPress
  const quickActions = [
    { icon: 'add-circle-outline', title: 'New Chat', gradient: ['#FF6B6B', '#FF8E53'], onPress: () => {} },
    { icon: 'people-outline', title: 'Join Room', gradient: ['#4ECDC4', '#44A08D'], onPress: () => navigation.navigate('Communities')  },
    { icon: 'videocam-outline', title: 'Start Meet', gradient: ['#6B73FF', '#9C27B0'], onPress: () => navigation.navigate('Meeting', { room: 'Twincord' }) },
    { icon: 'calendar-outline', title: 'Schedule', gradient: ['#FFEAA7', '#FDCB6E'], onPress: () => {} },
  ];
  // --- END OF MODIFIED SECTION ---

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.error('Logout error:', error);
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    const welcomeAnimation = () => {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05, // Subtle bounce
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start();
    };

    welcomeAnimation();
  }, []);

  useEffect(() => {
    let isMounted = true;
    let intervalId;

    const loadStats = async () => {
      try {
        setLoadingStats(true);
        const resp = await statsAPI.getStats();
        if (!resp?.success) return;
        const data = resp.data || {};
        if (isMounted) {
          setStats({
            activeChats: data.totalCommunities || 0,
            meetingsToday: data.meetingsToday || 0,
            onlineUsers: data.onlineUsers || 0,
          });
        }
      } catch (e) {
        // silently fail
      } finally {
        if (isMounted) setLoadingStats(false);
      }
    };

    loadStats();
    intervalId = setInterval(loadStats, 15000);

    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  const animateFeatureSelection = (sectionId) => {
    const sectionIndex = features.findIndex(f => f.id === sectionId);
    
    Animated.timing(slideAnim, {
      toValue: sectionIndex * -width * 0.8,
      duration: 300,
      useNativeDriver: true,
    }).start();
    
    setActiveSection(sectionId);
  };

  const renderFeatureCard = (feature, index) => (
    <TouchableOpacity
      key={feature.id}
      style={[
        styles.featureCard,
        { backgroundColor: feature.bgColor },
        activeSection === feature.id && styles.activeFeatureCard,
      ]}
      onPress={() => animateFeatureSelection(feature.id)}
    >
      <View style={styles.featureCardHeader}>
        <LinearGradient
          colors={feature.color}
          style={styles.featureIconContainer}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name={feature.icon} size={28} color="#fff" />
        </LinearGradient>
        
        <View style={styles.featureContent}>
          <Text style={styles.featureTitle}>{feature.title}</Text>
          <Text style={styles.featureStats}>
            {feature.id === 'public' && `${stats.onlineUsers} Online`}
            {feature.id === 'private' && `${stats.activeChats} Active Chats`}
            {feature.id === 'meet' && `${stats.meetingsToday} Scheduled Today`}
          </Text>
        </View>
      </View>
      
      <Text style={styles.featureDescription}>{feature.description}</Text>
      
      {activeSection === feature.id && (
        <View style={styles.featureActivities}>
          {feature.activities.map((activity, i) => (
            <View key={i} style={styles.activityItem}>
              <View style={styles.activityDot} />
              <View style={styles.activityContent}>
                <Text style={styles.activityName}>{activity.name}</Text>
                <Text style={styles.activityMembers}>{activity.members}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );

  const renderQuickAction = (action, index) => (
    <TouchableOpacity key={index} style={styles.quickActionItem} onPress={action.onPress}>
      <LinearGradient
        colors={action.gradient}
        style={styles.quickActionIcon}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Ionicons name={action.icon} size={24} color="#fff" />
      </LinearGradient>
      <Text style={styles.quickActionTitle}>{action.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6B73FF" />
      
      {/* Animated Header */}
      <LinearGradient
        colors={['#6B73FF', '#9C27B0', '#667eea']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animated.View style={[styles.headerContent, { transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.headerLeft}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.1)']}
              style={styles.profilePicture}
            >
              <Text style={styles.profileInitial}>{user?.name?.charAt(0) || 'U'}</Text>
            </LinearGradient>
            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeText}>Welcome back,</Text>
              <Text style={styles.userName}>{user?.name || 'User'}</Text>
            </View>
          </View>
          
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.notificationButton}>
              <Ionicons name="notifications-outline" size={24} color="#fff" />
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationCount}>3</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Header Stats */}
        <View style={styles.headerStats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{loadingStats ? '-' : stats.activeChats}</Text>
            <Text style={styles.statLabel}>Active Chats</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{loadingStats ? '-' : stats.meetingsToday}</Text>
            <Text style={styles.statLabel}>Meetings Today</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{loadingStats ? '-' : stats.onlineUsers}</Text>
            <Text style={styles.statLabel}>Online Users</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map(renderQuickAction)}
          </View>
        </View>

        {/* Feature Cards */}
        <View style={styles.featuresContainer}>
          <Text style={styles.sectionTitle}>Explore Features</Text>
          {features.map(renderFeatureCard)}
        </View>

        {/* Active Section Detailed View */}
        <View style={styles.detailedViewContainer}>
          <LinearGradient
            colors={features.find(f => f.id === activeSection)?.color || ['#6B73FF', '#9C27B0']}
            style={styles.detailedViewHeader}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.detailedViewTitleContainer}>
              <Ionicons 
                name={features.find(f => f.id === activeSection)?.icon || 'apps'} 
                size={24} 
                color="#fff" 
              />
              <Text style={styles.detailedViewTitle}>
                {features.find(f => f.id === activeSection)?.title}
              </Text>
            </View>
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>View All</Text>
              <Ionicons name="arrow-forward" size={16} color="#fff" />
            </TouchableOpacity>
          </LinearGradient>
          
          <View style={styles.detailedViewContent}>
            <Text style={styles.detailedViewDescription}>
              {features.find(f => f.id === activeSection)?.description}
            </Text>
            
            <TouchableOpacity style={styles.getStartedButton}>
              <LinearGradient
                colors={features.find(f => f.id === activeSection)?.color || ['#6B73FF', '#9C27B0']}
                style={styles.getStartedGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.getStartedText}>Get Started</Text>
                <Ionicons name="rocket-outline" size={20} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.recentActivityContainer}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityList}>
            {[
              { icon: 'chatbubble-outline', text: 'New message from Alice', time: '2 min ago', color: '#4ECDC4' },
              { icon: 'people-outline', text: 'You joined Tech Talk room', time: '15 min ago', color: '#FF6B6B' },
              { icon: 'videocam-outline', text: 'Meeting with team ended', time: '1 hour ago', color: '#6B73FF' },
            ].map((activity, index) => (
              <View key={index} style={styles.activityListItem}>
                <View style={[styles.activityIcon, { backgroundColor: activity.color }]}>
                  <Ionicons name={activity.icon} size={16} color="#fff" />
                </View>
                <View style={styles.activityText}>
                  <Text style={styles.activityDescription}>{activity.text}</Text>
                  <Text style={styles.activityTime}>{activity.time}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab}>
        <LinearGradient
          colors={['#FF6B6B', '#FF8E53']}
          style={styles.fabGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

// Styles remain unchanged
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)',
  },
  header: {
    paddingTop: StatusBar.currentHeight || 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    backgroundColor: 'rgba(107,115,255,0.95)',
    shadowColor: '#6B73FF',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profilePicture: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#6B73FF',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
  },
  profileInitial: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  welcomeContainer: {
    justifyContent: 'center',
  },
  welcomeText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationButton: {
    position: 'relative',
    marginRight: 15,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1,
    borderColor: '#fff',
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  notificationCount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  menuButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1,
    borderColor: '#fff',
  },
  logoutButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 107, 107, 0.18)',
    borderWidth: 1,
    borderColor: '#fff',
  },
  headerStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: 18,
    paddingVertical: 15,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#fff',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  quickActionsContainer: {
    marginTop: 20,
    marginBottom: 30,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#6B73FF',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 21,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 15,
    letterSpacing: 0.2,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionItem: {
    alignItems: 'center',
    flex: 1,
  },
  quickActionIcon: {
    width: 62,
    height: 62,
    borderRadius: 31,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#6B73FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#fff',
    backgroundColor: 'rgba(107,115,255,0.18)',
  },
  quickActionTitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  featuresContainer: {
    marginBottom: 30,
  },
  featureCard: {
    padding: 22,
    borderRadius: 22,
    marginBottom: 15,
    shadowColor: '#6B73FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: '#fff',
  },
  activeFeatureCard: {
    borderWidth: 2,
    borderColor: '#6B73FF',
    transform: [{ scale: 1.03 }],
    backgroundColor: 'rgba(107,115,255,0.08)',
  },
  featureCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  featureIconContainer: {
    width: 62,
    height: 62,
    borderRadius: 31,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    backgroundColor: 'rgba(107,115,255,0.18)',
    borderWidth: 1,
    borderColor: '#fff',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 5,
    letterSpacing: 0.2,
  },
  featureStats: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  featureDescription: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 21,
    marginBottom: 15,
    opacity: 0.9,
  },
  featureActivities: {
    marginTop: 10,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  activityDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#6B73FF',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  activityMembers: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  detailedViewContainer: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 22,
    marginBottom: 30,
    shadowColor: '#6B73FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#fff',
  },
  detailedViewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 22,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    backgroundColor: 'rgba(107,115,255,0.18)',
    borderBottomWidth: 1,
    borderColor: '#fff',
  },
  detailedViewTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailedViewTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 10,
    letterSpacing: 0.2,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#fff',
  },
  viewAllText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    marginRight: 5,
    letterSpacing: 0.1,
  },
  detailedViewContent: {
    padding: 22,
  },
  detailedViewDescription: {
    fontSize: 17,
    color: '#6B7280',
    lineHeight: 25,
    marginBottom: 20,
    opacity: 0.9,
  },
  getStartedButton: {
    borderRadius: 15,
  },
  getStartedGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    borderRadius: 15,
    backgroundColor: 'rgba(107,115,255,0.18)',
    borderWidth: 1,
    borderColor: '#fff',
  },
  getStartedText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
    marginRight: 8,
    letterSpacing: 0.2,
  },
  recentActivityContainer: {
    marginBottom: 100,
  },
  activityList: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 18,
    padding: 22,
    shadowColor: '#6B73FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#fff',
  },
  activityListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  activityIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    backgroundColor: 'rgba(107,115,255,0.18)',
    borderWidth: 1,
    borderColor: '#fff',
  },
  activityText: {
    flex: 1,
  },
  activityDescription: {
    fontSize: 15,
    color: '#374151',
    marginBottom: 2,
    letterSpacing: 0.1,
  },
  activityTime: {
    fontSize: 13,
    color: '#9CA3AF',
    letterSpacing: 0.1,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: '#fff',
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 15,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 31,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,107,107,0.18)',
    borderWidth: 1,
    borderColor: '#fff',
  },
});

export default HomeScreen;