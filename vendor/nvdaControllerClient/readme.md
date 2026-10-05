# NVDA Controller Client (x64)

Official, unmodified `nvdaControllerClient.dll` from the NVDA 2026.2 Controller Client package.

- Source: https://download.nvaccess.org/releases/stable/nvda_2026.2_controllerClient.zip
- License: LGPL 2.1 (see `license.txt` and `docs/licenses/nvdaControllerClient-LGPL-2.1.txt`)
- SHA-256: `598b7ec3dc469814f571275929f676ce73834c469fbdb359a06fd4db4e0fc866`

HKA uses **only** `nvdaController_brailleMessage` and `nvdaController_testIfRunning`.
It does **not** call speech APIs on this DLL.

Verify integrity:

```bash
npm run verify:nvda-dll
```
