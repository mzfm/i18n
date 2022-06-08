import { MZFMPlugin } from "@mzfm/common"
import { SetLanguage } from "./commands/SetLanguage"

const DEFUALT_PARAMS = {}
const COMMANDS = {
  SetLanguage,
}
export const PLUGIN: MZFMPlugin<typeof DEFUALT_PARAMS, typeof COMMANDS> = {
  name: "MZFM_I18n",
  default_params: DEFUALT_PARAMS,
  commands: COMMANDS,
}
