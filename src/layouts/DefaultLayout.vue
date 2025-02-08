<script>
import ProfileDropdown from "../components/controls/ProfileDropdown.vue";
import ThemeSwitcher from "../components/controls/ThemeSwitcher.vue";
import LanguageSwitcher from "../components/controls/LanguageSwitcher.vue";
import Logo from "../components/Logo.vue";
import Translation from "@/i18n/translation";
export default {
  setup() {
    return { Translation }
  },
  components: {Logo, LanguageSwitcher, ThemeSwitcher, ProfileDropdown},
  props: {
      showLinks: {
          default: false
      }
  }
}
</script>

<template>
  <div class="wrapper">
    <div class="container">
      <header class="d-flex flex-wrap align-items-center justify-content-center py-3">


          <ul class="nav" style="margin-right: auto">
              <li>
                  <RouterLink to="/" class="d-flex px-2 me-auto text-decoration-none">
                      <!--          <h2 class="mb-0">{{ $t('gribble-name') }}</h2>-->
                      <Logo class="logo"/>
                  </RouterLink>
              </li>
              <li v-if="showLinks">
                <RouterLink class="nav-link link px-2" :to="Translation.i18nRoute({ name: 'home' })">
                  <span>{{ $t('nav.home') }}</span>
                </RouterLink>
              </li>
              <li v-if="showLinks">
                  <RouterLink class="nav-link link px-2" :to="Translation.i18nRoute({ name: 'list of institutions' })">
                    <span>{{ $t('nav.institutions') }}</span>
                </RouterLink>
              </li>
          </ul>

        <ul class="nav d-flex flex-wrap align-items-center justify-content-center">
          <li><ThemeSwitcher class="px-2"/></li>
          <li><LanguageSwitcher class="px-2"/></li>
          <li><ProfileDropdown :show-username="true" class="px-2"/></li>
        </ul>
      </header>
    </div>
  </div>

  <slot></slot>
</template>

<style scoped>
.wrapper {
  background-color: var(--background-color);
  border-bottom: 1px solid var(--border-color);
  margin-bottom: var(--default-layout-margin);
}
</style>