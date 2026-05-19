/**
 * Centralized Theme Colors Configuration
 * Separate themes for User and Vendor modules
 * Update colors here to change theme across entire app
 * 
 * Usage:
 * - User module: import { userTheme } from '../../../../theme'
 * - Vendor module: import { vendorTheme } from '../../../../theme'
 * - Worker module: import { workerTheme } from '../../../../theme'
 */

// Homestr LOGO Core Brand Colors
const brand = {
  teal: '#cfdc01',
  yellow: '#b6c200',
  orange: '#a2ad02',
  gradient: 'linear-gradient(135deg, #cfdc01 0%, #b6c200 50%, #cfdc01 100%)',
  conic: 'conic-gradient(from 0deg, #cfdc01, #b6c200, #cfdc01)'
};

// User Theme Colors
const userTheme = {
  backgroundGradient: 'linear-gradient(180deg, #fbfde8 0%, #fbfde8 15%, #FFFFFF 30%)',
  gradient: brand.gradient,
  headerGradient: 'linear-gradient(180deg, rgba(213, 222, 35, 1) 0%, rgba(220, 230, 64, 1) 41%, rgba(227, 236, 114, 1) 69%)',
  headerBg: '#fbfde8',
  button: brand.teal,
  primary: brand.teal,
  icon: '#0f172a',
  cardShadow: '0 8px 16px -2px rgba(207, 220, 1, 0.15), 0 4px 8px -1px rgba(207, 220, 1, 0.1)',
  cardBorder: '1px solid rgba(207, 220, 1, 0.15)',
  brand: brand
};

// Vendor Theme Colors
const vendorTheme = {
  backgroundGradient: 'linear-gradient(to bottom, rgba(207, 220, 1, 0.03) 0%, rgba(207, 220, 1, 0.02) 10%, #ffffff 20%)',
  gradient: brand.gradient,
  headerGradient: brand.teal,
  button: brand.teal,
  primary: brand.teal,
  icon: '#0f172a',
  brand: brand
};

// Worker Theme Colors
const workerTheme = {
  backgroundGradient: 'linear-gradient(to bottom, rgba(207, 220, 1, 0.03) 0%, rgba(207, 220, 1, 0.02) 10%, #ffffff 20%)',
  gradient: brand.gradient,
  headerGradient: brand.teal,
  button: brand.teal,
  primary: brand.teal,
  icon: '#0f172a',
  brand: brand
};

// Default theme (for backward compatibility)
const themeColors = userTheme;

// Export all themes
export { userTheme, vendorTheme, workerTheme, brand };
export default themeColors;


