import React, { useState, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, Alert, ActivityIndicator, ScrollView, StatusBar as RNStatusBar } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { ENDPOINTS } from '../config';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

export default function HomeScreen({ navigation }) {
  const [image, setImage] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDetection, setShowDetection] = useState(false);
  const scrollRef = useRef();

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setPrediction(null);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'We need camera access to take photos.');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setPrediction(null);
    }
  };

  const analyzeImage = async () => {
    if (!image) {
      Alert.alert('Error', 'Please select an image first');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', {
      uri: image,
      name: 'upload.jpg',
      type: 'image/jpeg',
    });

    try {
      const response = await axios.post(ENDPOINTS.PREDICT, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setPrediction(response.data);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setPrediction(error.response.data);
      } else {
        Alert.alert('Analysis Failed', 'Could not connect to the backend. Ensure it is running.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStartDetection = () => {
    setShowDetection(true);
    setTimeout(() => {
      scrollRef.current?.scrollTo({ y: 300, animated: true });
    }, 100);
  };

  return (
    <View style={styles.mainWrapper}>
      <RNStatusBar barStyle="dark-content" />
      
      {/* Top Header Barra */}
      <View style={styles.topHeader}>
        <View>
          <Text style={styles.headerTitle}>Dashboard — <Text style={{fontWeight: '400', color: '#636e72'}}>Home</Text></Text>
        </View>
        <View style={styles.onlineStatus}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>System Online</Text>
        </View>
      </View>

      <ScrollView ref={scrollRef} style={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Main Hero Banner */}
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>Detecting <Text style={{fontWeight: 'bold', fontStyle: 'italic'}}>Lumpy Skin Disease</Text> in Cattle with Deep Learning</Text>
          <Text style={styles.heroDesc}>
            Our system leverages state-of-the-art convolutional neural networks — VGG-16, VGG-19, and Inception-v3 — to identify LSD from visual symptoms with higher accuracy than conventional diagnostic methods.
          </Text>
          
          <TouchableOpacity style={styles.startButton} onPress={handleStartDetection}>
             <MaterialCommunityIcons name="upload-outline" size={20} color="#1b4332" />
             <Text style={styles.startButtonText}>Start Detection</Text>
          </TouchableOpacity>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
               <Text style={styles.statValue}>VGG-16</Text>
               <Text style={styles.statLabel}>PRIMARY MODEL</Text>
            </View>
            <View style={[styles.statItem, styles.statBorder]}>
               <Text style={styles.statValue}>3</Text>
               <Text style={styles.statLabel}>DL FRAMEWORKS</Text>
            </View>
            <View style={[styles.statItem, styles.statBorder]}>
               <Text style={styles.statValue}>PCR+</Text>
               <Text style={styles.statLabel}>CONFIRMED</Text>
            </View>
            <View style={[styles.statItem, styles.statBorder]}>
               <Text style={styles.statValue}>Early</Text>
               <Text style={styles.statLabel}>DETECTION</Text>
            </View>
          </View>
        </View>

        {/* Detection Section (Toggled) */}
        {showDetection && (
          <View style={styles.detectionContainer}>
            <View style={styles.sectionHeader}>
              <Ionicons name="scan-circle" size={24} color="#1b4332" />
              <Text style={styles.sectionTitle}>Image Analysis</Text>
            </View>
            
            <View style={styles.imageContainer}>
              {image ? (
                <Image source={{ uri: image }} style={styles.preview} />
              ) : (
                <View style={styles.placeholder}>
                  <Ionicons name="image-outline" size={50} color="#b2bec3" />
                  <Text style={styles.placeholderText}>Please select or capture a photo</Text>
                </View>
              )}
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.secondaryButton} onPress={pickImage}>
                <Ionicons name="images" size={18} color="#2d3436" style={{marginRight: 8}}/>
                <Text style={styles.secondaryButtonText}>Library</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryButton} onPress={takePhoto}>
                <Ionicons name="camera" size={18} color="#2d3436" style={{marginRight: 8}}/>
                <Text style={styles.secondaryButtonText}>Camera</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.mainButton} onPress={analyzeImage} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" animating /> : (
                <>
                  <Text style={styles.mainButtonText}>Analyze Image</Text>
                  <Ionicons name="chevron-forward" size={18} color="#fff" style={{marginLeft: 8}}/>
                </>
              )}
            </TouchableOpacity>

            {prediction && (
              <View style={[
                styles.resultCard, 
                prediction.result === 'Lumpy' ? styles.lumpyBg : 
                prediction.result === 'Invalid Image' ? styles.invalidBg : styles.normalBg
              ]}>
                <Text style={styles.resultTitle}>Analysis Result</Text>
                <Text style={[styles.resultValue, prediction.result === 'Invalid Image' && { fontSize: 24 }]}>
                  {prediction.result === 'Lumpy' ? 'Lumpy Skin Disease Detected' : 
                   prediction.result === 'Invalid Image' ? 'Invalid Image Detected' : 'No Symptoms Found (Normal)'}
                </Text>
                {prediction.detail && <Text style={styles.detailText}>{prediction.detail}</Text>}
                {prediction.result !== 'Invalid Image' && (
                  <Text style={styles.confidence}>Confidence Score: {(prediction.confidence * 100).toFixed(2)}%</Text>
                )}
              </View>
            )}
          </View>
        )}

        {/* Info Card 1: Understanding LSD */}
        <View style={styles.infoCard}>
          <View style={styles.badge}>
             <Ionicons name="information-circle" size={14} color="#1b4332" />
             <Text style={styles.badgeText}>ABOUT THE DISEASE</Text>
          </View>
          <Text style={styles.cardTitle}>Understanding Lumpy Skin Disease (LSD)</Text>
          <Text style={styles.cardContent}>
            Lumpy Skin Disease is a viral infection affecting cattle, first discovered in Africa and now spreading across the Middle East, Asia, and parts of Eastern Europe. It is caused by the <Text style={{fontWeight: 'bold'}}>Neethling virus</Text>, a member of the Capripoxvirus genus, and manifests as fever, excessive drooling, nasal discharge, and prominent nodular lesions across the skin.
          </Text>
          <Text style={styles.cardContent}>
            Beyond visible lesions, LSD inflicts serious economic consequences — infertility, stunted growth, miscarriages, a sharp drop in milk production, and in severe cases, death.
          </Text>
        </View>

        {/* Info Card 2: Clinical Steps */}
        <View style={styles.infoCard}>
          <View style={styles.badge}>
             <Ionicons name="medical" size={14} color="#1b4332" />
             <Text style={styles.badgeText}>DIAGNOSIS METHODS</Text>
          </View>
          <Text style={styles.cardTitle}>Confirming LSD — Clinical Steps</Text>
          
          <View style={styles.listItem}>
            <View style={styles.listIconBg}>
              <Ionicons name="eye" size={18} color="#1b4332" />
            </View>
            <View style={styles.listTextContainer}>
              <Text style={styles.listLabel}>Visual Symptom Assessment</Text>
              <Text style={styles.listSubText}>Identification of skin nodules and field examination.</Text>
            </View>
          </View>

          <View style={styles.listItem}>
            <View style={styles.listIconBg}>
              <Ionicons name="flask" size={18} color="#1b4332" />
            </View>
            <View style={styles.listTextContainer}>
              <Text style={styles.listLabel}>PCR Testing</Text>
              <Text style={styles.listSubText}>Polymerase chain reaction testing on tissue or blood samples.</Text>
            </View>
          </View>

          <View style={styles.listItem}>
            <View style={styles.listIconBg}>
              <Ionicons name="images-outline" size={18} color="#1b4332" />
            </View>
            <View style={styles.listTextContainer}>
              <Text style={styles.listLabel}>Deep Learning Diagnosis</Text>
              <Text style={styles.listSubText}>Automated detection via VGG-16, VGG-19, and Inception-V3.</Text>
            </View>
          </View>
        </View>

        {/* Info Card 3: Deep Learning */}
        <View style={styles.infoCard}>
          <View style={styles.badge}>
             <Ionicons name="hardware-chip" size={14} color="#1b4332" />
             <Text style={styles.badgeText}>OUR APPROACH</Text>
          </View>
          <Text style={styles.cardTitle}>Deep Learning for Faster Detection</Text>
          <Text style={styles.cardContent}>
             Our pipeline combines powerful convolutional feature extractors with classical machine learning classifiers to deliver reliable, fast diagnoses.
          </Text>
          
          <View style={styles.modelGrid}>
            <View style={styles.modelBox}>
              <Text style={styles.modelName}>VGG-16</Text>
              <Text style={styles.modelTag}>EXTRACTOR</Text>
            </View>
            <View style={styles.modelBox}>
              <Text style={styles.modelName}>VGG-19</Text>
              <Text style={styles.modelTag}>EXTRACTOR</Text>
            </View>
            <View style={styles.modelBox}>
              <Text style={styles.modelName}>Inception-v3</Text>
              <Text style={styles.modelTag}>EXTRACTOR</Text>
            </View>
            <View style={styles.modelBox}>
              <Text style={styles.modelName}>SVM / KNN</Text>
              <Text style={styles.modelTag}>CLASSIFIER</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.footerLogo}>
             <Ionicons name="paw" size={24} color="#2d6a4f" />
             <Text style={styles.footerText}>Lumpy Skin Disease Cattle Detection System</Text>
          </View>
          <Text style={styles.copyright}>© 2026 Lumpy Skin Disease Detection — All rights reserved</Text>
          <TouchableOpacity style={styles.logout} onPress={() => navigation.replace('Login')}>
            <Text style={styles.logoutText}>Logout from Account</Text>
          </TouchableOpacity>
        </View>
        
        <View style={{height: 40}} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainWrapper: { flex: 1, backgroundColor: '#f5f6fa' },
  topHeader: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#2d3436' },
  onlineStatus: { flexDirection: 'row', alignItems: 'center' },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#2ecc71', marginRight: 6 },
  statusText: { fontSize: 12, color: '#27ae60', fontWeight: '500' },
  
  container: { flex: 1 },
  
  heroCard: {
    backgroundColor: '#2d6a4f',
    margin: 15,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#1b4332',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  heroTitle: { fontSize: 28, color: '#fff', lineHeight: 36, marginBottom: 15 },
  heroDesc: { fontSize: 14, color: '#d1e7dd', lineHeight: 22, marginBottom: 25 },
  startButton: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 30,
  },
  startButtonText: { color: '#1b4332', fontWeight: 'bold', marginLeft: 10 },
  
  statsRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', paddingTop: 20 },
  statItem: { flex: 1, alignItems: 'center' },
  statBorder: { borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.1)' },
  statValue: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  statLabel: { color: '#a3cfbb', fontSize: 8, fontWeight: 'bold', marginTop: 4, textAlign: 'center' },

  detectionContainer: { backgroundColor: '#fff', marginHorizontal: 15, marginBottom: 15, borderRadius: 20, padding: 20, elevation: 3 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#1b4332', marginLeft: 10 },
  
  imageContainer: { 
    height: 220, 
    width: '100%', 
    marginBottom: 20, 
    borderRadius: 15, 
    overflow: 'hidden', 
    backgroundColor: '#f8f9fa', 
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderStyle: 'dashed'
  },
  preview: { height: '100%', width: '100%' },
  placeholder: { alignItems: 'center' },
  placeholderText: { color: '#adb5bd', marginTop: 10, fontSize: 12 },
  
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  secondaryButton: { 
    backgroundColor: '#f1f2f6', 
    flex: 0.48, 
    padding: 12, 
    borderRadius: 12, 
    flexDirection: 'row',
    alignItems: 'center', 
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#eee'
  },
  secondaryButtonText: { color: '#2d3436', fontWeight: '600', fontSize: 14 },
  
  mainButton: { 
    backgroundColor: '#1b4332', 
    padding: 16, 
    borderRadius: 12, 
    flexDirection: 'row',
    alignItems: 'center', 
    justifyContent: 'center',
    marginBottom: 20 
  },
  mainButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  
  resultCard: { padding: 20, borderRadius: 15, alignItems: 'center', marginTop: 10 },
  lumpyBg: { backgroundColor: '#e63946' },
  normalBg: { backgroundColor: '#2ecc71' },
  invalidBg: { backgroundColor: '#f1c40f' },
  resultTitle: { color: '#fff', fontSize: 14, opacity: 0.9 },
  resultValue: { color: '#fff', fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginVertical: 8 },
  detailText: { color: '#fff', fontSize: 13, textAlign: 'center', opacity: 0.9, fontStyle: 'italic' },
  confidence: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 10, fontWeight: 'bold' },

  infoCard: { backgroundColor: '#fff', marginHorizontal: 15, marginBottom: 15, borderRadius: 20, padding: 20, elevation: 2 },
  badge: { 
    backgroundColor: '#d1e7dd', 
    paddingHorizontal: 10, 
    paddingVertical: 4, 
    borderRadius: 50, 
    alignSelf: 'flex-start', 
    flexDirection: 'row', 
    alignItems: 'center',
    marginBottom: 12
  },
  badgeText: { fontSize: 10, color: '#1b4332', fontWeight: 'bold', marginLeft: 4 },
  cardTitle: { fontSize: 20, fontWeight: 'bold', color: '#1b4332', marginBottom: 12 },
  cardContent: { fontSize: 14, color: '#495057', lineHeight: 22, marginBottom: 12 },
  
  listItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  listIconBg: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#d1e7dd', justifyContent: 'center', alignItems: 'center' },
  listTextContainer: { marginLeft: 15, flex: 1 },
  listLabel: { fontSize: 15, fontWeight: 'bold', color: '#1b4332' },
  listSubText: { fontSize: 12, color: '#6c757d', marginTop: 2 },
  
  modelGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  modelBox: { width: '48%', backgroundColor: '#f8f9fa', padding: 15, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#e9ecef' },
  modelName: { fontSize: 14, fontWeight: 'bold', color: '#1b4332' },
  modelTag: { fontSize: 10, color: '#6c757d', marginTop: 4, fontWeight: 'bold' },
  
  footer: { padding: 30, alignItems: 'center', backgroundColor: '#e9ecef', marginTop: 20 },
  footerLogo: { flexDirection: 'column', alignItems: 'center', marginBottom: 15 },
  footerText: { fontSize: 14, fontWeight: 'bold', color: '#1b4332', textAlign: 'center', marginTop: 10 },
  copyright: { fontSize: 10, color: '#adb5bd', textAlign: 'center' },
  logout: { marginTop: 25, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 50, backgroundColor: 'rgba(214, 48, 49, 0.1)' },
  logoutText: { color: '#d63031', fontWeight: 'bold', fontSize: 12 }
});

