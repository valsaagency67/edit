// See all configuration options: https://remotion.dev/docs/config
// Each option also is available as a CLI flag: https://remotion.dev/docs/cli

// Note: When using the Node.JS APIs, the config file doesn't apply. Instead, pass options directly to the APIs

import { Config } from "@remotion/cli/config";

Config.setRspack(true);
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);

// En el entorno cloud no se puede descargar Chrome Headless Shell; usar el preinstalado (la versión cambia
// entre entornos, así que se busca la carpeta chromium_headless_shell-* que haya).
import { existsSync, readdirSync } from "node:fs";
const PW = "/opt/pw-browsers";
const shell = existsSync(PW)
  ? readdirSync(PW)
      .filter((d) => d.startsWith("chromium_headless_shell-"))
      .flatMap((d) => [
        `${PW}/${d}/chrome-headless-shell-linux64/chrome-headless-shell`,
        `${PW}/${d}/chrome-linux/headless_shell`,
      ])
      .find((p) => existsSync(p))
  : undefined;
if (shell) {
  Config.setBrowserExecutable(shell);
}
