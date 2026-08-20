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
  invoke: (channel, data) => {
    const validChannels = ["volume-up", "volume-down"];
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, data);
    }
    return Promise.resolve(null);
  },
  on: (channel, cb) => {
    const validChannels = ["fromMain"];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (e, ...args) => cb(...args));
    }
  },
});
