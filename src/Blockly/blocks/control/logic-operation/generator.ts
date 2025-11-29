import { BlockType } from 'App/Lib/Blockly/types';
import { BlockDefinition } from 'blockly/core/blocks';
import type { Block } from 'blockly';
import { inoGenerator } from 'App/Lib/Blockly/inogen';

const generator = (blocks: BlockDefinition) => {
  blocks[BlockType.LOGIC_OPERATION] = function (block: Block) {
    const operator = block.getFieldValue('OP') === 'AND' ? '&&' : '||';
    const order =
      operator === '&&'
        ? inoGenerator.ORDER_LOGICAL_AND
        : inoGenerator.ORDER_LOGICAL_OR;
    let argument0 = inoGenerator.valueToCode(block, 'A', order);
    let argument1 = inoGenerator.valueToCode(block, 'B', order);
    if (!argument0 && !argument1) {
      // If there are no arguments, then the return value is false.
      argument0 = 'false';
      argument1 = 'false';
    } else {
      // Single missing arguments have no effect on the return value.
      const defaultArgument = operator === '&&' ? 'true' : 'false';
      if (!argument0) {
        argument0 = defaultArgument;
      }
      if (!argument1) {
        argument1 = defaultArgument;
      }
    }
    const code = argument0 + ' ' + operator + ' ' + argument1;
    return [code, order];
  };
};

export default generator;
