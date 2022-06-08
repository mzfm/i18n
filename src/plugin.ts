import { MZFMPlugin } from "@mzfm/common"
import { ExportAllText } from "./commands/ExportAllText"

const DEFUALT_PARAMS = {}

const COMMANDS = {
  ExportAllText,
}

export const LOCALES_FOLDER = "./locales"
const initialize = () => {
  console.log("Initializing...")
}

export const PLUGIN: MZFMPlugin<typeof DEFUALT_PARAMS, typeof COMMANDS> = {
  name: "MZFM_I18n",
  default_params: DEFUALT_PARAMS,
  commands: COMMANDS,
  initialize,
}
