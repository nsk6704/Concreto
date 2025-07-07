import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { COLORS } from '@/constants/Colors';
import PrimaryButton from '@/components/PrimaryButton';
import ProgressBar from '@/components/ProgressBar';
import { Play, Square } from 'lucide-react-native';
import { sendCommand, getSensorData } from '@/utils/esp32Api';

export default function MixerScreen() {
  const [isMixing, setIsMixing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<
    'connected' | 'disconnected' | 'connecting'
  >('disconnected');

  const handleStartMixing = async () => {
    if (isMixing) return;

    setConnectionStatus('connecting');

    // Send command to ESP32
    const success = await sendCommand('START_MIXING');

    if (success) {
      setConnectionStatus('connected');
      setIsMixing(true);
      setProgress(0);

      const id = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(id);
            setIntervalId(null);
            setIsMixing(false);
            // Send stop command when complete
            sendCommand('STOP_MIXING');
            return 100;
          }
          return prev + 1;
        });
      }, 300);

      setIntervalId(id);
    } else {
      setConnectionStatus('disconnected');
      Alert.alert(
        'Connection Error',
        'Failed to connect to the mixer. Please check if the device is powered on and connected to WiFi.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleStopMixing = async () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }

    // Send command to ESP32
    await sendCommand('STOP_MIXING');

    setIsMixing(false);
  };

  useEffect(() => {
    // Test connection when component mounts
    const testConnection = async () => {
      setConnectionStatus('connecting');
      const success = await sendCommand('PING');
      setConnectionStatus(success ? 'connected' : 'disconnected');
    };

    testConnection();

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <Text style={styles.title}>Status:</Text>
          <View style={styles.statusIndicator}>
            <View
              style={[
                styles.statusDot,
                isMixing ? styles.activeStatus : styles.inactiveStatus,
              ]}
            />
            <Text style={styles.statusText}>
              {isMixing ? 'Mixing' : 'Idle'}
            </Text>
          </View>
        </View>

        <View style={styles.connectionStatus}>
          <Text style={styles.connectionLabel}>Mixer Connection:</Text>
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

        <View style={styles.progressContainer}>
          <ProgressBar progress={progress} height={16} />
        </View>

        <PrimaryButton
          title={isMixing ? 'Stop' : 'Start Mixing'}
          onPress={isMixing ? handleStopMixing : handleStartMixing}
          style={isMixing ? styles.stopButton : styles.startButton}
          textStyle={isMixing ? styles.stopButtonText : styles.startButtonText}
          variant={isMixing ? 'outline' : 'primary'}
          disabled={connectionStatus === 'connecting'}
        />

        <View style={styles.iconContainer}>
          {isMixing ? (
            <Square size={20} color={COLORS.darkGray} />
          ) : (
            <Play size={20} color={COLORS.darkGray} />
          )}
          <Text style={styles.buttonLabel}>
            {isMixing ? 'Stop' : 'Start Mixing'}
          </Text>
        </View>

        {!isMixing && (
          <Text style={styles.infoText}>
            Press the button above to start the mixing process.
          </Text>
        )}

        {isMixing && progress < 100 && (
          <Text style={styles.infoText}>
            Mixing in progress. Press Stop to interrupt the process.
          </Text>
        )}

        {isMixing && progress >= 100 && (
          <Text style={styles.infoText}>
            Mixing complete! You can now proceed to the next step.
          </Text>
        )}

        {connectionStatus === 'disconnected' && (
          <Text style={styles.errorText}>
            Device offline. Check if the mixer is powered on and connected to
            WiFi.
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
    padding: 16,
  },
  statusCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
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
  title: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: COLORS.darkGray,
    marginRight: 8,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  activeStatus: {
    backgroundColor: COLORS.primaryYellow,
  },
  inactiveStatus: {
    backgroundColor: COLORS.mediumGray,
  },
  progressContainer: {
    marginBottom: 24,
  },
  startButton: {
    backgroundColor: COLORS.primaryYellow,
    marginBottom: 16,
  },
  stopButton: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.error,
    marginBottom: 16,
  },
  startButtonText: {
    color: COLORS.darkGray,
  },
  stopButtonText: {
    color: COLORS.error,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  buttonLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: COLORS.darkGray,
    marginLeft: 8,
  },
  infoText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: 'center',
    marginTop: 8,
  },
  errorText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.error,
    textAlign: 'center',
    marginTop: 16,
  },
});
