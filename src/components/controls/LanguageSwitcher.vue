<script>
import { useI18n } from 'vue-i18n'
import { useRouter } from "vue-router"
import Translation from "../../i18n/translation"

export default {
  setup() {
    const { locale } = useI18n()
    const supportedLocales = Translation.supportedLocales
    const router = useRouter()

    const switchLanguage = async (newLocale) => {
      await Translation.switchLanguage(newLocale)
      try {
        await router.replace({ params: { locale: newLocale } })
      } catch(e) {
        console.error(e)
        await router.push("/")
      }
    }
    return { locale, supportedLocales, switchLanguage }
  }
}
</script>

<template>
  <div class="dropdown">
    <span class="d-block text-decoration-none dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
      <img :src="'/flags/' + locale + '.png'" :alt="locale" class="flag">
    </span>
    <ul class="dropdown-menu text-small">
      <li v-for="sLocale in supportedLocales"
          @click="switchLanguage(sLocale)"
          class="dropdown-item">
        <img :src="'/flags/' + sLocale + '.png'" :alt="sLocale" class="flag">
        <span>{{ $t(`locale.${sLocale}`) }}</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.dropdown-menu {
  min-width: 0;
}

.dropdown-item {
  display: inline-flex;
  align-items: center;
}

.dropdown-item span {
  padding-left: .5rem;
}

.flag {
  width: 1.75rem;
  height: 1.75rem;
}
</style>