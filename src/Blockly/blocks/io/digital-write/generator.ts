import { inoGenerator } from 'App/Lib/Blockly/inogen';
import { BlockType } from 'App/Lib/Blockly/types';
import Blockly from 'blockly';
import { BlockDefinition } from 'blockly/core/blocks';

const generator = (blocks: BlockDefinition) => {
  blocks[BlockType.DIGITAL_WRITE] = function (block: Blockly.Block) {
    const pinNumber = block.getFieldValue('PIN_VALUE');
    const pinState = block.getFieldValue('PIN_STATE');
    const code = `digitalWrite(${pinNumber}, ${pinState.toUpperCase()});\n`;

    const setupCode = `pinMode(${pinNumber}, OUTPUT);`;
    inoGenerator.addToSetup(`setup_output_${pinNumber}`, setupCode);
    return code;
  };
};

export default generator;
