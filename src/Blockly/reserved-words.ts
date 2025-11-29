/**
 * List of illegal variable names.
 * This is not intended to be a security feature.  Blockly is 100% client-side,
 * so bypassing this list is trivial.  This is intended to prevent users from
 * accidentally clobbering a built-in object or function.
 *
 * https://www.arduino.cc/
 */
export const RESERVED_KEYWORDS = [
  // Sketch
  'setup',
  'loop',
  // Control Structure
  'break',
  'continue',
  'do',
  'while',

  // Digital I/O
  'digitalRead',
  'digitalWrite',
  'pinMode',
  // Analog I/O
  'analogRead',
  'analogReference',
  'analogWrite',
  // Math
  'abs',
  'constrain',
  'map',
  'max',
  'min',
  'pow',
  'sq',
  'sqrt',
  // Random Numbers
  'random',
  'randomSeed',
  // Zero, Due & MKR Family
  'analogReadResolution',
  'analogWriteResolution',
  // Trigonometry
  'cos',
  'sin',
  'tan',

  // Bits and Bytes
  'bit',
  'bitClear',
  'bitRead',
  'bitSet',
  'bitWrite',
  'highByte',
  'lowByte',

  // Advanced I/O
  'noTone',
  'pulseIn',
  'pulseInLong',
  'shiftIn',
  'shiftOut',
  'tone',

  // Characters
  'isAlpha',
  'isAlphaNumeric',
  'isAscii',
  'isControl',
  'isDigit',
  'isGraph',
  'isHexadecimalDigit',
  'isLowerCase',
  'isPrintable',
  'isPunct',
  'isSpace',
  'isUpperCase',
  'isWhitespace',

  // External Interrupts
  'attachInterrupt',
  'detachInterrupt',

  // Interrupts
  'interrupts',
  'noInterrupts',

  // Communication
  'Serial',
  'SPI',
  'Stream',
  'Wire',

  // Time
  'delay',
  'delayMicroseconds',
  'micros',
  'millis',

  // USB
  'Keyboard',
  'Mouse',

  // Constants
  'HIGH',
  'LOW',
  'INPUT',
  'OUTPUT',
  'INPUT_PULLUP',
  'LED_BUILTIN',
  'true',
  'false',
  // Variable Scope & Qualifiers
  'const',
  'scope',
  'static',
  'volatile',

  // Utilities
  'PROGMEM',
  'sizeof',

  // Data Types
  'byte',
  'char',
  'float',
  'int',
  'long',
  'word',
  'int',
  'char',
  'bool',
  'double',
  'float',
  'long',
  'short',
  'size_t',
  'void',
  'word',
  'unsigned',
];
