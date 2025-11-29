import {
  BLOCK_COLOR_CODES,
  BlockCategory,
  BlockType,
} from '@App/Lib/Blockly/types';
import { BlockDefinition } from 'blockly/core/blocks';

const definition = (blocks: BlockDefinition) => {
  blocks.Blocks[BlockType.COMMENT] = {
    init: function () {
      this.appendDummyInput()
        .appendField('comment')
        .appendField(new blocks.FieldTextInput('add comment here'), 'NAME');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(BLOCK_COLOR_CODES[BlockCategory.COMMENT]);
      this.setTooltip('Add a comment');
    },
  };
};

export default definition;
