import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import Reanimated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { COLORS } from '@/constants/Colors';

interface CustomSliderProps {
  name: string;
  minValue: number;
  maxValue: number;
  initialValue: number;
  value?: number;
  onValueChange: (value: number) => void;
}

const CustomSlider = ({
  name,
  minValue,
  maxValue,
  initialValue,
  value,
  onValueChange,
}: CustomSliderProps) => {
  const [sliderWidth, setSliderWidth] = useState(0);
  const initialPosition =
    ((initialValue - minValue) / (maxValue - minValue)) * 100;
  const position = useSharedValue(initialPosition);
  const [displayValue, setDisplayValue] = useState(initialValue);

  // Add this useEffect after your existing state declarations
  React.useEffect(() => {
    // Only update if value prop is provided and different from current display value
    if (value !== undefined && value !== displayValue) {
      // Calculate the new position percentage
      const newPosition = ((value - minValue) / (maxValue - minValue)) * 100;
      // Update both the animated position and the display value
      position.value = newPosition;
      setDisplayValue(value);
    }
  }, [value, minValue, maxValue]);

  const calculateValue = (pos: number) => {
    const percentage = pos / 100;
    const calculatedValue = minValue + percentage * (maxValue - minValue);
    return Math.round(calculatedValue);
  };

  const updateDisplayValue = (pos: number) => {
    const newValue = calculateValue(pos);
    setDisplayValue(newValue);
    onValueChange(newValue);
  };

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx: any) => {
      ctx.startX = position.value;
    },
    onActive: (event, ctx) => {
      const newPosition = ctx.startX + (event.translationX / sliderWidth) * 100;
      position.value = Math.min(Math.max(newPosition, 0), 100);
      runOnJS(updateDisplayValue)(position.value);
    },
    onEnd: () => {
      position.value = withSpring(position.value);
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      left: `${position.value}%`,
    };
  });

  const progressStyle = useAnimatedStyle(() => {
    return {
      width: `${position.value}%`,
    };
  });

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>{name}</Text>
        <Text style={styles.valueLabel}>{displayValue}%</Text>
      </View>
      <View
        style={styles.sliderContainer}
        onLayout={(event) => setSliderWidth(event.nativeEvent.layout.width)}
      >
        <Reanimated.View style={[styles.progressBar, progressStyle]} />
        <PanGestureHandler onGestureEvent={gestureHandler}>
          <Reanimated.View style={[styles.thumb, animatedStyle]}>
            <View style={styles.thumbInner} />
          </Reanimated.View>
        </PanGestureHandler>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 24,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: COLORS.darkGray,
  },
  valueLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.darkGray,
  },
  sliderContainer: {
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.mediumGray,
    position: 'relative',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primaryYellow,
    borderRadius: 8,
    position: 'absolute',
  },
  thumb: {
    position: 'absolute',
    top: -6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    transform: [{ translateX: -14 }],
  },
  thumbInner: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.primaryYellow,
  },
});

export default CustomSlider;
