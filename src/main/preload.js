const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("kioskApi", {
  send: (channel, data) => {
    const validChannels = ["toMain", "toggle-tts", "volume-up", "volume-down"];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  on: (channel, cb) => {
    const validChannels = ["fromMain"];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (e, ...args) => cb(...args));
    }
  }
});

