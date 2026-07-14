import { StyleSheet, Text, View } from 'react-native';

import { Fonts } from '@/constants/theme';

interface AppLogoProps {
  size?: number;
}

const LOGO_BACKGROUND = '#2B2440';

/** Badge de marque : monogramme dans un carré arrondi, affiché dans le header. */
export function AppLogo({ size = 40 }: AppLogoProps) {
  return (
    <View style={[styles.badge, { width: size, height: size, borderRadius: size / 3 }]}>
      <Text style={[styles.mark, { fontSize: size * 0.5 }]}>W</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: LOGO_BACKGROUND,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  mark: {
    color: '#ffffff',
    fontFamily: Fonts.serif,
    fontWeight: '700',
  },
});
