import { inoGenerator } from 'App/Lib/Blockly/inogen';
import { BlockType } from 'App/Lib/Blockly/types';
import { BlockDefinition } from 'blockly/core/blocks';
import type { Block } from 'blockly';

const generator = (blocks: BlockDefinition) => {
  blocks[BlockType.IF_DO] = function (block: Block) {
    const conditionCode =
      inoGenerator.valueToCode(block, 'IF', inoGenerator.ORDER_NONE) || 'false';
    const branchCode = inoGenerator.statementToCode(block, 'DO');
    const code = `if ( ${conditionCode} ) {\n${branchCode}}`;
    return code + '\n';
  };
};

export default generator;
