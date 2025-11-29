import Papa from 'papaparse';
import * as monaco from 'monaco-editor';
import confetti from 'canvas-confetti';
import { WebSerialArduinoFlasher } from './utils/webserial-flasher.js';

/**
 * Launch-style countdown popup with confetti at lift-off.
 */
async function showCountdownSequence() {
  const popup = document.getElementById('countdownPopup');
  const numberEl = document.getElementById('countdownNumber');
  const stageEl = document.getElementById('countdownStage');
  popup.classList.remove('hidden');

  document.body.style.pointerEvents = 'none'; // Disable page interaction

  const stages = [
    { num: 3, text: "Compiling code…" },
    { num: 2, text: "Connecting to Bugbox…" },
    { num: 1, text: "Uploading program…" },
    { num: "LIFT-OFF!", text: "Upload complete!" }
  ];

  for (let stage of stages) {
    numberEl.textContent = stage.num;
    stageEl.textContent = stage.text;

    // Restart animation
    numberEl.style.animation = 'none';
    void numberEl.offsetWidth;
    numberEl.style.animation = 'pop 0.6s ease-in-out';

    // Confetti at LIFT-OFF
    if (stage.num === "LIFT-OFF!") {
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    }

    await new Promise(res => setTimeout(res, 1000));
  }

  setTimeout(() => {
    popup.classList.add('hidden');
    document.body.style.pointerEvents = ''; // Re-enable interaction
  }, 1500);
}

/**
 * Flash HEX via Web Serial.
 */
async function flashHexWithWebSerial(port, hex) {
  const flasher = new WebSerialArduinoFlasher(port);
  try {
    await flasher.flash(hex);
    alert('Upload complete!');
  } catch (err) {
    alert('Upload failed: ' + err.message);
  }
}

/**
 * Main BBX App
 */
const App = {
  editor: null,
  port: null,

  // ---- Helpers ----
  cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  },

  debounce(fn, delay) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn(...args), delay);
    };
  },

  // ---- Scientist Name Button ----
  async fetchScientists() {
    const response = await fetch('assets/scientists.csv');
    const csvText = await response.text();
    const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });
    return parsed.data
      .map(row => ({ name: (row.name || '').trim(), link: (row.link || '').trim() }))
      .filter(s => s.name && s.link);
  },

  async assignScientist() {
    let stored = sessionStorage.getItem('assignedScientist');
    if (!stored) {
      const scientists = await this.fetchScientists();
      const random = scientists[Math.floor(Math.random() * scientists.length)];
      stored = JSON.stringify(random);
      sessionStorage.setItem('assignedScientist', stored);
    }
    return JSON.parse(stored);
  },

  setupScientistButton() {
    const userButton = document.getElementById('userButton');
    this.assignScientist().then(scientist => {
      userButton.textContent = `🤩 ${scientist.name}`;
      userButton.addEventListener('click', () => window.open(scientist.link, '_blank'));
    });
  },

  // ---- Monaco Editor ----
  setupMonacoTheme() {
    monaco.editor.defineTheme('bbx-theme', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'keyword', foreground: this.cssVar('--bugbox-orange').replace('#', ''), fontStyle: 'bold' },
        { token: 'type', foreground: this.cssVar('--bugbox-green').replace('#', '') },
        { token: 'identifier', foreground: this.cssVar('--bugbox-blue').replace('#', '') },
        { token: 'string', foreground: this.cssVar('--bugbox-purple').replace('#', '') },
        { token: 'number', foreground: this.cssVar('--bugbox-yellow').replace('#', '') },
        { token: 'comment', foreground: this.cssVar('--bugbox-border').replace('#', ''), fontStyle: 'italic' },
        { token: 'variable', foreground: this.cssVar('--bugbox-pink').replace('#', '') },
      ],
      colors: {
        'editor.background': this.cssVar('--bugbox-navy'),
        'editor.foreground': this.cssVar('--bugbox-grey'),
        'editorLineNumber.foreground': this.cssVar('--bugbox-border'),
        'editorLineNumber.activeForeground': this.cssVar('--bugbox-orange'),
        'editorCursor.foreground': this.cssVar('--bugbox-orange'),
        'editor.selectionBackground': this.cssVar('--bugbox-teal') + '55',
        'editor.lineHighlightBackground': '#2A2F4A',
        'editorIndentGuide.background': this.cssVar('--bugbox-grey-light'),
        'editorIndentGuide.activeBackground': this.cssVar('--bugbox-blue'),
  
        // NEW: Fix white scrollbar/margin area
        'scrollbarSlider.background': this.cssVar('--bugbox-border') + '33',
        'scrollbarSlider.hoverBackground': this.cssVar('--bugbox-border') + '55',
        'scrollbarSlider.activeBackground': this.cssVar('--bugbox-border') + '77',
        'editorOverviewRuler.background': this.cssVar('--bugbox-navy'),
        'editorGutter.background': this.cssVar('--bugbox-navy'),
        'editorWidget.background': this.cssVar('--bugbox-navy'),
      }
    });
  },

  setupMonacoEditor() {
    this.setupMonacoTheme();
    this.editor = monaco.editor.create(document.getElementById('editor'), {
      value: `// Bugbox Example Code
void setup() {
  Serial.begin(9600);
}

void loop() {
  Serial.println("Hello from BBX!");
  delay(1000);
}`,
      language: 'cpp',
      theme: 'bbx-theme',
      automaticLayout: true,
      fontSize: 14,
      fontFamily: 'Montserrat, sans-serif',
    });

    window.addEventListener('resize', this.debounce(() => this.editor.layout(), 150));
  },

  // ---- Init ----
  init() {
    this.setupScientistButton();
    this.setupMonacoEditor();

    const pushButton = document.getElementById('pushButton');
    if (pushButton) {
      pushButton.addEventListener('click', async () => {
        // Connect to device if not already
        if (!this.port) {
          try {
            this.port = await navigator.serial.requestPort();
            await this.port.open({ baudRate: 115200 });
            console.log('Bugbox connected.');
          } catch (err) {
            alert('No device selected. Upload cancelled.');
            return;
          }
        }

        // Countdown sequence
        await showCountdownSequence();

        // Fetch and flash precompiled hex
        try {
          const response = await fetch('assets/blink.hex');
          const hex = await response.text();
          await flashHexWithWebSerial(this.port, hex);
        } catch (err) {
          alert('Upload failed: ' + err.message);
        }
      });
    }
  }
};

// ---- App Entry ----
document.addEventListener('DOMContentLoaded', () => App.init());
