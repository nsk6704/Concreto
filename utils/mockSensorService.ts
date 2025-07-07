import { useEffect, useState } from 'react';

// Set default values and ranges for the simulated sensors
const DEFAULT_VALUES = {
  moisture: 12,
  temperature: 32,
  loadCell: 55,
};

const RANGES = {
  moisture: { min: 8, max: 18, step: 0.1 },
  temperature: { min: 22, max: 38, step: 0.1 },
  loadCell: { min: 40, max: 70, step: 0.5 },
};

// Helper to generate random values within a range
const getRandomValue = (min: number, max: number, step: number) => {
  return Math.round((Math.random() * (max - min) + min) / step) * step;
};

// Simulate gradual changes in sensor values (more realistic)
const getNextValue = (
  current: number,
  range: { min: number; max: number; step: number }
) => {
  // Add some random drift to the current value (within ±2 steps)
  const drift = (Math.random() - 0.5) * 4 * range.step;
  let next = current + drift;

  // Ensure we stay within min/max bounds
  if (next < range.min) next = range.min;
  if (next > range.max) next = range.max;

  return Number(next.toFixed(1));
};

// Main hook for using mock sensor data
export function useMockSensorData(updateInterval = 2000) {
  const [sensorData, setSensorData] = useState({
    moisture: DEFAULT_VALUES.moisture,
    temperature: DEFAULT_VALUES.temperature,
    loadCell: DEFAULT_VALUES.loadCell,
    isMixing: false,
  });

  useEffect(() => {
    // Update sensor values at regular intervals
    const intervalId = setInterval(() => {
      setSensorData((prevData) => ({
        moisture: getNextValue(prevData.moisture, RANGES.moisture),
        temperature: getNextValue(prevData.temperature, RANGES.temperature),
        loadCell: getNextValue(prevData.loadCell, RANGES.loadCell),
        isMixing: prevData.isMixing,
      }));
    }, updateInterval);

    return () => clearInterval(intervalId);
  }, [updateInterval]);

  // Function to start mixing simulation
  const startMixing = () => {
    setSensorData((prev) => ({ ...prev, isMixing: true }));
    return true;
  };

  // Function to stop mixing simulation
  const stopMixing = () => {
    setSensorData((prev) => ({ ...prev, isMixing: false }));
    return true;
  };

  return {
    sensorData,
    startMixing,
    stopMixing,
  };
}

// Alternative for components that can't use hooks
export const MockSensorAPI = {
  getSensorData: async () => {
    return {
      moisture: getNextValue(DEFAULT_VALUES.moisture, RANGES.moisture),
      temperature: getNextValue(DEFAULT_VALUES.temperature, RANGES.temperature),
      loadCell: getNextValue(DEFAULT_VALUES.loadCell, RANGES.loadCell),
      isMixing: false,
    };
  },

  sendCommand: async (command: string): Promise<boolean> => {
    console.log(`Mock command sent: ${command}`);
    return true;
  },
};
