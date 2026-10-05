const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("kioskApi", {
  send: (channel, data) => {
    const validChannels = [
      "toMain",
      "toggle-tts",
      "volume-up",
      "volume-down",
      "stop-speech",
    ];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  on: (channel, cb) => {
    const validChannels = ["fromMain"];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (e, ...args) => cb(...args));
    }
  },
  /**
   * Push a braille-only page via NVDA Controller Client.
   * Does not speak. Safe no-op when bridge/NVDA is unavailable.
   */
  brailleMessage: (text, options = {}) =>
    ipcRenderer.invoke("nvda:braille-message", {
      text,
      force: Boolean(options.force),
      source: options.source || null,
    }),
  brailleStatus: () => ipcRenderer.invoke("nvda:braille-status"),
  brailleTest: () => ipcRenderer.invoke("nvda:braille-test"),
});
