import { DefaultTheme } from '@react-navigation/native';
import {
  border,
  ink,
  paper,
  pilgrimOrange,
  pilgrimOrangeDeep,
  white,
} from './pilgrimColors';

/** Forces nav-linked text/tints to brand colors (avoids host / default primary greens). */
export const pilgrimNavigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: pilgrimOrangeDeep,
    background: paper,
    card: white,
    text: ink,
    border,
    notification: pilgrimOrange,
  },
};
