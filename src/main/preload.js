const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("kioskApi", {
  send: (channel, data) => {
    const validChannels = [
      "toMain",
      "toggle-tts",
      "volume-up",
      "volume-down",
      "stop-speech",
      "nvda-speak",
      "nvda-braille",
    ];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  invoke: (channel, data) => {
    const validChannels = ["nvda-available"];
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, data);
    }
    return Promise.resolve(undefined);
  },
  on: (channel, cb) => {
    const validChannels = ["fromMain"];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (e, ...args) => cb(...args));
    }
  },
});
