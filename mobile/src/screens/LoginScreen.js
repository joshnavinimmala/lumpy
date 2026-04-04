import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import axios from 'axios';
import { ENDPOINTS } from '../config';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen({ navigation }) {
  const [loginid, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setLoginId('');
      setPassword('');
      setIsAdmin(false);
    });
    return unsubscribe;
  }, [navigation]);

  const handleLogin = async () => {
    if (!loginid || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    const endpoint = isAdmin ? ENDPOINTS.ADMIN_LOGIN : ENDPOINTS.LOGIN;
    try {
      const response = await axios.post(endpoint, { loginid, password });
      Alert.alert('Success', `Welcome back, ${response.data.name}!`);
      if (isAdmin) {
        navigation.navigate('Admin');
      } else {
        navigation.replace('Home');
      }
    } catch (error) {
      console.log('Login Error:', error);
      const message = error.response?.data?.detail || (error.message === 'Network Error' ? 'Cannot connect to server. Check your backend and IP address.' : 'Something went wrong');
      Alert.alert('Login Failed', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.headerDecoration}>
         <Ionicons name="paw" size={80} color="rgba(45, 106, 79, 0.1)" />
      </View>

      <View style={styles.card}>
        <View style={styles.iconContainer}>
          <Ionicons name="paw" size={40} color="#2d6a4f" />
        </View>
        <Text style={styles.title}>Lumpy Skin Disease</Text>
        <Text style={styles.subtitle}>CATTLE DETECTION SYSTEM</Text>

        <View style={styles.inputWrapper}>
          <Ionicons name="person-outline" size={20} color="#636e72" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Login ID or Username"
            placeholderTextColor="#b2bec3"
            value={loginid}
            onChangeText={setLoginId}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputWrapper}>
          <Ionicons name="lock-closed-outline" size={20} color="#636e72" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#b2bec3"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity style={[styles.button, isAdmin && styles.adminMode]} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" animating /> : (
            <Text style={styles.buttonText}>{isAdmin ? 'Admin Dashboard' : 'Login Securely'}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setIsAdmin(!isAdmin)} style={styles.toggleContainer}>
          <Text style={styles.adminToggle}>
            {isAdmin ? 'Switch to Login' : 'Switch to Admin Access'}
          </Text>
        </TouchableOpacity>

        {!isAdmin && (
          <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.registerLink}>
            <Text style={styles.linkText}>New to the system? <Text style={{fontWeight: 'bold', color: '#1b4332'}}>Create Account</Text></Text>
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>Real-time lumpy skin disease monitoring</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
    justifyContent: 'center',
    padding: 20,
  },
  headerDecoration: {
    position: 'absolute',
    top: -20,
    right: -20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 30,
    elevation: 8,
    shadowColor: '#1b4332',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 20,
    backgroundColor: '#f1f8f5',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1b4332',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 35,
    letterSpacing: 2,
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    marginBottom: 15,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 16,
    color: '#2d3436',
  },
  button: {
    backgroundColor: '#2d6a4f',
    borderRadius: 15,
    padding: 18,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#1b4332',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  adminMode: {
    backgroundColor: '#1b4332',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  toggleContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  adminToggle: {
    color: '#2d6a4f',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  registerLink: {
    marginTop: 25,
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#f1f2f6',
  },
  linkText: {
    color: '#636e72',
    fontSize: 14,
  },
  footer: {
    marginTop: 30,
    alignItems: 'center',
  },
  footerText: {
    color: '#adb5bd',
    fontSize: 12,
    fontStyle: 'italic',
  }
});
