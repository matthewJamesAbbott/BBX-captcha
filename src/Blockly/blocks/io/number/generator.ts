import { inoGenerator } from 'App/Lib/Blockly/inogen';
import { BlockType } from 'App/Lib/Blockly/types';
import Blockly from 'blockly';
import { BlockDefinition } from 'blockly/core/blocks';

const generator = (blocks: BlockDefinition) => {
  blocks[BlockType.NUMBER] = function (block: Blockly.Block) {
    const value = block.getFieldValue('NUM_VALUE');
    const code = `${value}`;

    return [code, inoGenerator.ORDER_ATOMIC];
  };
};

export default generator;
