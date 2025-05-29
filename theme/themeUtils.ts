import { StyleSheet } from 'react-native';
import { AppTheme } from './ThemeProvider';

// Helper function to create themed styles
export const createThemedStyles = <T extends StyleSheet.NamedStyles<T>>(
  styleFunction: (theme: AppTheme) => T
) => {
  return (theme: AppTheme) => StyleSheet.create(styleFunction(theme));
};

// Common style patterns that can be reused across components
export const createCommonStyles = (theme: AppTheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginVertical: theme.spacing.sm,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spaceBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
    fontFamily: theme.typography.body.fontFamily,
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text.primary,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  button: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    ...theme.typography.button,
    color: theme.colors.text.inverse,
  },
  heading: {
    ...theme.typography.h2,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  subheading: {
    ...theme.typography.h3,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  text: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
  },
  smallText: {
    ...theme.typography.bodySmall,
    color: theme.colors.text.secondary,
  },
});
