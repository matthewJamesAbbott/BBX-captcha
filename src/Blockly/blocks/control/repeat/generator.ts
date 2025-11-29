import { inoGenerator } from 'App/Lib/Blockly/inogen';
import { BlockType } from 'App/Lib/Blockly/types';
import Blockly from 'blockly/core';
import { BlockDefinition } from 'blockly/core/blocks';

const generator = (blocks: BlockDefinition) => {
  blocks[BlockType.REPEAT] = function (block: Blockly.Block) {
    let repeats;
    if (block.getField('TIMES')) {
      // Internal number.
      repeats = String(Number(block.getFieldValue('TIMES')));
    } else {
      // External number.
      repeats =
        inoGenerator.valueToCode(
          block,
          'TIMES',
          inoGenerator.ORDER_ASSIGNMENT,
        ) || '0';
    }
    let branch = inoGenerator.statementToCode(block, 'CODE_VALUE');
    branch = inoGenerator.addLoopTrap(branch, block);
    let code = '';
    const loopVar = inoGenerator.reservedNamesList.getDistinctName(
      'i',
      Blockly.Names.NameType.VARIABLE,
    );
    let endVar = repeats;
    if (!repeats.match(/^\w+$/) && !Blockly.utils.string.isNumber(repeats)) {
      endVar = inoGenerator.reservedNamesList.getDistinctName(
        'repeat_end',
        Blockly.Names.NameType.VARIABLE,
      );
      code += 'var ' + endVar + ' = ' + repeats + ';\n';
    }
    code +=
      'for (int ' +
      loopVar +
      ' = 0; ' +
      loopVar +
      ' < ' +
      endVar +
      '; ' +
      loopVar +
      '++) {\n' +
      branch +
      '}\n';
    return code;
  };
};

export default generator;
