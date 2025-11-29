import { inoGenerator } from 'App/Lib/Blockly/inogen';
import { BlockType } from 'App/Lib/Blockly/types';
import Blockly from 'blockly';
import { BlockDefinition } from 'blockly/core/blocks';

const generator = (blocks: BlockDefinition) => {
  blocks[BlockType.TITLE] = function (block: Blockly.Block) {
    const value = block.getFieldValue('NAME');
    const code = `// ${value}\n`;
    inoGenerator.setDefinitions('title', code);
    return null;
  };
};

export default generator;
