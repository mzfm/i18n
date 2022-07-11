import { MZFMCommand, isLocalTest, mkpath, fs, path } from "@mzfm/common"
import { LOCALES_FOLDER, PLUGIN } from "../plugin"
import { I18nData } from "../types"

const makeKey = (...keys: string[]) => PLUGIN.params.i18nTag.replace("~key~", keys.join("."))

const exportList = (
  data: I18nData,
  mapKey: string,
  eventKey: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  list: any[]
) => {
  if (!list) return
  let t = 0
  const setI18n = (value: string) => {
    const key = `${eventKey}t${(t++).toString().padStart(3, "0")}`
    ;(data[mapKey] as I18nData)[key] = value
    return makeKey(mapKey, key)
  }
  for (const command of list) {
    switch (command.code) {
      case 401:
      case 405:
        // Text
        command.parameters[0] = setI18n(command.parameters[0])
        break
      case 102: // Choices
        command.parameters[0] = command.parameters[0].map(setI18n)
        break
    }
  }
}

const exportEvent = (
  data: I18nData,
  mapKey: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  event: any
) => {
  if (!event) return
  const eventKey =
    event.name &&
    event.name.length <= 8 &&
    event.name.match(/^[a-zA-Z0-9_-]+$/) &&
    !Object.keys(data[mapKey]).some((x) => x.startsWith(event.name.toLowerCase()))
      ? event.name.toLowerCase()
      : `e${event.id}`
  if (event.pages) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(event.pages as any[]).forEach((page, i) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      exportList(data, mapKey, `${eventKey}p${i}`, page.list as any[])
    )
  }
  if (event.list) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    exportList(data, mapKey, eventKey, event.list as any[])
  }
}

const exportFile = (data: I18nData, dataFolder: string, localesDataFolder: string, filename: string) => {
  const file = path.join(dataFolder, `${filename}.json`)
  console.log(`Exporting ${filename}...`)
  if (filename === "Stamp") {
    console.log("Skipped")
    return
  }
  const fileData = JSON.parse(fs.readFileSync(file, "utf8"))
  if (filename !== "MapInfos" && filename.startsWith("Map")) {
    const mapKey = filename.toLowerCase()
    data[mapKey] = {}
    ;(data["$map"] as I18nData)[mapKey] = fileData["displayName"]
    fileData["displayName"] = makeKey("$map", mapKey)
    if (!fileData["events"]) return
    for (const event of fileData["events"]) {
      exportEvent(data, mapKey, event)
    }
  } else if (filename === "CommonEvent") {
    for (const event of fileData) {
      exportEvent(data, "$common", event)
    }
  } else if (filename === "Items") {
    for (const item of fileData) {
      if (!item) continue
      const { id, name, description } = item
      ;(data["$item"] as I18nData)[`n${id}`] = name
      ;(data["$item"] as I18nData)[`d${id}`] = description
      item.name = makeKey("$item", `n${id}`)
      item.description = makeKey("$item", `d${id}`)
    }
  } else {
    console.log("Skipped")
    return
  }
  fs.writeFileSync(path.join(localesDataFolder, `${filename}.json`), JSON.stringify(fileData))
}

export const ExportAllText: MZFMCommand = {
  run: async () => {
    if (!isLocalTest()) {
      alert("This command is only available in local test run.")
      return
    }
    const localesFolder = path.resolve(LOCALES_FOLDER)
    const localesDataFolder = path.resolve(localesFolder, "data")
    fs.rmdirSync(localesDataFolder, { recursive: true })
    mkpath(localesDataFolder)
    const dataFolder = path.resolve("./data")
    alert(`Data folder: ${dataFolder}`)
    const files = fs.readdirSync(dataFolder)
    const data: I18nData = {
      $map: {},
      $item: {},
      $common: {},
    }
    for (const file of files) {
      if (!file.endsWith(".json")) continue
      const filename = file.slice(0, -5)
      exportFile(data, dataFolder, localesDataFolder, filename)
    }
    alert(`Exporting all text to ${localesFolder}`)
    const language = prompt("Language code?", "en-US")
    fs.writeFileSync(path.join(localesFolder, `${language}.json`), JSON.stringify(data, undefined, 2))
    alert(
      `Export complete! Please move the new data files from ${path.join(
        localesFolder,
        "data"
      )} to ${dataFolder}`
    )
  },
}
