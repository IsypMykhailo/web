import { createI18n } from "vue-i18n"
import uk from "./locales/uk.json"

export default createI18n({
    locale: "uk",
    fallbackLocale: "en",
    legacy: false,
    globalInjection: true,
    messages: { uk },
    runtimeOnly: false,
})