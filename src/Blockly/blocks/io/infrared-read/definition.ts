import {
  BLOCK_COLOR_CODES,
  BlockCategory,
  BlockType,
} from 'App/Lib/Blockly/types';
import { BlockDefinition } from 'blockly/core/blocks';

const definition = (blockly: BlockDefinition) => {
  blockly.Blocks[BlockType.INFRARED_READ] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Infrared sensor')
        .appendField(
          new blockly.FieldDropdown([
            ['IRPin1', 'IRPin1'],
            ['IRPin2', 'IRPin2'],
          ]),
          'PIN_NUMBER',
        );

      this.setColour(BLOCK_COLOR_CODES[BlockCategory.IO]);
      this.setTooltip('Infrared sensor: read pin value');
      this.setOutput(true, 'Number');
    },
  };
};

export default definition;
