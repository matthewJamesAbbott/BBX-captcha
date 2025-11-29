// Minimal flasher that mirrors Playground’s “port + avrgirl” approach.
// Uses Web Serial + avrgirl-arduino. Accepts Intel HEX as ArrayBuffer.

import AvrgirlModule from 'avrgirl-arduino/dist/avrgirl-arduino.js';

const Avrgirl = (typeof AvrgirlModule === 'function'
  ? AvrgirlModule
  : typeof AvrgirlModule?.default === 'function'
    ? AvrgirlModule.default
    : null);

if (!Avrgirl) {
  throw new Error('[BBX] Unable to locate Avrgirl constructor from avrgirl-arduino/dist/avrgirl-arduino.js');
}

export class WebSerialArduinoFlasher {
  constructor({ board = 'uno', port = null, debug = false } = {}) {
    this.board = board;
    this.port = port;     // SerialPort (Web Serial) or null -> we'll request
    this.debug = debug;
  }

  async ensurePort() {
    const serial = navigator.serial;
    if (!serial) throw new Error('Web Serial API not available. Use Chrome/Edge.');

    // try previously granted port first
    if (!this.port) {
      const granted = await serial.getPorts();
      if (granted?.length) {
        this.port = granted[0];
      }
    }
    // or request a port
    if (!this.port) {
      // Narrow chooser to common Arduino-compatible USB bridges
      this.port = await serial.requestPort({
        filters: [
          // CH340/CH341
          { usbVendorId: 0x1A86, usbProductId: 0x7523 },
          // FTDI FT232
          { usbVendorId: 0x0403, usbProductId: 0x6001 },
          // Arduino Uno (ATmega16U2)
          { usbVendorId: 0x2341, usbProductId: 0x0043 },
          // Silicon Labs CP210x
          { usbVendorId: 0x10C4, usbProductId: 0xEA60 },
        ],
      });
    }

    // auto-clear when disconnected
    this.port.addEventListener?.('disconnect', () => { this.port = null; });
    // Diagnostics: show port info when verbose/debug
    try {
      const info = this.port.getInfo?.();
      if (info && (this.debug || (window?.BBX_FLASH_VERBOSE === true))) {
        console.info('[BBX] WebSerial port info:', info);
      }
    } catch {}
    return this.port;
  }

  async flashHex(hexArrayBuffer) {
    // avrgirl will parse the intel-hex from the ArrayBuffer
    const cfg = {
      board: this.board,        // e.g. 'uno' or 'nano'
      port: this.port,          // Web Serial port
      debug: this.debug,
      megaDebug: this.debug,
    };

    const avrgirl = new Avrgirl(cfg);

    // Self-check for known avrgirl strict-mode issue; guide user if detected
    try {
      const chip = avrgirl?.protocol?.chip;
      const sigSrc = chip?.verifySignature?.toString?.() || '';
      const pageSrc = chip?.verifyPage?.toString?.() || '';
      const badSig = /[^\w]match\s*=\s*Buffer\.concat\(/.test(sigSrc) && !/var\s+match\s*=/.test(sigSrc);
      const badPage = /[^\w]match\s*=\s*Buffer\.concat\(/.test(pageSrc) && !/var\s+match\s*=/.test(pageSrc);
      if (badSig || badPage) {
        console.error('[BBX] Avrgirl bundle appears unpatched (undeclared "match").');
        console.info('[BBX] Fix: delete node_modules/.vite, then run "npm run dev -- --force" and hard refresh.');
        console.info('[BBX] Ensure patches/avrgirl-arduino+5.0.1.patch exists and postinstall runs patch-package.');
      } else if (this.debug) {
        console.info('[BBX] Avrgirl methods look patched.');
      }
    } catch {}

    await new Promise((resolve, reject) => {
      avrgirl.flash(hexArrayBuffer, (err) => {
        if (err) {
          const msg = String(err?.message || err || '');
          if (/ReferenceError: match is not defined/i.test(msg)) {
            console.error('[BBX] Upload failed due to avrgirl strict-mode bug (undeclared "match").');
            console.info('[BBX] Action: clear Vite cache (node_modules/.vite), rerun dev with --force, then hard refresh.');
          }
          return reject(err);
        }
        return resolve();
      });
    });
  }
}
