import {
  BLOCK_COLOR_CODES,
  BlockCategory,
  BlockType,
} from 'App/Lib/Blockly/types';
import { BlockDefinition } from 'blockly/core/blocks';
import { PIN_NUMBER_OPTIONS } from '../pin';

const definition = (blockly: BlockDefinition) => {
  blockly.Blocks[BlockType.ULTRASONIC_PIN] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Ultrasonic sensor : trig pin')
        .appendField(new blockly.FieldDropdown(PIN_NUMBER_OPTIONS), 'TRIG_PIN')
        .appendField('echo pin')
        .appendField(new blockly.FieldDropdown(PIN_NUMBER_OPTIONS), 'ECHO_PIN');

      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(BLOCK_COLOR_CODES[BlockCategory.IO]);
      this.setTooltip(
        'Input Pin (Trigger) and Output Pin (Echo) of the the Ultrasonic Rangefinder',
      );
    },
  };
};

export default definition;
