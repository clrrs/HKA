const { contextBridge, ipcRenderer } = require("electron");

const VALID_POLITENESS = ["assertive", "polite"];

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
  },
  announce: (payload) => {
    if (!payload || typeof payload.text !== "string" || !payload.text) return;

    const sanitized = {
      text: payload.text.slice(0, 1000),
      brailleText: typeof payload.brailleText === "string"
        ? payload.brailleText.slice(0, 200)
        : undefined,
      politeness: VALID_POLITENESS.includes(payload.politeness)
        ? payload.politeness
        : "assertive",
      interrupt: !!payload.interrupt,
      source: typeof payload.source === "string" ? payload.source.slice(0, 50) : "unknown",
      eventType: typeof payload.eventType === "string" ? payload.eventType.slice(0, 50) : undefined,
      correlationId: typeof payload.correlationId === "string" ? payload.correlationId : undefined,
      timestamp: typeof payload.timestamp === "number" ? payload.timestamp : Date.now(),
    };

    console.log(
      `[preload] kiosk:announce cid=${sanitized.correlationId} text="${sanitized.text}"`
    );
    ipcRenderer.send("kiosk:announce", sanitized);
  },
});

