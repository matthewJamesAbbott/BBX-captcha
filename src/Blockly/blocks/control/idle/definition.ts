import {
  BLOCK_COLOR_CODES,
  BlockCategory,
  BlockType,
} from 'App/Lib/Blockly/types';
import { BlockDefinition } from 'blockly/core/blocks';

const definition = (blocks: BlockDefinition) => {
  blocks.Blocks[BlockType.IDLE_FOREVER] = {
    init: function () {
      this.appendDummyInput().appendField('idle forever');
      this.setPreviousStatement(true, null);
      this.setNextStatement(false, null);
      this.setColour(BLOCK_COLOR_CODES[BlockCategory.CONTROL]);
      this.setTooltip('goes into an forever idle loop');
    },
  };
};

export default definition;
