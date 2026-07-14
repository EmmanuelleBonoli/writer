import { Colors } from '@/constants/theme';
import { useAppColorScheme } from '@/hooks/use-app-color-scheme';

export function useTheme() {
  const scheme = useAppColorScheme();
  return Colors[scheme];
}
