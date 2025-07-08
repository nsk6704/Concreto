import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { COLORS } from '@/constants/Colors';
import CustomSlider from '@/components/CustomSlider';
import PrimaryButton from '@/components/PrimaryButton';
import { useAuth } from '@/contexts/AuthContext';
import { saveMixData } from '@/utils/mixHistoryService';
import { getSensorData } from '@/utils/esp32Api';
import { Alert, TextInput } from 'react-native';

// Define preset mix templates
const MIX_TEMPLATES = [
  { name: 'Standard Mix', cement: 35, sand: 45, water: 20 },
  { name: 'High Strength', cement: 45, sand: 40, water: 15 },
  { name: 'Economical', cement: 25, sand: 50, water: 25 },
  { name: 'Quick Setting', cement: 40, sand: 45, water: 15 },
];

export default function DesignInputsScreen() {
  const [cementValue, setCementValue] = useState(35);
  const [sandValue, setSandValue] = useState(45);
  const [waterValue, setWaterValue] = useState(20);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [designName, setDesignName] = useState('');

  const total = cementValue + sandValue + waterValue;
  const isValidMix = total === 100;

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to save mix designs');
      return;
    }

    if (!isValidMix) {
      Alert.alert('Error', 'Total percentage must equal 100% to submit');
      return;
    }

    setSaving(true);
    setIsSubmitted(true);

    try {
      // Get current sensor data (or mock data)
      const sensorData = (await getSensorData()) || {
        moisture: 12,
        temperature: 32,
        loadCell: 55,
      };

      // Save mix data to Firebase
      await saveMixData({
        userId: user.uid,
        date: new Date(),
        cement: cementValue,
        sand: sandValue,
        water: waterValue,
        temperature: sensorData.temperature,
        moisture: sensorData.moisture,
        loadCell: sensorData.loadCell,
        notes: designName || 'Unnamed Mix',
      });

      // Reset the submitted state after a delay
      setTimeout(() => {
        setIsSubmitted(false);
        setDesignName('');
      }, 3000);
    } catch (error) {
      console.error('Error saving mix data:', error);
      Alert.alert('Error', 'Failed to save mix data');
      setIsSubmitted(false);
    } finally {
      setSaving(false);
    }
  };

  const handleBalanceMix = () => {
    if (total === 100) return; // Already balanced

    // Calculate the proportional adjustment needed
    const adjustmentFactor = 100 / total;

    // Adjust all values proportionally
    const newCement = Math.round(cementValue * adjustmentFactor);
    const newSand = Math.round(sandValue * adjustmentFactor);
    // Calculate water to ensure exact 100% (avoid rounding errors)
    const newWater = 100 - newCement - newSand;

    setCementValue(newCement);
    setSandValue(newSand);
    setWaterValue(newWater);
  };

  const applyTemplate = (template) => {
    setCementValue(template.cement);
    setSandValue(template.sand);
    setWaterValue(template.water);
    setSelectedTemplate(template.name);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Mix Design Inputs</Text>

          <Text style={styles.sectionTitle}>Templates</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.templatesContainer}
          >
            {MIX_TEMPLATES.map((template) => (
              <TouchableOpacity
                key={template.name}
                style={[
                  styles.templateButton,
                  selectedTemplate === template.name &&
                    styles.selectedTemplateButton,
                ]}
                onPress={() => applyTemplate(template)}
              >
                <Text
                  style={[
                    styles.templateText,
                    selectedTemplate === template.name &&
                      styles.selectedTemplateText,
                  ]}
                >
                  {template.name}
                </Text>
                <Text
                  style={[
                    styles.templateRatio,
                    selectedTemplate === template.name &&
                      styles.selectedTemplateText,
                  ]}
                >
                  {template.cement}/{template.sand}/{template.water}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.sliderContainer}>
            <CustomSlider
              name="Cement"
              minValue={0}
              maxValue={100}
              initialValue={cementValue}
              value={cementValue}
              onValueChange={(value) => {
                setCementValue(value);
                setSelectedTemplate(null);
              }}
            />

            <CustomSlider
              name="Sand"
              minValue={0}
              maxValue={100}
              initialValue={sandValue}
              value={sandValue}
              onValueChange={(value) => {
                setSandValue(value);
                setSelectedTemplate(null);
              }}
            />

            <CustomSlider
              name="Water"
              minValue={0}
              maxValue={100}
              initialValue={waterValue}
              value={waterValue}
              onValueChange={(value) => {
                setWaterValue(value);
                setSelectedTemplate(null);
              }}
            />
          </View>

          <View style={styles.mixSummary}>
            <Text style={styles.mixSummaryTitle}>Mix Summary</Text>
            <View style={styles.mixSummaryItem}>
              <Text style={styles.mixSummaryLabel}>Cement:</Text>
              <Text style={styles.mixSummaryValue}>{cementValue}%</Text>
            </View>
            <View style={styles.mixSummaryItem}>
              <Text style={styles.mixSummaryLabel}>Sand:</Text>
              <Text style={styles.mixSummaryValue}>{sandValue}%</Text>
            </View>
            <View style={styles.mixSummaryItem}>
              <Text style={styles.mixSummaryLabel}>Water:</Text>
              <Text style={styles.mixSummaryValue}>{waterValue}%</Text>
            </View>
            <View style={styles.mixSummaryItem}>
              <Text style={styles.mixSummaryLabel}>Total:</Text>
              <Text
                style={[
                  styles.mixSummaryValue,
                  { color: isValidMix ? COLORS.success : COLORS.error },
                ]}
              >
                {total}%
              </Text>
            </View>
          </View>

          {!isValidMix && (
            <PrimaryButton
              title="Balance Mix to 100%"
              onPress={handleBalanceMix}
              variant="secondary"
              style={styles.balanceButton}
            />
          )}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Mix Name (optional)</Text>
            <TextInput
              style={styles.textInput}
              value={designName}
              onChangeText={setDesignName}
              placeholder="e.g., Basement Foundation Mix"
            />
          </View>

          <PrimaryButton
            title={isSubmitted ? 'Design Submitted!' : 'Submit Mix Design'}
            onPress={handleSubmit}
            disabled={isSubmitted || !isValidMix}
            style={isSubmitted ? styles.submittedButton : styles.submitButton}
          />

          {!isValidMix && (
            <Text style={styles.warningText}>
              Note: Total percentage must equal 100% to submit.
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: COLORS.darkGray,
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: COLORS.darkGray,
    marginBottom: 12,
  },
  templatesContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  templateButton: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
    marginRight: 10,
    minWidth: 120,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.mediumGray,
  },
  selectedTemplateButton: {
    backgroundColor: COLORS.primaryYellow,
    borderColor: COLORS.darkYellow,
  },
  templateText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  templateRatio: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: COLORS.darkGray,
  },
  selectedTemplateText: {
    color: COLORS.darkGray,
    fontFamily: 'Inter-SemiBold',
  },
  sliderContainer: {
    marginBottom: 24,
  },
  mixSummary: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  mixSummaryTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: COLORS.darkGray,
    marginBottom: 12,
  },
  mixSummaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  mixSummaryLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.darkGray,
  },
  mixSummaryValue: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: COLORS.darkGray,
  },
  submitButton: {
    backgroundColor: COLORS.primaryYellow,
  },
  submittedButton: {
    backgroundColor: COLORS.success,
  },
  balanceButton: {
    marginBottom: 16,
    backgroundColor: COLORS.blue,
  },
  warningText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.error,
    marginTop: 8,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    height: 50,
    paddingHorizontal: 16,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: COLORS.darkGray,
  },
});
