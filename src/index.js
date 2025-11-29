import { exec } from 'child_process';
import { writeFile, readFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

export const handler = async (event) => {
  try {
    const { code } = JSON.parse(event.body || '{}');
    if (!code) {
      return { statusCode: 400, body: 'No code provided' };
    }

    const workDir = join(tmpdir(), 'bbx-build');
    const inoFile = join(workDir, 'sketch.ino');

    // Save code to file
    await writeFile(inoFile, code);

    // Compile with Arduino CLI
    const board = 'arduino:avr:nano';
    const cmd = `arduino-cli compile --fqbn ${board} --output-dir ${workDir} ${workDir}`;

    await new Promise((resolve, reject) => {
      exec(cmd, (error, stdout, stderr) => {
        if (error) return reject(stderr || stdout || error.message);
        resolve();
      });
    });

    // Read compiled HEX
    const hexFile = join(workDir, 'sketch.ino.hex');
    const hex = await readFile(hexFile, 'utf-8');

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ hex }),
    };
  } catch (err) {
    return { statusCode: 500, body: `Compile error: ${err}` };
  }
};
