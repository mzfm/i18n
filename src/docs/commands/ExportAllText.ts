import { PluginCommandDocs } from "@mzfm/common/dist/docs"
import { ExportAllText } from "../../commands/ExportAllText"

export const DOCS: PluginCommandDocs<typeof ExportAllText> = {
  description: "Export all text to locale files.",
  args: {},
}
