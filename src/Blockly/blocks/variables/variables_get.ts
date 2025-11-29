import { BlockType } from 'App/Lib/Blockly/types';
import Blockly from 'blockly';
import { BlockDefinition } from 'blockly/core/blocks';
import { inoGenerator } from '../../inogen';

const generator = (blocks: BlockDefinition) => {
  blocks[BlockType.VARIABLES_GET] = function (block: Blockly.Block) {
    // Variable getter.
    const value = block.getFieldValue('VAR');

    const code = inoGenerator.reservedNamesList.getName(
      value,
      Blockly.Names.NameType.VARIABLE,
    );
    return [code, inoGenerator.ORDER_ATOMIC];
  };
};

export default generator;
