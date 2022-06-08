import { Game_Interpreter } from "rmmz"
import { MZFMCommand, PluginCommandDocs, overrideMethod, MZFMInterpreter } from "@mzfm/common"

export interface SetLanguageArgs {
  name: string
}

export const SetLanguage: MZFMCommand<SetLanguageArgs> = {
  setGlobal: true,
  initialize: (commandName: string) => {
    console.log(`Initializing ${commandName}`)
    overrideMethod(
      Game_Interpreter,
      "setup",
      function (this: MZFMInterpreter, original, ...args) {
        console.log("Setup")
        original.call(this, ...args)
      }
    )
    return true
  },
  run: function (ctx, args) {
    const { name } = args
    console.log(`SetLanguage, ${name}!`)
  },
}

export const DOCS: PluginCommandDocs<typeof SetLanguage> = {
  description: "Example SetLanguage Command",
  args: {
    name: {
      text: "Name",
      description: "The name to say SetLanguage to",
      default: "World",
      type: String,
    },
  },
}
