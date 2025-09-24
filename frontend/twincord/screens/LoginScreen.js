import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await login({
        email: email.trim().toLowerCase(),
        password: password,
      });

      if (response.success) {
        Alert.alert(
          'Success!', 
          `Welcome back, ${response.data.user.name}!`,
          [{ text: 'Continue' }]
        );
        // Navigation will happen automatically through AuthContext
      }
    } catch (error) {
      console.error('Login error:', error);
      
      if (error.details && Array.isArray(error.details)) {
        // Handle validation errors
        const validationErrors = {};
        error.details.forEach(detail => {
          validationErrors[detail.field] = detail.message;
        });
        setErrors(validationErrors);
      } else {
        Alert.alert(
          'Login Failed',
          error.error || 'An unexpected error occurred. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      setIsLoading(true);
      const response = await authAPI.healthCheck();
      Alert.alert('Connection Test', response.status || 'Server is running!');
    } catch (error) {
      Alert.alert('Connection Test', 'Failed to connect to server. Make sure the backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#667eea', '#764ba2', '#6B73FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Floating Elements Background */}
          <View style={styles.floatingElements}>
            <View style={[styles.floatingCircle, styles.circle1]} />
            <View style={[styles.floatingCircle, styles.circle2]} />
            <View style={[styles.floatingCircle, styles.circle3]} />
          </View>

          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={['#FF6B6B', '#FF8E53']}
                style={styles.logoCircle}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="chatbubbles" size={40} color="#fff" />
              </LinearGradient>
            </View>
            <Text style={styles.title}>TwinCord</Text>
            <Text style={styles.subtitle}>Connect, Chat, Collaborate</Text>
          </View>

          {/* Login Card */}
          <View style={styles.loginCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Welcome Back!</Text>
              <Text style={styles.cardSubtitle}>Sign in to continue</Text>
            </View>

            <View style={styles.formContainer}>
              {/* Email Input */}
              <View style={styles.inputContainer}>
                <View style={styles.inputIconContainer}>
                  <Ionicons name="mail-outline" size={20} color="#667eea" />
                </View>
                <TextInput
                  style={[styles.input, errors.email && styles.inputError]}
                  placeholder="Email Address"
                  placeholderTextColor="#8F9BB3"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (errors.email) {
                      setErrors(prev => ({ ...prev, email: null }));
                    }
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  editable={!isLoading}
                />
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <View style={styles.inputIconContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color="#667eea" />
                </View>
                <TextInput
                  style={[styles.input, errors.password && styles.inputError]}
                  placeholder="Password"
                  placeholderTextColor="#8F9BB3"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errors.password) {
                      setErrors(prev => ({ ...prev, password: null }));
                    }
                  }}
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                  editable={!isLoading}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  <Ionicons 
                    name={showPassword ? "eye-outline" : "eye-off-outline"} 
                    size={20} 
                    color="#667eea" 
                  />
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

              {/* Forgot Password */}
              <TouchableOpacity style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>

              {/* Login Button */}
              <TouchableOpacity 
                style={styles.loginButton} 
                onPress={handleLogin}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={isLoading ? ['#9CA3AF', '#6B7280'] : ['#FF6B6B', '#FF8E53']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.loginButtonGradient}
                >
                  {isLoading ? (
                    <View style={styles.loadingContainer}>
                      <View style={styles.spinner} />
                      <Text style={styles.loginButtonText}>Signing In...</Text>
                    </View>
                  ) : (
                    <>
                      <Text style={styles.loginButtonText}>Sign In</Text>
                      <Ionicons name="arrow-forward" size={20} color="#fff" />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.divider} />
              </View>

              {/* Social Login */}
              <TouchableOpacity style={styles.socialButton}>
                <View style={styles.socialButtonContent}>
                  <Ionicons name="logo-google" size={20} color="#4285F4" />
                  <Text style={styles.socialButtonText}>Continue with Google</Text>
                </View>
              </TouchableOpacity>

              {/* Test Connection Button - for development */}
              <TouchableOpacity 
                style={styles.testButton} 
                onPress={handleTestConnection}
                disabled={isLoading}
              >
                <Text style={styles.testButtonText}>Test Server Connection</Text>
              </TouchableOpacity>

              {/* Sign Up Link */}
              <View style={styles.signupContainer}>
                <Text style={styles.signupText}>Don't have an account? </Text>
                <TouchableOpacity 
                  onPress={() => navigation.navigate('Signup')}
                  disabled={isLoading}
                >
                  <Text style={styles.signupLink}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 50,
  },
  floatingElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  floatingCircle: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 50,
  },
  circle1: {
    width: 100,
    height: 100,
    top: 100,
    right: -50,
  },
  circle2: {
    width: 150,
    height: 150,
    top: 300,
    left: -75,
  },
  circle3: {
    width: 80,
    height: 80,
    bottom: 200,
    right: 50,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 15,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  loginCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 25,
    padding: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 15,
    },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 20,
  },
  cardHeader: {
    backgroundColor: 'rgba(107, 115, 255, 0.1)',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 25,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 5,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#8F9BB3',
  },
  formContainer: {
    padding: 25,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F9FC',
    borderRadius: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E4E9F2',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  inputIconContainer: {
    width: 50,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 55,
    fontSize: 16,
    color: '#2E3A47',
    paddingRight: 15,
  },
  eyeButton: {
    width: 50,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 30,
  },
  forgotPasswordText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: {
    marginBottom: 25,
    borderRadius: 15,
    shadowColor: '#FF6B6B',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  loginButtonGradient: {
    height: 55,
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spinner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#fff',
    borderTopColor: 'transparent',
    marginRight: 10,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E4E9F2',
  },
  dividerText: {
    marginHorizontal: 15,
    color: '#8F9BB3',
    fontSize: 14,
    fontWeight: '600',
  },
  socialButton: {
    marginBottom: 25,
  },
  socialButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    height: 55,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E4E9F2',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  socialButtonText: {
    color: '#4285F4',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    color: '#8F9BB3',
    fontSize: 16,
  },
  signupLink: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: 'bold',
  },
  inputError: {
    borderColor: '#FF6B6B',
    borderWidth: 1,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 5,
  },
  testButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  testButtonText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default LoginScreen;
