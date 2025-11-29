import {
  BLOCK_COLOR_CODES,
  BlockCategory,
  BlockType,
} from 'App/Lib/Blockly/types';
import { BlockDefinition } from 'blockly/core/blocks';

const definition = (blocks: BlockDefinition) => {
  blocks.Blocks[BlockType.WAIT] = {
    init: function () {
      this.appendDummyInput()
        .appendField('wait')
        .appendField(new blocks.FieldNumber(1, 0, 10000), 'VALUE')
        .appendField(
          new blocks.FieldDropdown([
            ['second(s)', 'second'],
            ['millisecond(s)', 'millisecond'],
          ]),
          'METRIC',
        );
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(BLOCK_COLOR_CODES[BlockCategory.CONTROL]);
      this.setTooltip('delay execution by specified interval');
    },
  };
};

export default definition;
