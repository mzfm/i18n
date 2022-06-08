import { docs, docsEnabled, PluginDocs } from "@mzfm/common"
import { DOCS as ExportAllText } from "./commands/ExportAllText"
import { PLUGIN } from "./plugin"
import packageConfig from "../package.json"

const { name: projectName, author, description, version } = packageConfig

const copyright = `
Copyright (c) 2022 Vilja <i@vilja.me>

License: The MIT License.
`
const helpText = ""

export default {
  name: PLUGIN.name,
  projectName,
  author,
  version,
  title: "MZFM Plugin",
  targets: ["MZ"],
  description,
  url: "https://github.com/mzfm/i18n",
  params: {
    i18nTag: docs("I18n tag", "The tag to use for i18n. Use ~key~ to be replaced with the key.", "#{~key~}"),
    availableLanguages: {
      text: "Available languages",
      description: "The languages that are available for the plugin.",
      type: [
        {
          key: "LanguageSet",
          fields: {
            code: docs("Language code", "The code of the language, e.g., en-US, zh-Hans."),
            name: docs("Language name", "The name of the language, e.g., English, 简体中文."),
            fontFamily: docs("Font family", "The font family of the language."),
          },
        },
      ],
    },
    fallbackLanguage: docs(
      "Fallback language",
      "The code of the fallback language to use when key is not found in current language."
    ),
    gameTitle: docs("Game title", "The i18n key to use for the game title.", "#{$system.title}"),
    optionMenuEnabled: docsEnabled("Shown in option menu"),
    optionMenuLabel: docs("Label in option menu", "The label of the option.", "#{$system.language}"),
  },
  commands: {
    ExportAllText,
  },
  helpText,
  copyright,
} as PluginDocs<typeof PLUGIN>
