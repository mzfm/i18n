import { Bitmap, Scene_Boot, Window_Base, Window_Options, OptionSymbol } from "rmmz"
import { getGlobal, isRM, MZFMPlugin, overrideMethod, readFile, uuid, setGlobal } from "@mzfm/common"
import { ExportAllText } from "./commands/ExportAllText"
import { I18nData, LanguageSet } from "./types"

export interface I18nParams {
  i18nTag: string
  availableLanguages: LanguageSet[]
  fallbackLanguage: string
  gameTitle: string
  optionMenuEnabled: "Enabled" | "Disabled"
  optionMenuLabel: string
}

const COMMANDS = {
  ExportAllText,
}

export const LOCALES_FOLDER = "./locales"

type MZFMOptionSymbol = OptionSymbol | "mzfm_language"

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
  this._currentLanguage = (await getGlobal("language", { namespace: "mzfmconfs" })) || params.fallbackLanguage
  const i18n = this.i18n.bind(this)
  MZFM.i18n = i18n
  // Game title
  overrideMethod(Scene_Boot, "updateDocumentTitle", () => {
    document.title = this.i18n(params.gameTitle)
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
  overrideMethod(String, "format", function (this, f, ...args) {
    return f.call(i18n(this as string), ...args)
  })
  // Option menu
  const optionMenuEnabled = params.optionMenuEnabled.toLowerCase() === "enabled"
  if (optionMenuEnabled) {
    this.addToOptionMenu()
  }
}

class I18nPlugin extends MZFMPlugin<I18nParams, typeof COMMANDS> {
  public tagRegex!: RegExp
  public _currentLanguage!: string
  public languages: Record<string, LanguageSet & { data: I18nData }> = {}

  constructor() {
    super("MZFM_I18n", COMMANDS, initialize)
    if (!isRM()) return
    const { i18nTag } = this.params

    this.tagRegex = new RegExp(
      i18nTag.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&").replace(/~key~/g, "(?<key>.+?)")
    )
  }

  public get currentLanguage(): string {
    return this._currentLanguage
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

  public async setLanguage(languageCode: string) {
    if (languageCode in this.languages) {
      this._currentLanguage = languageCode
      await setGlobal("language", languageCode, { namespace: "mzfmconfs" })
    }
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

  public addToOptionMenu() {
    const { optionMenuLabel } = this.params
    const { languages } = this
    const keys = Object.keys(languages)
    let currentIndex = keys.indexOf(this.currentLanguage)
    const setIndex = (change: number) => {
      currentIndex = (currentIndex + change) % keys.length
      this.setLanguage(keys[currentIndex])
    }

    overrideMethod(Window_Options, "makeCommandList", function (this, f) {
      f()
      this.addCommand(optionMenuLabel, "mzfm_language")
    })
    overrideMethod(Window_Options, "statusText", function (this, f, i) {
      const symbol = this.commandSymbol(i)
      return symbol === "mzfm_language" ? languages[keys[currentIndex]].name : f(i)
    })
    overrideMethod(Window_Options, "getConfigValue", (f, symbol: MZFMOptionSymbol) => {
      if (symbol === "mzfm_language") {
        return keys.indexOf(this.currentLanguage)
      }
      return f(symbol)
    })
    overrideMethod(Window_Options, "setConfigValue", function (this, f, symbol: MZFMOptionSymbol, volume) {
      if (symbol === "mzfm_language") {
        setIndex(volume ? 1 : -1)
        this.refresh()
      } else {
        f(symbol, volume)
      }
    })
  }
}

export const PLUGIN = new I18nPlugin()
