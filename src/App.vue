<script>
import {useUserThemeStore} from "./stores/user-theme";


export default {
  mounted() {
    const userThemeStore = useUserThemeStore()
    const initUserTheme = userThemeStore.getTheme() || userThemeStore.getMediaPreference();
    userThemeStore.setTheme(initUserTheme);
  }
}
</script>

<template>
  <RouterView :key="this.$route.fullPath"></RouterView>
</template>
