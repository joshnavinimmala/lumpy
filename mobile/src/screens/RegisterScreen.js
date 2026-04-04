import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import axios from 'axios';
import { ENDPOINTS } from '../config';
import { Ionicons } from '@expo/vector-icons';

export default function RegisterScreen({ navigation }) {
  const [formData, setFormData] = useState({
    name: '',
    loginid: '',
    password: '',
    mobile: '',
    email: '',
    locality: '',
    address: '',
    city: '',
    state: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegister = async () => {
    for (const key in formData) {
      if (!formData[key]) {
        Alert.alert('Error', `Please fill in the ${key} field`);
        return;
      }
    }

    setLoading(true);
    try {
      await axios.post(ENDPOINTS.REGISTER, formData);
      Alert.alert('Registration Successful', 'Your account has been created! Please wait for admin approval before logging in.', [
        { text: 'Got it!', onPress: () => navigation.navigate('Login') }
      ]);
    } catch (error) {
      console.log('Registration Error:', error);
      const message = error.response?.data?.detail || (error.message === 'Network Error' ? 'Cannot connect to server. Check your backend and IP address.' : 'Registration failed. Please check your details.');
      Alert.alert('Registration Failed', message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#1b4332" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Create Account</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.badge}>
             <Ionicons name="person-add" size={14} color="#1b4332" />
             <Text style={styles.badgeText}>REGISTRATION</Text>
          </View>
          <Text style={styles.title}>Join Our Community</Text>
          <Text style={styles.subtitle}>Fill in your details to start using the Lumpy Skin Detection system.</Text>
          
          <InputField 
            icon="person-outline" 
            placeholder="Full Name" 
            value={formData.name}
            onChangeText={v => handleChange('name', v)} 
          />
          <InputField 
            icon="at-outline" 
            placeholder="Login ID / Username" 
            autoCapitalize="none" 
            value={formData.loginid}
            onChangeText={v => handleChange('loginid', v)} 
          />
          <InputField 
            icon="lock-closed-outline" 
            placeholder="Password" 
            secureTextEntry 
            value={formData.password}
            onChangeText={v => handleChange('password', v)} 
          />
          <InputField 
            icon="call-outline" 
            placeholder="Mobile Number" 
            keyboardType="phone-pad" 
            value={formData.mobile}
            onChangeText={v => handleChange('mobile', v)} 
          />
          <InputField 
            icon="mail-outline" 
            placeholder="Email Address" 
            keyboardType="email-address" 
            autoCapitalize="none" 
            value={formData.email}
            onChangeText={v => handleChange('email', v)} 
          />
          <InputField 
            icon="map-outline" 
            placeholder="Locality" 
            value={formData.locality}
            onChangeText={v => handleChange('locality', v)} 
          />
          <InputField 
            icon="home-outline" 
            placeholder="Street Address" 
            multiline 
            numberOfLines={3} 
            value={formData.address}
            onChangeText={v => handleChange('address', v)} 
          />
          <InputField 
            icon="business-outline" 
            placeholder="City" 
            value={formData.city}
            onChangeText={v => handleChange('city', v)} 
          />
          <InputField 
            icon="location-outline" 
            placeholder="State" 
            value={formData.state}
            onChangeText={v => handleChange('state', v)} 
          />

          <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" animating /> : (
              <>
                <Text style={styles.buttonText}>Register Account</Text>
                <Ionicons name="checkmark-circle" size={18} color="#fff" style={{marginLeft: 8}} />
              </>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginLink}>
            <Text style={styles.linkText}>Already have an account? <Text style={{fontWeight: 'bold', color: '#1b4332'}}>Login here</Text></Text>
          </TouchableOpacity>
        </View>
        
        <View style={{height: 40}} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const InputField = ({ icon, placeholder, value, onChangeText, ...props }) => (
  <View style={styles.inputWrapper}>
    <Ionicons name={icon} size={20} color="#636e72" style={styles.inputIcon} />
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      placeholderTextColor="#b2bec3"
      value={value}
      onChangeText={onChangeText}
      {...props}
    />
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  scrollContent: { padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginTop: 30, marginBottom: 20 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', elevation: 2 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1b4332', marginLeft: 15 },
  
  card: { backgroundColor: '#fff', borderRadius: 30, padding: 25, elevation: 4, shadowColor: '#1b4332', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.1, shadowRadius: 10 },
  badge: { backgroundColor: '#d1e7dd', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 50, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  badgeText: { fontSize: 10, color: '#1b4332', fontWeight: 'bold', marginLeft: 4 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1b4332', marginBottom: 5 },
  subtitle: { fontSize: 13, color: '#6c757d', marginBottom: 25, lineHeight: 18 },
  
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8f9fa', borderRadius: 15, marginBottom: 12, paddingHorizontal: 15, borderWidth: 1, borderColor: '#e9ecef' },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 12, fontSize: 15, color: '#2d3436' },
  
  button: { backgroundColor: '#2d6a4f', borderRadius: 15, padding: 18, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', marginTop: 20, shadowColor: '#1b4332', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 5 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  
  loginLink: { marginTop: 20, alignItems: 'center' },
  linkText: { color: '#636e72', fontSize: 14 },
});
