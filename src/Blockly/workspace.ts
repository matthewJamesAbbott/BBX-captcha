import { BlocklyOptions, Blocks, WorkspaceSvg } from 'blockly/core';
import Blockly from 'blockly/core';
import ToolboxCategory from './toolbox-category';
import { defaultOptions } from './config';
import { SnowballRenderer } from './renderer';
import { inoGenerator } from './inogen';
import { BLOCK_DEFINITIONS, BLOCK_STUBS } from './blocks-registry';
import { BlockType } from './types';
import { setAlert, setConfirm, setPrompt } from './dialog-registry';

function registerBlocks() {
  // Register block definitions
  BLOCK_DEFINITIONS.forEach((definition) => definition(Blockly));

  // Register your own language generators here
  BLOCK_STUBS.forEach((stub) => stub(inoGenerator));
}

function registerToolBox() {
  Blockly.registry.register(
    Blockly.registry.Type.TOOLBOX_ITEM,
    Blockly.ToolboxCategory.registrationName,
    ToolboxCategory,
    true,
  );
}

function configureContextMenu() {
  const UNREG_MENU_IDS = [
    'blockComment',
    'blockCollapseExpand',
    'blockDisable',
  ];

  const context = Blockly.ContextMenuRegistry.registry;

  UNREG_MENU_IDS.forEach((id) => {
    if (context.getItem(id)) {
      context.unregister(id);
    }
  });
}

function customizeVarMethods() {
  // Disable math blocks on variables
  Blocks[BlockType.VAR_MATH_CHANGE] = false;
}

function overrideModal() {
  Blockly.dialog.setAlert(setAlert);
  Blockly.dialog.setConfirm(setConfirm);
  Blockly.dialog.setPrompt(setPrompt);
}

function init() {
  Blockly.registry.register(
    Blockly.registry.Type.RENDERER,
    'snowball',
    SnowballRenderer,
    true,
  );
  registerBlocks();
  registerToolBox();
  configureContextMenu();
  overrideModal();
  customizeVarMethods();
}
function createWorkspace(
  container: Element | string,
  options: BlocklyOptions = defaultOptions,
): WorkspaceSvg {
  init();

  return Blockly.inject(container, options);
}

export default createWorkspace;
