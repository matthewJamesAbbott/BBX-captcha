import { BlockType } from 'App/Lib/Blockly/types';
import { BlockDefinition } from 'blockly/core/blocks';
import type { Block } from 'blockly';
import { inoGenerator } from 'App/Lib/Blockly/inogen';

const generator = (blocks: BlockDefinition) => {
  blocks[BlockType.LOGIC_COMPARE] = function (block: Block) {
    const OPERATORS: Record<string, string> = {
      EQ: '==',
      NEQ: '!=',
      LT: '<',
      LTE: '<=',
      GT: '>',
      GTE: '>=',
    };
    const operator = OPERATORS[block.getFieldValue('OP')];
    const order =
      operator === '==' || operator === '!='
        ? inoGenerator.ORDER_EQUALITY
        : inoGenerator.ORDER_RELATIONAL;
    const argument0 = inoGenerator.valueToCode(block, 'A', order) || '0';
    const argument1 = inoGenerator.valueToCode(block, 'B', order) || '0';
    const code = '( ' + argument0 + ' ' + operator + ' ' + argument1 + ')';
    return [code, order];
  };
};

export default generator;
