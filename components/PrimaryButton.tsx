import React from 'react';
import { Text, StyleSheet, Pressable, ViewStyle, TextStyle } from 'react-native';
import { COLORS } from '@/constants/Colors';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
}

const PrimaryButton = ({
  title,
  onPress,
  style,
  textStyle,
  disabled = false,
  variant = 'primary',
}: PrimaryButtonProps) => {
  const getButtonStyle = () => {
    if (disabled) return [styles.button, styles.disabledButton, style];
    
    switch (variant) {
      case 'secondary':
        return [styles.button, styles.secondaryButton, style];
      case 'outline':
        return [styles.button, styles.outlineButton, style];
      default:
        return [styles.button, styles.primaryButton, style];
    }
  };

  const getTextStyle = () => {
    if (disabled) return [styles.buttonText, styles.disabledText, textStyle];
    
    switch (variant) {
      case 'outline':
        return [styles.buttonText, styles.outlineText, textStyle];
      default:
        return [styles.buttonText, textStyle];
    }
  };

  return (
    <Pressable
      style={({ pressed }) => [
        getButtonStyle(),
        pressed && !disabled && styles.pressed,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={getTextStyle()}>{title}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  primaryButton: {
    backgroundColor: COLORS.primaryYellow,
  },
  secondaryButton: {
    backgroundColor: COLORS.mediumGray,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.darkGray,
  },
  disabledButton: {
    backgroundColor: COLORS.mediumGray,
    opacity: 0.5,
  },
  buttonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: COLORS.darkGray,
  },
  outlineText: {
    color: COLORS.darkGray,
  },
  disabledText: {
    color: COLORS.darkGray,
    opacity: 0.7,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});

export default PrimaryButton;