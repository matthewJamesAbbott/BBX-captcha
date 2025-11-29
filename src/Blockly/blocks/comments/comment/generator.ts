import { BlockType } from 'App/Lib/Blockly/types';
import Blockly from 'blockly';
import { BlockDefinition } from 'blockly/core/blocks';

const generator = (blocks: BlockDefinition) => {
  blocks[BlockType.COMMENT] = function (block: Blockly.Block) {
    const value = block.getFieldValue('NAME');
    const code = `// ${value}\n`;

    return code;
  };
};

export default generator;
