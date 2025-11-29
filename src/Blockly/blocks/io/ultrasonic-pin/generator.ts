import { inoGenerator } from 'App/Lib/Blockly/inogen';
import { BlockType } from 'App/Lib/Blockly/types';
import Blockly from 'blockly';
import { BlockDefinition } from 'blockly/core/blocks';

const generator = (blocks: BlockDefinition) => {
  blocks[BlockType.ULTRASONIC_PIN] = function (block: Blockly.Block) {
    const trigPIN = block.getFieldValue('TRIG_PIN');
    const echoPIN = block.getFieldValue('ECHO_PIN');
    const trigPinConst = `int trigPin = ${trigPIN};`;
    const echoPinConst = `int echoPin = ${echoPIN};`;
    inoGenerator.addToVars(`VARS_INIT_ECHO_${block.id}`, trigPinConst);
    inoGenerator.addToVars(`VARS_INIT_TRIG_${block.id}`, echoPinConst);

    const trigPinCode = `pinMode(trigPin, OUTPUT);`;
    const echoPinCode = `pinMode(echoPin, INPUT);`;
    inoGenerator.addToSetup(`setup_output_${block.id}`, trigPinCode);
    inoGenerator.addToSetup(`setup_input_${block.id}`, echoPinCode);
    return '';
  };
};

export default generator;
