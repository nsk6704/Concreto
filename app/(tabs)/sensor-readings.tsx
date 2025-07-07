import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, Pressable, Alert } from 'react-native';
import { COLORS } from '@/constants/Colors';
import SensorCard from '@/components/SensorCard';
import PrimaryButton from '@/components/PrimaryButton';
import { RefreshCw } from 'lucide-react-native';
import { getSensorData } from '@/utils/esp32Api';

export default function SensorReadingsScreen() {
  const [moisture, setMoisture] = useState(11);
  const [temperature, setTemperature] = useState(32);
  const [loadCell, setLoadCell] = useState(55);
  const [autoUpdate, setAutoUpdate] = useState(false);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<
    'connected' | 'disconnected' | 'connecting'
  >('disconnected');

  // Function to get sensor data from ESP32
  const updateSensorData = async () => {
    setConnectionStatus('connecting');
    const data = await getSensorData();

    if (data) {
      setConnectionStatus('connected');
      if (data.moisture !== undefined) setMoisture(data.moisture);
      if (data.temperature !== undefined) setTemperature(data.temperature);
      if (data.loadCell !== undefined) setLoadCell(data.loadCell);
    } else {
      setConnectionStatus('disconnected');
      if (!autoUpdate) {
        Alert.alert(
          'Connection Error',
          'Failed to connect to the ESP32. Please check if the device is powered on and connected to WiFi.',
          [{ text: 'OK' }]
        );
      }
    }
  };

  // Toggle auto update
  useEffect(() => {
    if (autoUpdate) {
      const id = setInterval(updateSensorData, 3000);
      setIntervalId(id);
    } else {
      if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
      }
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [autoUpdate]);

  // Initial load
  useEffect(() => {
    updateSensorData();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.sensorCardsContainer}>
        <SensorCard title="Moisture" value={moisture.toFixed(1)} unit="%" />
        <SensorCard
          title="Temperature"
          value={temperature.toFixed(1)}
          unit="°C"
        />
        <SensorCard title="Load Cell" value={Math.round(loadCell)} unit="kg" />
      </View>

      <View style={styles.connectionContainer}>
        <Text style={styles.connectionLabel}>ESP32 Connection:</Text>
        <View style={styles.connectionIndicator}>
          <View
            style={[
              styles.connectionDot,
              connectionStatus === 'connected'
                ? styles.connectedDot
                : connectionStatus === 'connecting'
                ? styles.connectingDot
                : styles.disconnectedDot,
            ]}
          />
          <Text style={styles.connectionText}>{connectionStatus}</Text>
        </View>
      </View>

      <View style={styles.graphContainer}>
        <Text style={styles.graphTitle}>Weight vs Time</Text>
        <View style={styles.graphPlaceholder}>
          <Text style={styles.placeholderText}>Live Graph Visualization</Text>
          <Text style={styles.placeholderSubtext}>
            Data updates {autoUpdate ? 'automatically' : 'on refresh'}
          </Text>
        </View>
      </View>

      <View style={styles.controlsContainer}>
        <Pressable
          style={styles.refreshButton}
          onPress={updateSensorData}
          disabled={autoUpdate}
        >
          <RefreshCw
            size={24}
            color={autoUpdate ? COLORS.mediumGray : COLORS.darkGray}
            style={autoUpdate ? styles.disabledIcon : {}}
          />
          <Text style={[styles.refreshText, autoUpdate && styles.disabledText]}>
            Refresh
          </Text>
        </Pressable>

        <View style={styles.autoUpdateContainer}>
          <Text style={styles.autoUpdateText}>Auto Update</Text>
          <Switch
            value={autoUpdate}
            onValueChange={setAutoUpdate}
            trackColor={{
              false: COLORS.mediumGray,
              true: COLORS.primaryYellow,
            }}
            thumbColor={COLORS.white}
          />
        </View>
      </View>

      <PrimaryButton
        title="Refresh"
        onPress={updateSensorData}
        disabled={autoUpdate}
        style={styles.refreshButtonLarge}
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
  sensorCardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  connectionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  connectionLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.darkGray,
    marginRight: 8,
  },
  connectionIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectionDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  connectedDot: {
    backgroundColor: COLORS.success,
  },
  disconnectedDot: {
    backgroundColor: COLORS.error,
  },
  connectingDot: {
    backgroundColor: COLORS.warning,
  },
  connectionText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.darkGray,
  },
  graphContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.mediumGray,
  },
  graphTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: COLORS.darkGray,
    marginBottom: 8,
  },
  graphPlaceholder: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    borderRadius: 4,
  },
  placeholderText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: COLORS.darkGray,
  },
  placeholderSubtext: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.darkGray,
    marginTop: 8,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  refreshText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: COLORS.darkGray,
    marginLeft: 8,
  },
  disabledText: {
    color: COLORS.mediumGray,
  },
  disabledIcon: {
    opacity: 0.5,
  },
  autoUpdateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  autoUpdateText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: COLORS.darkGray,
    marginRight: 8,
  },
  refreshButtonLarge: {
    backgroundColor: COLORS.primaryYellow,
  },
});
