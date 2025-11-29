// src/Blockly/toolbox.ts
import { BlockType } from './types';
import { ToolboxDefinition } from 'blockly/core/utils/toolbox';

const toolbox: ToolboxDefinition = {
  kind: 'flyoutToolbox',
  contents: [
    // Control
    { kind: 'block', type: BlockType.WAIT },
    { kind: 'block', type: BlockType.REPEAT },
    { kind: 'block', type: BlockType.IDLE_FOREVER },

    // Pins
    { kind: 'block', type: BlockType.DIGITAL_WRITE },
    { kind: 'block', type: BlockType.ANALOG_WRITE },
  ],
};

export default toolbox;
