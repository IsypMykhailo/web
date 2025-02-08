<script>
import AuthLayout from "../../layouts/AuthLayout.vue";
import Translation from "../../i18n/translation";
import {useAuthStore} from "../../stores/auth";
import {ref} from "vue";
import {storeToRefs} from "pinia";
import Logo from "@/components/Logo.vue";
export default {
  setup() {
    const store = useAuthStore()
    const emailOrLogin = ref()
    const password = ref()
    const tryLogin = function () {
      store.tryLogin(emailOrLogin.value, password.value)
    }

    const { ErrorsValidation } = storeToRefs(store)
    const canSendLoginForm = store.Sending
    return {
      emailOrLogin,
      password,
      tryLogin,
      ErrorsValidation,
      canSendLoginForm,
      Translation }
  },
  components: {Logo, AuthLayout }
}
</script>

<template>
  <AuthLayout>
    <form class="auth-form">
      <h1 class="auth-form-title">
        <Logo class="logo logo-large"/>
      </h1>
      <div v-if="this.ErrorsValidation !== null" class="error-alert">{{ this.ErrorsValidation }}</div>

      <div class="form-section auth-form-section">
        <span class="form-input-title auth-form-input-title">{{ $t('auth.username-or-email') }}</span>
        <input v-model="emailOrLogin" type="text" class="form-input auth-form-input">
      </div>
      <div class="form-section auth-form-section">
        <span class="form-input-title auth-form-input-title">{{ $t('auth.password') }}</span>
          <input v-model="password" type="password" class="form-input auth-form-input">
      </div>

      <div class="auth-form-buttons">
        <button type="button" class="button" @click="tryLogin" :disabled=canSendLoginForm>{{ $t('auth.button-sign-in') }}</button>
<!--        <RouterLink class="button" :to="Translation.i18nRoute({ name: 'list of institutions' })"></RouterLink>-->
      </div>

      <span class="auth-form-footer-text">
          {{ $t('auth.link-to-sign-up') }}
          <RouterLink class="link" :to="Translation.i18nRoute({ name: 'sign up' })">{{ $t('auth.button-sign-up') }}</RouterLink>
      </span>
    </form>
  </AuthLayout>
</template>

<style scoped>
.error-alert {
    margin-bottom: 1rem;
}
</style>