import { inoGenerator } from 'App/Lib/Blockly/inogen';
import { BlockType } from 'App/Lib/Blockly/types';
import Blockly from 'blockly';
import { BlockDefinition } from 'blockly/core/blocks';

const generator = (blocks: BlockDefinition) => {
  blocks[BlockType.ANALOG_WRITE] = function (block: Blockly.Block) {
    const pinNumber = block.getFieldValue('PIN_VALUE');
    const pinstate = block.getFieldValue('PIN_STATE');

    const code = `analogWrite(${pinNumber}, ${pinstate});\n`;
    const setupCode = `pinMode(${pinNumber}, OUTPUT);`;
    inoGenerator.addToSetup(`setup_output_${pinNumber}`, setupCode);

    return code;
  };
};

export default generator;
