# RESULT de PATCH-139

- Fecha: 2026-10-26T02:08:05.927Z
- Estado: APLICADO
- Resumen: BL-070 CTA-5 (1/2): el panel viejo de Cuentas deja de cargarse (index.html sin js/accounts-panel.js, router sin Accounts.activate) y los tests viejos dejan de leerlo; techos de tamaño al día.

| Archivo | Blob antes | Blob después | Bytes |
|---|---|---|---|
| `index.html` | `4d0d4d5d70f4aa312d0aac7fd383acb4630e9120` | `c1b51f32e18840e944af089c0e0f7595ab757e6d` | 54909 |
| `js/router.js` | `09b30dcf83e21b07a0b95d4d02ff76d53d1de637` | `7ec9d842468077c830ac3911015e5c3883893560` | 63097 |
| `tools/size-budget.json` | `a766656d2773ed0809f2ee126bb5f940d2bbc835` | `711b38fa1b0238b07a028413741d07893cd5de17` | 1844 |
| `tests/idea55.account-layer.test.js` | `c46c723d1f3848e4cf957e08487f62c19d4a5cba` | `17b2917d76efd4bf041f24eb74c60f144ae119db` | 10909 |
| `tests/idea61-claves-congeladas.test.js` | `b1ae9f2020324fe6cbeff325dc5f7f673f7bb723` | `6d0a4647c5979d26032d1e185659498dfd435819` | 26821 |
| `tests/hb111-puerta-import.test.js` | `ade5066577548b7d479461ac34a988086d858bc1` | `22c12eacbc79cc32259e55d68943267d153845b0` | 13403 |
| `tests/acc-vault-view.test.cjs` | `bb7cef1c4f4a0622cfc8d8a18fe30729a607c15d` | `513fd6b0adc19236486a24356e6d84915c2e73f0` | 15709 |
| `tests/idea64-dos-pestanas.test.js` | `4a926c9a3028569fb0e7dde76d066a3278303634` | `6556d278839f47a96e2fc1fc067faf02cd80cd81` | 28417 |

- Suite de tests: verde antes y después.
