import { MZFMCommand, PluginCommandDocs, setGlobal } from "@mzfm/common"
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

export const DOCS: PluginCommandDocs<typeof SetLanguage> = {
  description: "Set the language of the game.",
  args: {
    languageCode: {
      text: "Language code",
      description: "The language code to set. Must be in the available list.",
    },
  },
}
