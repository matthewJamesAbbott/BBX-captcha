import {
  BLOCK_COLOR_CODES,
  BlockCategory,
  BlockType,
} from 'App/Lib/Blockly/types';
import { BlockDefinition } from 'blockly/core/blocks';
import { PIN_NUMBER_OPTIONS } from '../pin';

const definition = (blockly: BlockDefinition) => {
  blockly.Blocks[BlockType.INFRARED_SETUP] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Infrared sensor : pin 1')
        .appendField(new blockly.FieldDropdown(PIN_NUMBER_OPTIONS), 'IR_PIN_1')
        .appendField('pin 2')
        .appendField(new blockly.FieldDropdown(PIN_NUMBER_OPTIONS), 'IR_PIN_2');

      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(BLOCK_COLOR_CODES[BlockCategory.IO]);
      this.setTooltip('Infrared PIN setup');
    },
  };
};

export default definition;
