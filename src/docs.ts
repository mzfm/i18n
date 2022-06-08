import { PluginDocs } from "@mzfm/common"
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
    i18nTag: {
      text: "I18n tag",
      description: "The tag to use for i18n. Use ~key~ to be replaced with the key.",
      default: "#{~key~}",
    },
    availableLanguages: {
      text: "Available languages",
      description: "The languages that are available for the plugin.",
      type: [
        {
          key: "LanguageSet",
          fields: {
            code: {
              text: "Language code",
              description: "The code of the language, e.g., en-US, zh-Hans.",
            },
            name: {
              text: "Language name",
              description: "The name of the language, e.g., English, 简体中文.",
            },
            fontFamily: {
              text: "Font family",
              description: "The font family of the language.",
            },
          },
        },
      ],
    },
    fallbackLanguage: {
      text: "Fallback language",
      description: "The code of the fallback language to use when key is not found in current language.",
    },
    gameTitle: {
      text: "Game title",
      description: "The i18n key to use for the game title.",
      default: "#{$system.title}",
    },
  },
  commands: {
    ExportAllText,
  },
  helpText,
  copyright,
} as PluginDocs<typeof PLUGIN>
