import { BlockType } from 'App/Lib/Blockly/types';
import Blockly from 'blockly';
import { BlockDefinition } from 'blockly/core/blocks';

const generator = (blocks: BlockDefinition) => {
  blocks[BlockType.WAIT] = function (block: Blockly.Block) {
    const value = block.getFieldValue('VALUE');
    const metric = block.getFieldValue('METRIC');

    let delayCode = '';
    if (metric === 'second') {
      delayCode = `delay(${
        value * 1000
      }); // in milliseconds (1 second =  1000 milliseconds)`; // delay in seconds
    } else {
      delayCode = `delay(${value}); // in milliseconds`; // delay in milliseconds
    }

    const code = `${delayCode}\n`; // add a newline after the delay code
    return code;
  };
};

export default generator;
