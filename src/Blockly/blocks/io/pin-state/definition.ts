import {
  BLOCK_COLOR_CODES,
  BlockCategory,
  BlockType,
} from 'App/Lib/Blockly/types';
import { BlockDefinition } from 'blockly/core/blocks';
import Blockly from 'blockly/core';

const definition = (blockly: BlockDefinition) => {
  blockly.Blocks[BlockType.PIN_STATE] = {
    init: function () {
      this.appendDummyInput()
        .appendField('pin state')
        .appendField(
          new Blockly.FieldDropdown([
            ['Low', 'LOW'],
            ['High', 'HIGH'],
          ]),
          'PIN_STATE',
        );

      this.setColour(BLOCK_COLOR_CODES[BlockCategory.IO]);
      this.setTooltip('Digital pin current state');
      this.setOutput(true, 'Boolean');
    },
  };
};

export default definition;
