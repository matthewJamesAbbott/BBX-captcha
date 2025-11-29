import toolbox from './toolbox';
import { BlocklyOptions, ZoomOptions } from 'blockly/core/blockly_options';
import theme from './theme';
import { BlockType } from './types';

const zoom: ZoomOptions = {
  controls: true,
};
export const defaultOptions: BlocklyOptions = {
  toolbox,
  trashcan: false,
  zoom,
  readOnly: false,
  move: {
    scrollbars: {
      vertical: true,
      horizontal: true,
    },
    wheel: true,
    drag: true,
  },
  renderer: 'snowball',
  theme,
  media: 'media',
  maxInstances: {
    [BlockType.ULTRASONIC_PIN]: 1,
    [BlockType.INFRARED_SETUP]: 1,
  },
};
