import {
  BLOCK_COLOR_CODES,
  BlockCategory,
  BlockIcons,
} from 'App/Lib/Blockly/types';
import Blockly, { ICollapsibleToolboxItem, IToolbox } from 'blockly/core';
import { CategoryInfo } from 'blockly/core/utils/toolbox';
import { dom } from './utils';

class ToolboxCategory extends Blockly.ToolboxCategory {
  constructor(
    categoryDef: CategoryInfo,
    toolbox: IToolbox,
    opt_parent?: ICollapsibleToolboxItem,
  ) {
    super(categoryDef, toolbox, opt_parent);
  }

  protected createIconDom_(): Element {
    const toolboxIcon = document.createElement('img');
    toolboxIcon.src = BlockIcons[this.name_ as BlockCategory];
    toolboxIcon.alt = this.name_;
    toolboxIcon.width = 35;
    toolboxIcon.height = 35;

    return toolboxIcon;
  }

  protected createLabelDom_(name: string): Element {
    const toolboxLabel = document.createElement('span');
    toolboxLabel.setAttribute('id', this.getId() + '.label');
    toolboxLabel.textContent = name;
    const className = this.cssConfig_['label'];
    if (className) {
      dom.addClass(toolboxLabel, className);
    }

    const arrowEl = this.createArrowIcon();
    toolboxLabel.appendChild(arrowEl);
    return toolboxLabel;
  }

  private createArrowIcon(): Element {
    const arrowEl = document.createElement('i');
    dom.addClass(arrowEl, 'icon-arrow');
    arrowEl.style.setProperty(
      '--icon-color',
      BLOCK_COLOR_CODES[this.name_ as BlockCategory],
    );
    return arrowEl;
  }
}

export default ToolboxCategory;
