import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, Platform, Pressable } from 'react-native';
import { COLORS } from '@/constants/Colors';
import MixHistoryTable, { MixHistoryItem } from '@/components/MixHistoryTable';
import PrimaryButton from '@/components/PrimaryButton';
import { CircleArrowLeft as ArrowLeftCircle } from 'lucide-react-native';

// Sample data
const mockHistoryData: MixHistoryItem[] = [
  { id: '1', date: '04/May', cement: '25%', slump: 'High' },
  { id: '2', date: '03/May', cement: '30%', slump: 'Medium' },
  { id: '3', date: '02/May', cement: '28%', slump: 'Low' },
  { id: '4', date: '01/May', cement: '35%', slump: 'Medium' },
  { id: '5', date: '30/Apr', cement: '32%', slump: 'High' },
];

export default function PreviousMixesScreen() {
  const [selectedMixId, setSelectedMixId] = useState<string | null>(null);
  
  const handleRowPress = (id: string) => {
    setSelectedMixId(id);
  };
  
  const handleBackToList = () => {
    setSelectedMixId(null);
  };
  
  const handleExportLog = () => {
    if (Platform.OS === 'web') {
      Alert.alert('Export Functionality', 'In a production environment, this would export the mix data as a CSV file.');
    } else {
      Alert.alert(
        'Export Functionality', 
        'In a production environment, this would export the mix data as a CSV file.',
        [{ text: 'OK' }]
      );
    }
  };
  
  // Find the selected mix details
  const selectedMix = selectedMixId 
    ? mockHistoryData.find(item => item.id === selectedMixId) 
    : null;
  
  if (selectedMix) {
    return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Pressable style={styles.backButton} onPress={handleBackToList}>
            <ArrowLeftCircle size={24} color={COLORS.darkGray} />
            <Text style={styles.backButtonText}>Back to list</Text>
          </Pressable>
        </View>
        
        <View style={styles.detailsContainer}>
          <Text style={styles.detailsTitle}>Mix Details - {selectedMix.date}</Text>
          
          <View style={styles.detailsCard}>
            <View style={styles.detailsRow}>
              <Text style={styles.detailsLabel}>Date:</Text>
              <Text style={styles.detailsValue}>{selectedMix.date}</Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.detailsLabel}>Cement Percentage:</Text>
              <Text style={styles.detailsValue}>{selectedMix.cement}</Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.detailsLabel}>Slump Level:</Text>
              <Text style={styles.detailsValue}>{selectedMix.slump}</Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.detailsLabel}>Mix ID:</Text>
              <Text style={styles.detailsValue}>MIX-{selectedMix.id}</Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.detailsLabel}>Duration:</Text>
              <Text style={styles.detailsValue}>35 minutes</Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.detailsLabel}>Operator:</Text>
              <Text style={styles.detailsValue}>J. Smith</Text>
            </View>
          </View>
          
          <View style={styles.compositionCard}>
            <Text style={styles.compositionTitle}>Mix Composition</Text>
            <View style={styles.compositionRow}>
              <Text style={styles.compositionLabel}>Cement:</Text>
              <Text style={styles.compositionValue}>{selectedMix.cement}</Text>
            </View>
            <View style={styles.compositionRow}>
              <Text style={styles.compositionLabel}>Sand:</Text>
              <Text style={styles.compositionValue}>45%</Text>
            </View>
            <View style={styles.compositionRow}>
              <Text style={styles.compositionLabel}>Water:</Text>
              <Text style={styles.compositionValue}>25%</Text>
            </View>
          </View>
          
          <PrimaryButton
            title="Export Mix Log"
            onPress={handleExportLog}
            style={styles.exportButton}
          />
        </View>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Previous Mixes</Text>
      
      <Text style={styles.description}>
        View and analyze your previous concrete mixes. Select a row to view detailed information.
      </Text>
      
      <MixHistoryTable
        data={mockHistoryData}
        onRowPress={handleRowPress}
      />
      
      <PrimaryButton
        title="Export Log"
        onPress={handleExportLog}
        style={styles.exportButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
    padding: 16,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: COLORS.darkGray,
    marginBottom: 8,
  },
  description: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 16,
  },
  exportButton: {
    backgroundColor: COLORS.primaryYellow,
  },
  headerContainer: {
    marginBottom: 24,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: COLORS.darkGray,
    marginLeft: 8,
  },
  detailsContainer: {
    flex: 1,
  },
  detailsTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: COLORS.darkGray,
    marginBottom: 16,
  },
  detailsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.mediumGray,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.mediumGray,
  },
  detailsLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.darkGray,
  },
  detailsValue: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.darkGray,
  },
  compositionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.mediumGray,
  },
  compositionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: COLORS.darkGray,
    marginBottom: 8,
  },
  compositionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.mediumGray,
  },
  compositionLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.darkGray,
  },
  compositionValue: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.darkGray,
  },
});