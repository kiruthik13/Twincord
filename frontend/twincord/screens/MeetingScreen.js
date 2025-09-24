// screens/MeetingScreen.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

export default function MeetingScreen({ route }) {
  const { room = 'Twincord' } = route.params;

  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: `https://meet.jit.si/${room}` }}
        style={{ flex: 1 }}
        javaScriptEnabled={true}
        allowsFullscreenVideo={true}
        originWhitelist={['*']}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
