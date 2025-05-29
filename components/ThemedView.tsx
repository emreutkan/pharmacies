import { View, type ViewProps } from 'react-native';
import { useAppTheme } from '@/theme/ThemeProvider';

export type ThemedViewProps = ViewProps & {
  variant?: 'default' | 'card' | 'surface' | 'primary';
  withShadow?: boolean;
};

export function ThemedView({
  style,
  variant = 'default',
  withShadow = false,
  ...otherProps
}: ThemedViewProps) {
  const { theme } = useAppTheme();

  // Get background color based on variant
  const getBackgroundColor = () => {
    switch (variant) {
      case 'surface':
        return theme.colors.surface;
      case 'card':
        return theme.colors.background;
      case 'primary':
        return theme.colors.primary;
      case 'default':
      default:
        return theme.colors.background;
    }
  };

  // Generate shadow styles if needed
  const getShadowStyle = () => {
    if (!withShadow) return {};

    return {
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    };
  };

  return (
    <View
      style={[
        { backgroundColor: getBackgroundColor() },
        getShadowStyle(),
        style
      ]}
      {...otherProps}
    />
  );
}
