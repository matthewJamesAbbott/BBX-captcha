import { inoGenerator } from 'App/Lib/Blockly/inogen';
import { BlockType } from 'App/Lib/Blockly/types';
import { BlockDefinition } from 'blockly/core/blocks';

const generator = (blocks: BlockDefinition) => {
  blocks[BlockType.ULTRASONIC_DISTANCE] = function () {
    const helper = `
long get_distance() {
  long duration_;
  long distance_;
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  duration_ = pulseIn(echoPin, HIGH); 
  distance_ = duration_ * 0.034/2;

  return distance_;
}\n`;

    inoGenerator.addToHelpers('get_distance', helper);
    const code = `get_distance()`;
    return [code, inoGenerator.ORDER_ATOMIC];
  };
};

export default generator;
