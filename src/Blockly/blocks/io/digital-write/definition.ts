import {
  BLOCK_COLOR_CODES,
  BlockCategory,
  BlockType,
} from 'App/Lib/Blockly/types';
import { BlockDefinition } from 'blockly/core/blocks';
import { PIN_NUMBER_OPTIONS } from '../pin';

const definition = (blockly: BlockDefinition) => {
  blockly.Blocks[BlockType.DIGITAL_WRITE] = {
    init: function () {
      this.appendDummyInput()
        .appendField('set pin')
        .appendField(new blockly.FieldDropdown(PIN_NUMBER_OPTIONS), 'PIN_VALUE')
        .appendField('to')
        .appendField(
          new blockly.FieldDropdown([
            ['LOW', 'low'],
            ['HIGH', 'high'],
          ]),
          'PIN_STATE',
        );
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(BLOCK_COLOR_CODES[BlockCategory.IO]);
      this.setTooltip('Set pin value using predefined values');
    },
  };
};

export default definition;
