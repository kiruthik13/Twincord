// frontend/twincord/components/CommunityItem.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const CommunityItem = ({ community, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(community)}>
      <View style={styles.headerRow}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{community.name?.charAt(0) || '?'}</Text>
        </View>
        <Text style={styles.title}>{community.name}</Text>
      </View>
      <Text style={styles.desc}>{community.description || 'No description provided.'}</Text>
      <View style={styles.footerRow}>
        <Text style={styles.code}>Code: {community.code}</Text>
        <Text style={styles.members}>{community.members ? `${community.members} members` : ''}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 18,
    padding: 18,
    marginVertical: 10,
    marginHorizontal: 16,
    shadowColor: '#6B73FF',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    backdropFilter: 'blur(8px)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6B73FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#6B73FF',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
  },
  desc: {
    marginTop: 2,
    marginBottom: 10,
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.85,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  code: {
    fontSize: 13,
    color: '#6B73FF',
    fontWeight: '600',
    backgroundColor: 'rgba(107,115,255,0.08)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  members: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '500',
  },
});

export default CommunityItem;
