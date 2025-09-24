import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import CommunityItem from '../components/CommunityItem';
import { communitiesAPI } from '../services/api';
import Icon from 'react-native-vector-icons/Ionicons';

const CommunitiesScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [communities, setCommunities] = useState([]);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [joinCode, setJoinCode] = useState('');

  const load = async () => {
    try {
      const resp = await communitiesAPI.listCommunities({ userId: user?._id });
      if (resp.success) setCommunities(resp.communities || []);
    } catch (err) {
      console.warn(err);
      Alert.alert('Error', err.error || 'Could not load communities');
    }
  };

  useEffect(() => { load(); }, []);

  const createCommunity = async () => {
    if (!name.trim()) return Alert.alert('Validation', 'Please enter a name');
    try {
      const resp = await communitiesAPI.createCommunity({ name, description, creatorId: user._id });
      if (resp.success) {
        setName('');
        setDescription('');
        setCreating(false);
        load();
        Alert.alert('Created', `Community created. Code: ${resp.community.code}`);
      } else {
        Alert.alert('Error', resp.error || 'Could not create');
      }
    } catch (err) {
      Alert.alert('Error', err.error || 'Could not create community');
    }
  };

  const joinCommunity = async () => {
    if (!joinCode.trim()) return Alert.alert('Validation', 'Enter join code');
    try {
      const resp = await communitiesAPI.joinCommunity({ userId: user._id, code: joinCode.trim() });
      if (resp.success) {
        setJoinCode('');
        load();
        Alert.alert('Joined', `Joined: ${resp.community.name}`);
      } else {
        Alert.alert('Error', resp.error || 'Could not join');
      }
    } catch (err) {
      Alert.alert('Error', err.error || 'Could not join community');
    }
  };

  const openCommunity = (comm) => {
    navigation.navigate('CommunityChat', { communityId: comm._id, communityName: comm.name });
  };

  const renderHeader = () => (
    <>
      {/* Join Community Section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Join Community</Text>
        <View style={styles.joinContainer}>
          <View style={styles.inputContainer}>
            <Icon name="key-outline" size={20} color="#6B7280" style={styles.inputIcon} />
            <TextInput
              placeholder="Enter community code"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
              value={joinCode}
              onChangeText={setJoinCode}
            />
          </View>
          <TouchableOpacity style={[styles.joinButton, styles.joinButtonSolid]} onPress={joinCommunity}>
            <Text style={styles.buttonText}>Join</Text>
            <Icon name="arrow-forward" size={16} color="#fff" style={styles.buttonIcon} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Create Community Toggle */}
      <View style={styles.sectionContainer}>
        <TouchableOpacity
          style={styles.createToggleButton}
          onPress={() => setCreating(!creating)}
        >
          <View style={styles.createToggleContent}>
            <Icon
              name={creating ? "close-circle-outline" : "add-circle-outline"}
              size={24}
              color="#6B73FF"
            />
            <Text style={styles.createToggleText}>
              {creating ? 'Cancel Creation' : 'Create New Community'}
            </Text>
            <Icon
              name={creating ? "chevron-up" : "chevron-down"}
              size={20}
              color="#6B7280"
            />
          </View>
        </TouchableOpacity>

        {creating && (
          <View style={styles.createForm}>
            <View style={styles.inputContainer}>
              <Icon name="home-outline" size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                placeholder="Community name"
                placeholderTextColor="#9CA3AF"
                style={styles.input}
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={[styles.inputContainer, styles.textAreaContainer]}>
              <Icon name="document-text-outline" size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                placeholder="Description (optional)"
                placeholderTextColor="#9CA3AF"
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
              />
            </View>

            <TouchableOpacity style={[styles.createButton, styles.createButtonSolid]} onPress={createCommunity}>
              <Icon name="add" size={16} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Create Community</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Community Section Title */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Your Communities</Text>
      </View>

      {communities.length === 0 && (
        <View style={styles.communitiesContainer}>
          <View style={styles.emptyState}>
            <Icon name="people-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyStateTitle}>No Communities Yet</Text>
            <Text style={styles.emptyStateDescription}>
              Join a community using a code or create your own to get started
            </Text>
          </View>
        </View>
      )}
    </>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Communities</Text>
          <View style={styles.headerStats}>
            <Text style={styles.headerStatsText}>{communities.length} Joined</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={communities}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <CommunityItem community={item} onPress={openCommunity} />
        )}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: 20 }]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: StatusBar.currentHeight || 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    backgroundColor: '#6B73FF',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerStats: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  headerStatsText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: 20,
  },
  sectionContainer: {
    marginTop: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 15,
  },
  joinContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  textAreaContainer: {
    alignItems: 'flex-start',
    paddingVertical: 15,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    paddingVertical: 0,
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  joinButton: {
    borderRadius: 12,
    shadowColor: '#10B981',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  joinButtonSolid: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  createToggleButton: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  createToggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  createToggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
    marginLeft: 12,
  },
  createForm: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    gap: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  createButton: {
    borderRadius: 12,
    marginTop: 5,
    shadowColor: '#6B73FF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  createButtonSolid: {
    backgroundColor: '#6B73FF',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonIcon: {
    marginHorizontal: 5,
  },
  communitiesContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    minHeight: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6B7280',
    marginTop: 15,
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default CommunitiesScreen;
