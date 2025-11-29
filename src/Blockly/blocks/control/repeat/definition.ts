// src/Blockly/blocks/control/repeat/definition.ts
import { BLOCK_COLOR_CODES, BlockCategory, BlockType } from 'App/Lib/Blockly/types';
import Blockly from 'blockly/core';

const definition = (_blocks: any) => {
  Blockly.Blocks[BlockType.REPEAT] = {
    init: function () {
      this.appendDummyInput()
        .appendField('repeat')
        .appendField(new Blockly.FieldNumber(10, 1, 20), 'TIMES')
        .appendField('times');

      this.appendStatementInput('CODE_VALUE').setCheck(null);

      // ⬇️ removed the FieldImage that caused the broken icon
      // this.appendDummyInput()
      //   .setAlign(Blockly.ALIGN_RIGHT)
      //   .appendField(new Blockly.FieldImage(loopIcon, 15, 15, 'loop'));

      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(BLOCK_COLOR_CODES[BlockCategory.CONTROL]);
      this.setTooltip('repeat a single or group of blocks');
    },
  };
};

export default definition;
