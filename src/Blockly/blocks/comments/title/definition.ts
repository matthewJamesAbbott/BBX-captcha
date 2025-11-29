import {
  BLOCK_COLOR_CODES,
  BlockCategory,
  BlockType,
} from 'App/Lib/Blockly/types';
import { BlockDefinition } from 'blockly/core/blocks';

const definition = (blocks: BlockDefinition) => {
  blocks.Blocks[BlockType.TITLE] = {
    init: function () {
      this.appendDummyInput()
        .appendField('title block comment')
        .appendField(new blocks.FieldTextInput('add title here'), 'NAME');
      this.setColour(BLOCK_COLOR_CODES[BlockCategory.COMMENT]);
      this.setTooltip('Add program title');
    },
  };
};

export default definition;
