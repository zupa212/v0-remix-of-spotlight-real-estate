// i18n utilities
import { adminDict, type Locale } from "./admin"

export function getAdminDict(locale: Locale = "en") {
  return adminDict[locale] || adminDict.en
}

export { adminDict, type Locale }


