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
  params: {},
  commands: {
    ExportAllText,
  },
  helpText,
  copyright,
} as PluginDocs<typeof PLUGIN>
