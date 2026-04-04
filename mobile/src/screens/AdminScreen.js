import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator, StatusBar } from 'react-native';
import axios from 'axios';
import { ENDPOINTS } from '../config';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function AdminScreen({ navigation }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(ENDPOINTS.LIST_USERS);
      setUsers(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity 
          style={{ marginLeft: 15 }} 
          onPress={() => navigation.navigate('Login')}
        >
          <Ionicons name="arrow-back" size={24} color="#1b4332" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleActivate = async (userId) => {
    try {
      await axios.post(ENDPOINTS.ACTIVATE_USER, { id: userId });
      Alert.alert('Verified', 'User activated successfully!');
      fetchUsers();
    } catch (error) {
      Alert.alert('Error', 'Failed to activate the user.');
    }
  };

  const renderUser = ({ item }) => (
    <View style={styles.userCard}>
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
           <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.userInfo}>
           <Text style={styles.userName}>{item.name}</Text>
           <Text style={styles.userDetails}>ID: {item.loginid}</Text>
        </View>
        <View style={[styles.statusBadge, item.status === 'activated' ? styles.activeBadge : styles.pendingBadge]}>
            <Text style={[styles.statusText, item.status === 'activated' ? styles.activeText : styles.pendingText]}>
                {item.status.toUpperCase()}
            </Text>
        </View>
      </View>
      
      <View style={styles.cardDetailRow}>
          <Ionicons name="mail-outline" size={14} color="#6c757d" />
          <Text style={styles.detailText}>{item.email}</Text>
      </View>
      <View style={styles.cardDetailRow}>
          <Ionicons name="call-outline" size={14} color="#6c757d" />
          <Text style={styles.detailText}>{item.mobile || 'No Phone'}</Text>
      </View>

      {item.status !== 'activated' && (
        <TouchableOpacity style={styles.activateButton} onPress={() => handleActivate(item.id)}>
          <Ionicons name="checkmark-circle" size={16} color="#fff" style={{marginRight: 8}}/>
          <Text style={styles.activateButtonText}>Activate Account</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.titleContainer}>
        <MaterialCommunityIcons name="shield-account" size={32} color="#1b4332" />
        <View style={{marginLeft: 15}}>
            <Text style={styles.title}>Admin Panel</Text>
            <Text style={styles.subtitle}>Manage account activation</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
           <ActivityIndicator size="large" color="#2d6a4f" />
           <Text style={styles.loadingText}>Fetching database...</Text>
        </View>
      ) : (
        <FlatList
          data={users}
          renderItem={renderUser}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.list}
          refreshing={loading}
          onRefresh={fetchUsers}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
               <Ionicons name="people-outline" size={60} color="#adb5bd" />
               <Text style={styles.emptyText}>No users found in database</Text>
            </View>
          }
        />
      )}
      
      <TouchableOpacity style={styles.logout} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.logoutText}>Logout to Security Menu</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Real-time lumpy skin disease monitoring</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa', paddingHorizontal: 20 },
  titleContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 25, marginBottom: 25 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#1b4332' },
  subtitle: { fontSize: 13, color: '#6c757d', fontWeight: '500' },
  
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 15, color: '#6c757d', fontWeight: '500' },
  
  list: { paddingBottom: 25 },
  userCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 15, elevation: 3, shadowColor: '#1b4332', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 },
  
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  avatar: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#f1f8f5', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#d1e7dd' },
  avatarText: { fontSize: 18, fontWeight: 'bold', color: '#1b4332' },
  userInfo: { flex: 1, marginLeft: 12 },
  userName: { fontSize: 17, fontWeight: 'bold', color: '#1b4332' },
  userDetails: { fontSize: 12, color: '#adb5bd', marginTop: 2 },
  
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  activeBadge: { backgroundColor: 'rgba(46, 204, 113, 0.1)' },
  pendingBadge: { backgroundColor: 'rgba(241, 196, 15, 0.1)' },
  statusText: { fontSize: 10, fontWeight: 'bold' },
  activeText: { color: '#27ae60' },
  pendingText: { color: '#f39c12' },
  
  cardDetailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, marginLeft: 5 },
  detailText: { fontSize: 13, color: '#495057', marginLeft: 10 },
  
  activateButton: { backgroundColor: '#2d6a4f', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 15 },
  activateButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  
  emptyContainer: { alignItems: 'center', marginTop: 50 },
  emptyText: { color: '#adb5bd', fontSize: 16, marginTop: 15 },
  
  logout: { padding: 20, alignItems: 'center', marginTop: 10 },
  logoutText: { color: '#d63031', fontWeight: 'bold', fontSize: 13, textDecorationLine: 'underline' },
  footer: {
    paddingVertical: 15,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f1f2f6',
  },
  footerText: {
    color: '#adb5bd',
    fontSize: 12,
    fontStyle: 'italic',
  }
});
