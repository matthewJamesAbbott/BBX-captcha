import {
  BLOCK_COLOR_CODES,
  BlockCategory,
  BlockType,
} from 'App/Lib/Blockly/types';
import { BlockDefinition } from 'blockly/core/blocks';

const definition = (blocks: BlockDefinition) => {
  blocks.Blocks[BlockType.IF_DO] = {
    init: function () {
      this.appendValueInput('IF').setCheck('Boolean').appendField('if');

      this.appendStatementInput('DO').appendField('then ');

      this.setInputsInline(false);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(BLOCK_COLOR_CODES[BlockCategory.CONTROL]);
      this.setTooltip('if conditional');
    },
  };
};

export default definition;
