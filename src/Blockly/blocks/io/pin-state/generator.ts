import { inoGenerator } from 'App/Lib/Blockly/inogen';
import { BlockType } from 'App/Lib/Blockly/types';
import Blockly from 'blockly';
import { BlockDefinition } from 'blockly/core/blocks';

const generator = (blocks: BlockDefinition) => {
  blocks[BlockType.PIN_STATE] = function (block: Blockly.Block) {
    const value = block.getFieldValue('PIN_STATE');
    const code = `${value}`;

    return [code, inoGenerator.ORDER_ATOMIC];
  };
};

export default generator;
