import { MZFMCommand, PluginCommandDocs } from "@mzfm/common"
import { PLUGIN } from "../plugin"

export interface SetLanguageArgs {
  languageCode: string
}

const setLanguage = (languageCode: string) => {
  if (languageCode in PLUGIN.languages) {
    PLUGIN.currentLanguage = languageCode
  }
}

export const SetLanguage: MZFMCommand<SetLanguageArgs> = {
  initialize: () => {
    MZFM.setLanguage = setLanguage
  },
  run: ({ languageCode }) => setLanguage(languageCode),
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
