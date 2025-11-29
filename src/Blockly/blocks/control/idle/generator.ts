import { BlockType } from 'App/Lib/Blockly/types';
import { BlockDefinition } from 'blockly/core/blocks';

const generator = (blocks: BlockDefinition) => {
  blocks[BlockType.IDLE_FOREVER] = function () {
    const code = `while(1) {} // loop forever \n`;
    return code;
  };
};

export default generator;
