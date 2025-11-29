/**
 * This is a direct implementation for blockly confirmation, alert popups.
 * This is writtern in pure javascript (typescript) code, as blockly wont support react.
 */
import { dom } from './utils';

enum ModalElementIds {
  BACKDROP = 'snowballDialogBackdrop',
  INPUT = 'snowballDialogInput',
  OKAY = 'snowballDialogOkay',
  CANCEL = 'snowballDialogCancel',
}

interface ShowModalOptions {
  showOkay?: boolean;
  showCancel?: boolean;
  showInput?: boolean;
  onOkay?: () => void;
  onCancel?: () => void;
}

interface Props {
  show: (type: string, message: string, opts: ShowModalOptions) => void;
  hide: () => void;
  inputField: HTMLInputElement;
  backdropDiv_: HTMLElement;
  dialogDiv_: HTMLElement;
}

/**
 * Creates overlay element
 * @returns
 */
const createBackdrop = () => {
  // To add close event handlers
  const backdropDiv = document.createElement('div');
  backdropDiv.id = ModalElementIds.BACKDROP;
  // Calls bootstrap overlay styles
  dom.addClass(backdropDiv, 'modal-backdrop fade show opacity-100');
  return backdropDiv;
};

/**
 * Creates modal
 * @returns
 */
const createModal = () => {
  const dialogDiv = document.createElement('div');
  dom.addClass(dialogDiv, 'modal blockly-var-modal');
  dialogDiv.setAttribute('data-backdrop', 'true');
  dialogDiv.tabIndex = -1;
  dialogDiv.role = 'dialog';
  return dialogDiv;
};

const createBackdropModal = () => {
  const backdropEl = createBackdrop();
  document.body.appendChild(backdropEl);

  const dialogEl = createModal();
  backdropEl.appendChild(dialogEl);

  // avoid closing
  dialogEl.onclick = function (event) {
    event.stopPropagation();
  };

  return [backdropEl, dialogEl];
};

const addEmptyLine = (value: string, hasContent = false) => {
  if (hasContent) {
    return value;
  }
  return '';
};

const renderCancelButton = (show = false) => {
  return addEmptyLine(
    `<button id=${ModalElementIds.CANCEL} class="btn btn-light">Cancel</button>`,
    show,
  );
};

const renderOkayButton = (show = false) => {
  return addEmptyLine(
    `<button id=${ModalElementIds.OKAY} class="btn btn-primary">OK</button>`,
    show,
  );
};

const renderVarNameInput = (show = false) => {
  return addEmptyLine(
    `<div>
    <input id=${ModalElementIds.INPUT} class="form-control" autocomplete="off" />
  </div>`,
    show,
  );
};

/**
 * Returns custom title
 *
 * @param {string} title 'Prompt' | 'Confirm' | 'Alert|
 * @param {string} message
 * @returns
 */
const getTitle = (title: string, message: string): string => {
  const titleRegex: Record<string, string> = {
    '\\New variable name:': 'Create new variable',
    '\\already exists': 'Duplicate variable',
    '\\Rename all': 'Rename',
    '\\Delete': 'Delete variable',
  };

  const match = Object.keys(titleRegex).find((key) => {
    const re = new RegExp(key);
    return re.test(message);
  });

  return match ? titleRegex[match] : title;
};

const renderModalContent = (
  title: string,
  message: string,
  opts: ShowModalOptions,
): string => {
  return `
    <div class="modal-dialog m-0" role="document">
      <div class="modal-content">
        
        <div class="modal-header">
          <h5 class="modal-title">${getTitle(title, message)}</h5>
        </div>

        <div class="modal-body">
          <p>${message}</p>
          ${renderVarNameInput(opts.showInput)}
        </div>

        <div class="modal-footer">
          ${renderCancelButton(opts.showCancel)}
          ${renderOkayButton(opts.showOkay)}
        </div>
      </div>
    </div>
`;
};

const focusOkBtn = () => {
  const okayEl = dom.getElement<HTMLButtonElement>(ModalElementIds.OKAY);
  dom.focusElement<HTMLButtonElement>(okayEl);
};

const addInputHandlers = (
  dialogInput: HTMLInputElement,
  onOkay: (event?: Event) => void,
  onCancel: (event?: Event) => void,
) => {
  dom.focusElement<HTMLInputElement>(dialogInput);

  dialogInput.onkeyup = function (event) {
    if (event.key === 'Enter') {
      // Process as OK when user hits enter.
      onOkay();
      return false;
    } else if (event.key === 'Escape') {
      // Process as cancel when user hits esc.
      onCancel();
      return false;
    }
  };
};

/**
 * blockly compatible Modal implementation for variables
 */
const VarModal: Props = {} as Props;

VarModal.hide = function () {
  if (VarModal.backdropDiv_) {
    VarModal.dialogDiv_.style.display = 'none';
    dom.removeClass(document.body, 'modal-open');
    dom.removeClass(VarModal.backdropDiv_, 'modal-backdrop fade show');
  }
};

const getBackdropModal = () => {
  if (!VarModal.dialogDiv_) {
    const [backdropEl, dialogEl] = createBackdropModal();
    VarModal.backdropDiv_ = backdropEl;
    VarModal.dialogDiv_ = dialogEl;
  }

  return [VarModal.backdropDiv_, VarModal.dialogDiv_];
};

/**
 * Shows the dialog.
 * Allowed options:
 *  - showOkay: Whether to show the OK button.
 *  - showCancel: Whether to show the Cancel button.
 *  - showInput: Whether to show the text input field.
 *  - onOkay: Callback to handle the okay button.
 *  - onCancel: Callback to handle the cancel button and backdrop clicks.
 */
VarModal.show = function (
  title: string,
  message: string,
  options: ShowModalOptions,
) {
  const [backdropDiv, dialogDiv] = getBackdropModal();

  dialogDiv.style.display = 'block';
  dom.addClass(backdropDiv, 'modal-backdrop fade show blockly-var-backdrop-bg');
  dom.addClass(document.body, 'modal-open');

  dialogDiv.innerHTML = renderModalContent(title, message, options);

  const onOkay = function (event?: Event) {
    VarModal.hide();
    options.onOkay && options.onOkay();
    event && event.stopPropagation();
  };
  const onCancel = function (event?: Event) {
    VarModal.hide();
    options.onCancel && options.onCancel();
    event && event.stopPropagation();
  };

  const dialogInput = dom.getElement<HTMLInputElement>(ModalElementIds.INPUT);
  VarModal.inputField = dialogInput;
  if (dialogInput) {
    addInputHandlers(dialogInput, onOkay, onCancel);
  } else {
    focusOkBtn();
  }

  if (options.showOkay) {
    dom.addEventHandlerById<HTMLButtonElement>(
      ModalElementIds.OKAY,
      'click',
      onOkay,
    );
  }

  if (options.showCancel) {
    dom.addEventHandlerById<HTMLButtonElement>(
      ModalElementIds.CANCEL,
      'click',
      onCancel,
    );
  }
  backdropDiv.onclick = onCancel;
};

export default VarModal;
