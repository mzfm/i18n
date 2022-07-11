import { MZFMCommand } from "@mzfm/common"
import { PLUGIN } from "../plugin"

export interface SetLanguageArgs {
  languageCode: string
}

export const SetLanguage: MZFMCommand<SetLanguageArgs> = {
  initialize: () => {
    MZFM.setLanguage = PLUGIN.setLanguage.bind(PLUGIN)
  },
  run: ({ languageCode }) => PLUGIN.setLanguage(languageCode),
}
