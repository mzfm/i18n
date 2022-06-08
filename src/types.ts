export interface LanguageSet {
  code: string
  name: string
  fontFamily: string
}

export interface I18nData {
  [key: string]: string | I18nData
}
