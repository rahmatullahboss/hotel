// Custom hook that uses our ThemeContext instead of system color scheme
import { useTheme } from '@/context/ThemeContext';

export function useColorScheme(): 'light' | 'dark' {
    const { theme } = useTheme();
    return theme;
}
