import {
  BLOCK_COLOR_CODES,
  BlockCategory,
  BlockType,
} from 'App/Lib/Blockly/types';
import { BlockDefinition } from 'blockly/core/blocks';

const definition = (blockly: BlockDefinition) => {
  blockly.Blocks[BlockType.ULTRASONIC_DISTANCE] = {
    init: function () {
      this.appendDummyInput().appendField(
        'Ultrasonic sensor: compute distance',
      );

      this.setOutput(true, 'Number');
      this.setColour(BLOCK_COLOR_CODES[BlockCategory.IO]);
      this.setTooltip('Compute distance using ultrasonic sensor');
    },
  };
};

export default definition;
