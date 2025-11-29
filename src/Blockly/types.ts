import control from "Assets/Icons/control.svg";
import comment from 'Assets/Icons/comment.svg';
import label from 'Assets/Icons/comment.svg';
import io from 'Assets/Icons/io.svg';
import variables from 'Assets/Icons/variables.svg';

export enum BlockCategory {
  LABEL = 'Blocks',
  COMMENT = 'Comments',
  CONTROL = 'Control',
  IO = 'Input / Output',
  VARIABLES = 'Variables',
}

export const BlockIcons: Record<BlockCategory, string> = {
  [BlockCategory.LABEL]: label,
  [BlockCategory.COMMENT]: comment,
  [BlockCategory.CONTROL]: control,
  [BlockCategory.IO]: io,
  [BlockCategory.VARIABLES]: variables,
};

export enum BlockType {
  LABEL = 'label',
  COMMENT = 'comment',
  TITLE = 'title',
  REPEAT = 'controls_repeat_times',
  WAIT = 'wait',
  DIGITAL_WRITE = 'digital_write',
  ANALOG_WRITE = 'analog_write',
  IDLE_FOREVER = 'idle_forever',
  VARIABLES_GET = 'variables_get',
  VARIABLES_SET = 'variables_set',
  VAR_MATH_CHANGE = 'math_change',
  ULTRASONIC_PIN = 'ultrasonic_pin',
  ULTRASONIC_DISTANCE = 'ultrasonic_distance',
  PIN_STATE = 'pin_state',
  INFRARED_READ = 'digital_read',
  INFRARED_SETUP = 'infrared_setup',
  NUMBER = 'number',
  IF_DO = 'if_do',
  LOGIC_OPERATION = 'logic_operation',
  LOGIC_COMPARE = 'logic_compare',
}

export const BLOCK_COLOR_CODES = {
  [BlockCategory.LABEL]: '#C1C1C1',
  [BlockCategory.COMMENT]: '#C1C1C1',
  [BlockCategory.CONTROL]: '#FF5412',
  [BlockCategory.IO]: '#47C7FC',
  [BlockCategory.VARIABLES]: '#FF00FF',
};
