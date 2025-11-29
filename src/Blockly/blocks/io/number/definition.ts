import {
  BLOCK_COLOR_CODES,
  BlockCategory,
  BlockType,
} from 'App/Lib/Blockly/types';
import { BlockDefinition } from 'blockly/core/blocks';

const definition = (blockly: BlockDefinition) => {
  blockly.Blocks[BlockType.NUMBER] = {
    init: function () {
      this.appendDummyInput()
        .appendField('number')
        .appendField(new blockly.FieldNumber(), 'NUM_VALUE');

      this.setColour(BLOCK_COLOR_CODES[BlockCategory.IO]);
      this.setTooltip('Assign any number');
      this.setOutput(true, 'Number');
    },
  };
};

export default definition;
