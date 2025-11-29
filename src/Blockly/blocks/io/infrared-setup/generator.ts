import { inoGenerator } from 'App/Lib/Blockly/inogen';
import { BlockType } from 'App/Lib/Blockly/types';
import Blockly from 'blockly';
import { BlockDefinition } from 'blockly/core/blocks';

const generator = (blocks: BlockDefinition) => {
  blocks[BlockType.INFRARED_SETUP] = function (block: Blockly.Block) {
    const pin1 = block.getFieldValue('IR_PIN_1');
    const pin2 = block.getFieldValue('IR_PIN_2');
    const pin1Const = `const int IRPin1 = ${pin1};`;
    const pin2Const = `const int IRPin2 = ${pin2};`;
    inoGenerator.addToVars(`VARS_INIT_IR_PIN_1${block.id}`, pin1Const);
    inoGenerator.addToVars(`VARS_INIT_IR_PIN_2${block.id}`, pin2Const);

    const pin1Code = `pinMode(IRPin1, INPUT);`;
    const pin2Code = `pinMode(IRPin2, INPUT);`;
    inoGenerator.addToSetup(`setup_input_${pin1}`, pin1Code);
    inoGenerator.addToSetup(`setup_input_${pin2}`, pin2Code);
    return '';
  };
};

export default generator;
