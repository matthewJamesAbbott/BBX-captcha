import { inoGenerator } from 'App/Lib/Blockly/inogen';
import { BlockType } from 'App/Lib/Blockly/types';
import Blockly from 'blockly';
import { BlockDefinition } from 'blockly/core/blocks';

const generator = (blocks: BlockDefinition) => {
  blocks[BlockType.INFRARED_READ] = function (block: Blockly.Block) {
    const pinNumber = block.getFieldValue('PIN_NUMBER');

    const code = `digitalRead(${pinNumber})`;

    return [code, inoGenerator.ORDER_ATOMIC];
  };
};

export default generator;
