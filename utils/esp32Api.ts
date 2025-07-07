/**
 * ESP32 communication module for concrete mixer app
 */
import { MockSensorAPI } from './mockSensorService';

// Change this to your ESP32's IP address on your local network
const ESP32_IP = '10.110.169.22';
const ESP32_PORT = 80;
const BASE_URL = `http://${ESP32_IP}:${ESP32_PORT}`;

// Set to true to use mock data, false to try connecting to actual ESP32
const USE_MOCK_DATA = true;

/**
 * Sends a command to the ESP32
 */
export async function sendCommand(command: string): Promise<boolean> {
  if (USE_MOCK_DATA) {
    return MockSensorAPI.sendCommand(command);
  }

  try {
    console.log(`Sending command to ESP32: ${command}`);
    const response = await fetch(`${BASE_URL}/command?cmd=${command}`, {
      method: 'GET',
    });

    if (!response.ok) {
      console.error('Failed to send command to ESP32:', response.statusText);
      return false;
    }

    const data = await response.text();
    console.log('ESP32 response:', data);
    return true;
  } catch (error) {
    console.error('Error communicating with ESP32:', error);
    return false;
  }
}

/**
 * Gets sensor data from the ESP32
 */
export async function getSensorData(): Promise<{
  moisture?: number;
  temperature?: number;
  loadCell?: number;
  isMixing?: boolean;
} | null> {
  if (USE_MOCK_DATA) {
    return MockSensorAPI.getSensorData();
  }

  try {
    const response = await fetch(`${BASE_URL}/sensors`);

    if (!response.ok) {
      console.error('Failed to get sensor data:', response.statusText);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting sensor data:', error);
    return null;
  }
}
