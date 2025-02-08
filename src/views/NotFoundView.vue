<script setup>
import Translation from "../i18n/translation";
</script>

<template>
  <div class="center-screen">
    <div style="display: inline-flex">
      <h1 style="font-weight: bold; margin-right: .5rem">404</h1>
      <h1>{{ $t('not-found.main-text') }}</h1>
    </div>

    <RouterLink :to="Translation.i18nRoute({ name: 'home' })" class="link">{{ $t('not-found.button-return-home') }}</RouterLink>
  </div>
</template>

<style scoped>
.center-screen {
  flex-direction: column;
}
</style>