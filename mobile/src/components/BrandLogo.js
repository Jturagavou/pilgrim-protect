import React from 'react';
import { Image, StyleSheet } from 'react-native';

const logo = require('../../assets/pilgrim-africa-logo-dark.png');

export default function BrandLogo({ width = 260, style }) {
  return (
    <Image
      source={logo}
      style={[styles.logo, { width, height: width * 0.179 }, style]}
      resizeMode="contain"
      accessible
      accessibilityLabel="Pilgrim Africa"
    />
  );
}

const styles = StyleSheet.create({
  logo: {
    maxWidth: '100%',
  },
});
