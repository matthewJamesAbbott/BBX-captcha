// Compile via local/Railway compiler, then flash over Web Serial using avrgirl.
// Signature mirrors what you’re already calling in BBX: compileAndFlash(getCode, opts?)

import { compileSketch } from './compilerClient';
import { WebSerialArduinoFlasher } from './webserial-flasher';

// Helper: convert HEX text -> ArrayBuffer for avrgirl
function textToArrayBuffer(text) {
    return new TextEncoder().encode(text).buffer;
}

/**
 * @param {() => string} getCode   - function returning current editor code
 * @param {{ board?: string, port?: SerialPort }} [opts]
 */
export async function compileAndFlash(getCode, opts = {}) {
    const source = getCode();
    if (!source || !source.trim()) throw new Error('No code to compile');

    // 1) Compile
    const result = await compileSketch(source);
    if (result.error) throw new Error(result.error);

    // 2) Prepare flasher (board defaults to 'uno' unless you pass Box.board)
    const board = opts.board || 'uno';
    // Keep console quiet by default; enable by setting VITE_BBX_FLASH_DEBUG=true
    const debug = !!(typeof import.meta !== 'undefined' &&
        import.meta.env &&
        (import.meta.env.VITE_BBX_FLASH_DEBUG === 'true' || import.meta.env.VITE_BBX_FLASH_DEBUG === '1'));
    const flasher = new WebSerialArduinoFlasher({
        board,
        port: opts.port || null,
        debug,
    });

    // 3) Acquire port (re-uses previously granted, else shows picker)
    await flasher.ensurePort();

    // 4) Flash
    const hexBuf = textToArrayBuffer(result.hex);
    await flasher.flashHex(hexBuf);
}