import { PluginCommandDocs } from "@mzfm/common/dist/docs"
import { SetLanguage } from "../../commands/SetLanguage"

export const DOCS: PluginCommandDocs<typeof SetLanguage> = {
  description: "Set the language of the game.",
  args: {
    languageCode: {
      text: "Language code",
      description: "The language code to set. Must be in the available list.",
    },
  },
}
