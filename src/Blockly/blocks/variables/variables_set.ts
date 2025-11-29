import { BlockType } from 'App/Lib/Blockly/types';
import Blockly from 'blockly';
import { BlockDefinition } from 'blockly/core/blocks';
import { inoGenerator } from '../../inogen';

const generator = (blocks: BlockDefinition) => {
  blocks[BlockType.VARIABLES_SET] = function (block: Blockly.Block) {
    // Variable setter.
    const varValue = block.getFieldValue('VAR');
    const varName = inoGenerator.reservedNamesList.getName(
      varValue,
      Blockly.Names.NameType.VARIABLE,
    );

    const argument0 =
      inoGenerator.valueToCode(block, 'VALUE', inoGenerator.ORDER_NONE) || '0';

    const initialization = `int ${varName};`;
    const code = `${varName} = ${argument0};\n`;

    inoGenerator.addToVars(`VARS_INIT_${varName}`, initialization);
    return code;
  };
};

export default generator;
