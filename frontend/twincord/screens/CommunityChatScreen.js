// frontend/twincord/screens/CommunityChatScreen.js
import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  StyleSheet,
  StatusBar,
  Alert
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { communitiesAPI } from '../services/api';
import Icon from 'react-native-vector-icons/Ionicons';

const CommunityChatScreen = ({ route, navigation }) => {
  const { communityId, communityName } = route.params;
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const pollingRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    navigation.setOptions({ 
      title: communityName || 'Community',
      headerStyle: {
        backgroundColor: '#6B73FF',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    });
    fetchMessages();
    // polling every 2s
    pollingRef.current = setInterval(fetchMessages, 2000);
    return () => clearInterval(pollingRef.current);
  }, []);

  const fetchMessages = async () => {
    try {
      const resp = await communitiesAPI.getMessages(communityId);
      if (resp.success) setMessages(resp.messages || []);
    } catch (err) {
      // ignore or show small toast
    }
  };

  const send = async () => {
    if (!text.trim()) return;
    try {
      const resp = await communitiesAPI.postMessage(communityId, { 
        senderId: user._id, 
        text: text.trim(), 
        senderName: user.name 
      });
      if (resp.success) {
        setText('');
        // append locally (or refetch)
        fetchMessages();
        // scroll to bottom
        setTimeout(() => listRef.current?.scrollToEnd?.(), 200);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to send message');
    }
  };

  const renderItem = ({ item, index }) => {
    const mine = item.sender && item.sender._id === user._id || item.sender === user._id;
    const prevMessage = index > 0 ? messages[index - 1] : null;
    const prevIsMine = prevMessage && (prevMessage.sender && prevMessage.sender._id === user._id || prevMessage.sender === user._id);
    const showSender = !prevMessage || mine !== prevIsMine;
    
    return (
      <View style={[styles.messageContainer, mine ? styles.myMessageContainer : styles.otherMessageContainer]}>
        {showSender && !mine && (
          <Text style={styles.senderName}>
            {item.senderName || (item.sender && item.sender.name) || 'Member'}
          </Text>
        )}
        <View style={[styles.messageBubble, mine ? styles.myMessageBubble : styles.otherMessageBubble]}>
          <Text style={[styles.messageText, mine ? styles.myMessageText : styles.otherMessageText]}>
            {item.text}
          </Text>
          <Text style={[styles.messageTime, mine ? styles.myMessageTime : styles.otherMessageTime]}>
            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="chatbubbles-outline" size={48} color="#D1D5DB" />
      <Text style={styles.emptyStateTitle}>No messages yet</Text>
      <Text style={styles.emptyStateDescription}>
        Be the first to start the conversation in {communityName}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <View style={styles.chatContainer}>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item, idx) => item._id || idx.toString()}
          renderItem={renderItem}
          contentContainerStyle={[
            styles.messagesList,
            messages.length === 0 && styles.emptyMessagesList
          ]}
          onContentSizeChange={() => listRef.current?.scrollToEnd?.()}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
        />

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput 
              placeholder="Type a message..." 
              placeholderTextColor="#9CA3AF"
              value={text} 
              onChangeText={setText} 
              style={styles.textInput}
              multiline
              maxLength={1000}
            />
            <TouchableOpacity 
              style={[styles.sendButton, text.trim() ? styles.sendButtonActive : styles.sendButtonInactive]} 
              onPress={send}
              disabled={!text.trim()}
            >
              <Icon 
                name="send" 
                size={20} 
                color={text.trim() ? '#fff' : '#9CA3AF'} 
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  emptyMessagesList: {
    flexGrow: 1,
    justifyContent: 'center',
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
  messageContainer: {
    marginBottom: 12,
    maxWidth: '85%',
  },
  myMessageContainer: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
    marginLeft: 12,
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  myMessageBubble: {
    backgroundColor: '#6B73FF',
    borderBottomRightRadius: 6,
  },
  otherMessageBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
    marginBottom: 4,
  },
  myMessageText: {
    color: '#fff',
  },
  otherMessageText: {
    color: '#1F2937',
  },
  messageTime: {
    fontSize: 11,
    fontWeight: '500',
    alignSelf: 'flex-end',
  },
  myMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  otherMessageTime: {
    color: '#9CA3AF',
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F9FAFB',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    maxHeight: 100,
    paddingVertical: 8,
    paddingRight: 12,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonActive: {
    backgroundColor: '#6B73FF',
    shadowColor: '#6B73FF',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  sendButtonInactive: {
    backgroundColor: '#F3F4F6',
  },
});

export default CommunityChatScreen;
