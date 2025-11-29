import Blockly from 'blockly/core';
import {
  BlockStyle,
  ComponentStyle,
  FontStyle,
  ITheme,
} from 'blockly/core/theme';

interface IBlockStyle {
  [key: string]: Partial<BlockStyle>;
}
const blockStyles: IBlockStyle = {
  variable_blocks: {
    colourPrimary: '#FF00FF',
    colourSecondary: '#EEEEEE',
    colourTertiary: '#F5F5F5',
  },
  logic_blocks: {
    colourPrimary: '#FF8000',
    colourSecondary: '#F99B7D',
    colourTertiary: '#BF6001',
  },
};

const categoryStyles = {};

const componentStyles: ComponentStyle = {
  toolboxBackgroundColour: '#f9f9f9',
  flyoutBackgroundColour: '#f9f9f9', // blocks list background color
  scrollbarColour: '#D9D9D9',
  insertionMarkerColour: '#fff',
  insertionMarkerOpacity: 0.3,
  scrollbarOpacity: 0.4,
  cursorColour: '#d0d0d0',
};

// Block font styles
const fontStyle: FontStyle = {
  family: 'Open Sans',
  weight: '400',
  size: 14,
};

const theme: ITheme = {
  base: Blockly.Themes.Classic,
  blockStyles,
  categoryStyles,
  componentStyles,
  fontStyle,
  startHats: undefined,
  name: 'bugbox',
};

export default Blockly.Theme.defineTheme('bugbox', theme);
