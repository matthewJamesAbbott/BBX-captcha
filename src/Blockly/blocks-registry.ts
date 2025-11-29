// Title
import titleDefinition from './blocks/comments/title/definition';
import titleStub from './blocks/comments/title/generator';

// Comment
import commentDefinition from './blocks/comments/comment/definition';
import commentStub from './blocks/comments/comment/generator';

// Digital write
import digitialWriteDefinition from './blocks/io/digital-write/definition';
import digitalWriteStub from './blocks/io/digital-write/generator';

// Analog write
import analogWriteDefinition from './blocks/io/analog-write/definition';
import analogWriteStub from './blocks/io/analog-write/generator';

// Wait
import waitDefinition from './blocks/control/wait/definition';
import waitStub from './blocks/control/wait/generator';

// Loop
import repeatDefinition from './blocks/control/repeat/definition';
import repeatStub from './blocks/control/repeat/generator';

// Idle
import idleForeverDefinition from './blocks/control/idle/definition';
import idleForeverStub from './blocks/control/idle/generator';

// Variables
import varSetStub from './blocks/variables/variables_set';
import varGetStub from './blocks/variables/variables_get';

// ultrasonic-setup
import ultrasonicPinDefinition from './blocks/io/ultrasonic-pin/definition';
import ultrasonicPinStub from './blocks/io/ultrasonic-pin/generator';

// Ultrasonic distance
import ultrasonicDistanceDefinition from './blocks/io/ultrasonic-distance/definition';
import ultrasonicDistancePinStub from './blocks/io/ultrasonic-distance/generator';

// Pin state
import pinStateDefinition from './blocks/io/pin-state/definition';
import pinStateStub from './blocks/io/pin-state/generator';

// Digital read / infrared
import infraredReadDefinition from './blocks/io/infrared-read/definition';
import infraredReadStub from './blocks/io/infrared-read/generator';

// Infrared setup
import infraredPinDefinition from './blocks/io/infrared-setup/definition';
import infraredPinStub from './blocks/io/infrared-setup/generator';

// Number values for variable initialization
import numberInputDefinition from './blocks/io/number/definition';
import numberInputStub from './blocks/io/number/generator';

// IF conditional block
import ifdoDefinition from './blocks/control/if-do/definition';
import ifdoStub from './blocks/control/if-do/generator';

// logical comparision
import logicCompareStub from './blocks/control/logic-compare/generator';
// logical evaluation
import logicOperationStub from './blocks/control/logic-operation/generator';

export const BLOCK_DEFINITIONS = [
  titleDefinition,
  commentDefinition,
  waitDefinition,
  repeatDefinition,
  digitialWriteDefinition,
  analogWriteDefinition,
  idleForeverDefinition,
  ultrasonicPinDefinition,
  ultrasonicDistanceDefinition,
  infraredReadDefinition,
  pinStateDefinition,
  infraredPinDefinition,
  numberInputDefinition,
  ifdoDefinition,
];

export const BLOCK_STUBS = [
  titleStub,
  commentStub,
  waitStub,
  repeatStub,
  digitalWriteStub,
  analogWriteStub,
  idleForeverStub,
  varGetStub,
  varSetStub,
  ultrasonicPinStub,
  ultrasonicDistancePinStub,
  infraredReadStub,
  pinStateStub,
  infraredPinStub,
  numberInputStub,
  ifdoStub,
  logicCompareStub,
  logicOperationStub,
];
