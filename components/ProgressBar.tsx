import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Reanimated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  Easing
} from 'react-native-reanimated';
import { COLORS } from '@/constants/Colors';

interface ProgressBarProps {
  progress: number; // 0-100
  showPercentage?: boolean;
  height?: number;
  animationDuration?: number;
}

const ProgressBar = ({ 
  progress, 
  showPercentage = true, 
  height = 20,
  animationDuration = 500
}: ProgressBarProps) => {
  const widthAnim = useSharedValue(0);

  useEffect(() => {
    widthAnim.value = withTiming(progress, {
      duration: animationDuration,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, [progress, animationDuration]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: `${widthAnim.value}%`,
    };
  });

  return (
    <View style={styles.container}>
      <View style={[styles.progressContainer, { height }]}>
        <Reanimated.View 
          style={[
            styles.progressBar,
            animatedStyle
          ]} 
        />
      </View>
      {showPercentage && (
        <Text style={styles.percentageText}>{Math.round(progress)}%</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 8,
  },
  progressContainer: {
    backgroundColor: COLORS.mediumGray,
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primaryYellow,
    borderRadius: 10,
  },
  percentageText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.darkGray,
    marginTop: 4,
    textAlign: 'center',
  },
});

export default ProgressBar;