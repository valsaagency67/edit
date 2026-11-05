// See all configuration options: https://remotion.dev/docs/config
// Each option also is available as a CLI flag: https://remotion.dev/docs/cli

// Note: When using the Node.JS APIs, the config file doesn't apply. Instead, pass options directly to the APIs

import { Config } from "@remotion/cli/config";

Config.setRspack(true);
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);

// En el entorno cloud no se puede descargar Chrome Headless Shell; usar el preinstalado.
import { existsSync } from "node:fs";
const PREINSTALLED_SHELL =
  "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";
if (existsSync(PREINSTALLED_SHELL)) {
  Config.setBrowserExecutable(PREINSTALLED_SHELL);
}
