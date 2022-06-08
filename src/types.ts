export interface LanguageSet {
  code: string
  name: string
  fontFamily: string
}

export interface I18nData {
  [key1: string]: {
    [key2: string]: string
  }
}
export interface I18nDataAll {
  [languageCode: string]: I18nData
}
