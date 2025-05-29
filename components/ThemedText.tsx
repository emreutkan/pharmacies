import { StyleSheet, Text, type TextProps } from 'react-native';
import { useAppTheme } from '@/theme/ThemeProvider';

export type ThemedTextProps = TextProps & {
  type?: 'body' | 'bodySmall' | 'h1' | 'h2' | 'h3' | 'subtitle' | 'caption' | 'button';
  color?: 'primary' | 'secondary' | 'tertiary' | 'inverse';
};

export function ThemedText({
  style,
  type = 'body',
  color = 'primary',
  ...rest
}: ThemedTextProps) {
  const { theme } = useAppTheme();
  
  // Get the typography style based on the type prop
  const getTypographyStyle = () => {
    switch (type) {
      case 'h1':
        return theme.typography.h1;
      case 'h2':
        return theme.typography.h2;
      case 'h3':
        return theme.typography.h3;
      case 'subtitle':
        return theme.typography.subtitle;
      case 'bodySmall':
        return theme.typography.bodySmall;
      case 'caption':
        return theme.typography.caption;
      case 'button':
        return theme.typography.button;
      case 'body':
      default:
        return theme.typography.body;
    }
  };
  
  // Get the text color based on the color prop
  const getTextColor = () => {
    switch (color) {
      case 'secondary':
        return theme.colors.text.secondary;
      case 'tertiary':
        return theme.colors.text.tertiary;
      case 'inverse':
        return theme.colors.text.inverse;
      case 'primary':
      default:
        return theme.colors.text.primary;
    }
  };

  return (
    <Text
      style={[
        getTypographyStyle(),
        { color: getTextColor() },
        style,
      ]}
      {...rest}
    />
  );
}

