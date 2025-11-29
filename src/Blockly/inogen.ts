import Blockly, { CodeGenerator, Names } from 'blockly/core';
import { RESERVED_KEYWORDS } from './reserved-words';

interface OperationOrder {
  ORDER_ATOMIC: number;
  ORDER_FUNCTION_CALL: number;
  ORDER_EQUALITY: number;
  ORDER_RELATIONAL: number;
  ORDER_ASSIGNMENT: number;
  ORDER_NONE: number;
  ORDER_LOGICAL_AND: number;
  ORDER_LOGICAL_OR: number;
}

/**
 * InoScript code generator.
 * @type {!InoScript}
 */
class InoScript extends CodeGenerator implements OperationOrder {
  private static instance: InoScript;

  /**
   * Order of operation ENUMs.
   * https://developers.google.com/blockly/guides/create-custom-blocks/operator-precedence
   */
  ORDER_ATOMIC = 0;
  ORDER_FUNCTION_CALL = 1;
  ORDER_RELATIONAL = 2;
  ORDER_EQUALITY = 3;
  ORDER_LOGICAL_AND = 4;
  ORDER_LOGICAL_OR = 5;
  ORDER_ASSIGNMENT = 6; // = += -= **= *= /= %= <<= >>= ...
  ORDER_NONE = 99;

  RESERVED_WORDS_ = RESERVED_KEYWORDS.join(',');

  constructor(name: string) {
    super(name);
  }

  /**
   * Whether the init method has been called.
   * @type {?boolean}
   */
  isInitialized = false;

  private setup_: Record<string, string> = {};

  private variables_: Record<string, string> = {};
  private helpers_: Record<string, string> = {};

  /**
   * Initialise the database of variable names.
   * @param {!Workspace} workspace Workspace to generate code from.
   */
  init(workspace: Blockly.Workspace): void {
    super.init(workspace);

    if (!this.nameDB_) {
      this.nameDB_ = new Names(this.RESERVED_WORDS_);
    } else {
      this.nameDB_.reset();
    }
    this.nameDB_.setVariableMap(workspace.getVariableMap());
    this.nameDB_.populateVariables(workspace);
    this.nameDB_.populateProcedures(workspace);

    this.isInitialized = true;
  }

  public static getInstance(): InoScript {
    if (!InoScript.instance) {
      InoScript.instance = new InoScript('InoScript');
    }

    return InoScript.instance;
  }

  /**
   * Prepend the generated code with the variable definitions.
   * @param {string} code Generated code.
   * @return {string} Completed code.
   */
  finish(code: string): string {
    // Convert the definitions dictionary into a list.
    const definitions = Object.values(this.definitions_);
    // Call Blockly.CodeGenerator's finish.
    code = super.finish(code);
    this.isInitialized = false;

    const setup = this.setupCode;
    const loop = 'void loop() {\n  ' + code.replace(/\n/g, '\n  ') + '\n}';

    // Build definitions/variables/helpers without introducing leading blank lines
    const parts: string[] = [];
    if (definitions.length) parts.push(definitions.join('\n'));
    const vars = this.variablesInits;
    if (vars.trim()) parts.push(vars.trimEnd());
    const helpers = this.functionDeclarations;
    if (helpers.trim()) parts.push(helpers.trim());
    const defs = parts.length ? parts.join('\n') + '\n' : '';

    this.reset();
    return defs + setup + loop;
  }

  /**
   * Naked values are top-level blocks with outputs that aren't plugged into
   * anything.  A trailing semicolon is needed to make this legal.
   * @param {string} line Line of generated code.
   * @return {string} Legal line of code.
   */
  scrubNakedValue(line: string): string {
    return line + ';\n';
  }

  /**
   * Common tasks for generating Ino from blocks.
   * Handles comments for the specified block and any connected value blocks.
   * Calls any statements following this block.
   * @param {!Block} block The current block.
   * @param {string} code The Ino code created for this block.
   * @param {boolean=} opt_thisOnly True to generate code for only this statement.
   * @return {string} Ino code with comments and subsequent blocks added.
   * @protected
   */
  protected scrub_(
    block: Blockly.Block,
    code: string,
    optThisOnly?: boolean | undefined,
  ): string {
    let commentCode = '';
    // Only collect comments for blocks that aren't inline.
    if (!block.outputConnection || !block.outputConnection.targetConnection) {
      // Collect comment for this block.
      let comment = block.getCommentText();
      if (comment) {
        comment = Blockly.utils.string.wrap(comment, this.COMMENT_WRAP - 3);
        commentCode += this.prefixLines(comment + '\n', '// ');
      }
      // Collect comments for all value arguments.
      // Don't collect comments for nested statements.
      for (let i = 0; i < block.inputList.length; i++) {
        if (block.inputList[i].type === Blockly.inputTypes.VALUE) {
          const childBlock = block.inputList[i].connection?.targetBlock();
          if (childBlock) {
            comment = this.allNestedComments(childBlock);
            if (comment) {
              commentCode += this.prefixLines(comment, '// ');
            }
          }
        }
      }
    }
    const nextBlock =
      block.nextConnection && block.nextConnection.targetBlock();
    const nextCode = optThisOnly ? '' : this.blockToCode(nextBlock);
    return commentCode + code + nextCode;
  }

  /**
   * A database of variable and procedure names.
   * @return {Names} List of reserved keywords.
   */
  get reservedNamesList(): Names {
    if (this.nameDB_) {
      return this.nameDB_;
    }
    return {} as Names;
  }

  /**
   *
   * @param {string} key unique identifier
   * @param {string} code actual code to use in generation
   * @returns {void}
   */
  setDefinitions(key: string, code: string) {
    this.definitions_[key] = code;
  }

  /**
   * Sets value in setup dictionary.
   *
   *
   * @param {string} key `setup_input` or `setup_output`
   * @param {string} code
   * @return {void}
   */
  addToSetup(key: string, code: string) {
    this.setup_[key] = code;
  }

  /**
   * Sets value in variable (nameDB) dictionary.
   *
   *
   * @param {string} key `setup_input` or `setup_output`
   * @param {string} code
   * @return {void}
   */
  addToVars(key: string, code: string) {
    this.variables_[key] = code;
  }

  /**
   * Sets value in functionNames_.
   *
   *
   * @param {string} key `setup_input` or `setup_output`
   * @param {string} code
   * @return {void}
   */
  addToHelpers(key: string, code: string) {
    this.helpers_[key] = code;
    if (this.helpers_[key] === undefined) {
      const varName = this.getDistinctName(key);
      this.helpers_[key] = code.replace(
        this.FUNCTION_NAME_PLACEHOLDER_,
        varName,
      );
      this.functionNames_[key] = varName;
    }
    return this.functionNames_[key];
  }

  /**
   * Generate unique name in the code without duplicates.
   *
   * @param {string} key var name
   * @param {NameType} type type variable (var, proc)
   * @returns {void}
   */
  getDistinctName(key: string, type = Blockly.Names.NameType.PROCEDURE) {
    return this.reservedNamesList.getDistinctName(key, type);
  }

  get setupCode(): string {
    const setups = [];
    for (const name in this.setup_) {
      setups.push(this.setup_[name]);
    }

    // Single trailing newline (no extra blank line before loop)
    return 'void setup() {\n  ' + setups.join('\n  ') + '\n}\n';
  }

  get variablesInits(): string {
    const variables = [];
    for (const name in this.variables_) {
      variables.push(this.variables_[name]);
    }
    if (variables.length) {
      variables.push('\n');
    }
    return variables.join('\n');
  }

  get functionDeclarations(): string {
    const functions = [];
    for (const name in this.helpers_) {
      functions.push(this.helpers_[name]);
    }
    return functions.join('\n\n');
  }

  /**
   * Clears all locally registerd variable, function names.
   */
  reset() {
    this.nameDB_?.reset();
    this.resetSetupCode();
    this.resetVars();
    this.resetHelper();
  }

  resetSetupCode() {
    this.setup_ = {};
  }

  resetVars() {
    this.variables_ = {};
  }

  resetHelper() {
    this.helpers_ = {};
  }
}

export const inoGenerator = InoScript.getInstance();
