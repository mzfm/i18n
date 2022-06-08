import { Bitmap, Scene_Boot, Window_Base } from "rmmz"
import { getGlobal, isRM, MZFMPlugin, overrideMethod, readFile, uuid } from "@mzfm/common"
import { ExportAllText } from "./commands/ExportAllText"
import { I18nData, LanguageSet } from "./types"

export interface I18nParams {
  i18nTag: string
  availableLanguages: LanguageSet[]
  fallbackLanguage: string
  gameTitle: string
}

const COMMANDS = {
  ExportAllText,
}

export const LOCALES_FOLDER = "./locales"

async function initialize(this: I18nPlugin) {
  if (!isRM()) return
  const { params, languages } = this
  const { availableLanguages, fallbackLanguage } = params
  for (const languageSet of availableLanguages) {
    const { code } = languageSet
    const dataString = await readFile(`${LOCALES_FOLDER}/${code}.json`)
    languages[code] = {
      ...languageSet,
      data: dataString ? JSON.parse(dataString) : {},
    }
  }
  params.fallbackLanguage = fallbackLanguage in languages ? fallbackLanguage : availableLanguages[0].code
  this.currentLanguage = (await getGlobal("language", { namespace: "mzfmconfs" })) || params.fallbackLanguage
  const i18n = this.i18n.bind(this)
  MZFM.i18n = i18n
  // Game title
  overrideMethod(Scene_Boot, "updateDocumentTitle", () => {
    console.log(document.title)
    document.title = this.i18n(params.gameTitle)
    console.log(document.title)
  })
  // Text
  overrideMethod(Window_Base, "convertEscapeCharacters", (f, text) => i18n(f(i18n(text))))
  // Drawing text
  const drawingTextEx = new Set<string>()
  const getDrawingText = (text: string | number) => (drawingTextEx.size > 0 ? "" + text : i18n(text))
  overrideMethod(Window_Base, "drawTextEx", (f, ...args) => {
    const id = uuid()
    drawingTextEx.add(id)
    const result = f(...args)
    drawingTextEx.delete(id)
    return result
  })
  overrideMethod(Bitmap, "drawText", (f, text, ...args) => f(getDrawingText(text), ...args))
  overrideMethod(Bitmap, "measureTextWidth", (f, text) => f(getDrawingText(text)))
  // eslint-disable-next-line @typescript-eslint/ban-types
  overrideMethod(String, "format", function (this: String, f, ...args) {
    return f.call(i18n(this as string), ...args)
  })
}

class I18nPlugin extends MZFMPlugin<I18nParams, typeof COMMANDS> {
  public tagRegex!: RegExp
  public currentLanguage!: string
  public languages: Record<string, LanguageSet & { data: I18nData }> = {}
  constructor() {
    super("MZFM_I18n", COMMANDS, initialize)
    if (!isRM()) return
    const { i18nTag } = this.params

    this.tagRegex = new RegExp(
      i18nTag.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&").replace(/~key~/g, "(?<key>.+?)")
    )
  }

  public getEntry(key: string, language?: string): string | undefined {
    const { languages, currentLanguage, params } = this
    const { fallbackLanguage } = params
    const keys = key.split(".")
    const lang = language || currentLanguage
    const data = languages[lang].data
    let v: I18nData | string = data
    for (const k of keys) {
      if (typeof v === "string") return undefined
      if (v === undefined) break
      v = v[k]
    }
    if (typeof v === "string") return v
    return !language && lang !== fallbackLanguage ? this.getEntry(key, fallbackLanguage) : undefined
  }

  public i18n(text: string | number | undefined | null): string {
    if (text === undefined || text === null) return ""
    text = "" + text
    let keepGoing = true
    while (keepGoing) {
      keepGoing = false
      text = text.replace(this.tagRegex, (_, k) => ((keepGoing = true), this.getEntry(k) || k))
    }
    return text
  }
}

export const PLUGIN = new I18nPlugin()
