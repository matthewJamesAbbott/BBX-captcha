import VarModal from './var-modal';

/**
 *
 * @param message
 * @param callback
 */
export const setAlert = (message: string, callback?: () => void): void => {
  VarModal.show('Alert', message, {
    onCancel: callback,
  });
};

/**
 *
 * @param message
 * @param callback
 */
export const setConfirm = (
  message: string,
  callback: (status: boolean) => void,
): void => {
  VarModal.show('Confirm', message, {
    showOkay: true,
    onOkay: function () {
      callback(true);
    },
    showCancel: true,
    onCancel: function () {
      callback(false);
    },
  });
};

/**
 *
 * @param message
 * @param defaultValue
 * @param callback
 */
export const setPrompt = (
  message: string,
  defaultValue: string,
  callback: (input: string | null) => void,
): void => {
  VarModal.show('Prompt', message, {
    showInput: true,
    showOkay: true,
    onOkay: function () {
      callback(VarModal.inputField.value);
    },
    showCancel: true,
    onCancel: function () {
      callback(null);
    },
  });
  VarModal.inputField.value = defaultValue;
};
