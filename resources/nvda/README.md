# NVDA Controller Client

Put the **x64** `nvdaControllerClient.dll` here. Get it from the
`nvda_<version>_controllerClient.zip` that NV Access publishes with each NVDA
release (https://download.nvaccess.org/releases/), using the same version as the
kiosk's NVDA. License: LGPL 2.1.

The build copies it to `resources/nvda/` in the packaged app
(`src/main/nvdaController.js`). The app lets braille and speech differ
(full auto-read text on braille while speech reads it in pieces), and stops
speech without injecting a Ctrl keystroke.

Without the DLL (or on Mac/dev), the app falls back to live regions and the
Ctrl hush, the same as before.
