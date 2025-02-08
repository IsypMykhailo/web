<script>
import AuthLayout from "../../layouts/AuthLayout.vue";
import Translation from "../../i18n/translation";
import {useAuthStore} from "@/stores/auth";
import {ref} from "vue";
import {storeToRefs} from "pinia";
import Logo from "@/components/Logo.vue";

export default {
  setup() {
    const store = useAuthStore()

    const canSendForm = store.Sending

    const { ErrorsValidation } = storeToRefs(store)
    const { successRegistration } = storeToRefs(store)

    const login =  ref()
    const email = ref()
    const password = ref()
    const fullname = ref()
    const repeatPassword = ref()

    const tryCreateUser = function () {
      store.tryRegister(email.value, login.value, password.value, fullname.value, repeatPassword.value)
    }

    return {
      tryCreateUser,
      canSendForm,
      login,
      email,
      password,
      repeatPassword,
      ErrorsValidation,
      successRegistration,
      fullname,
      Translation
    }
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
      <div v-else-if="this.successRegistration !== null" class="success-alert">{{ this.successRegistration }}</div>

      <div class="form-section auth-form-section">
        <span class="form-input-title auth-form-input-title">{{ $t('auth.full-name') }}</span>
        <input v-model="fullname" type="text" class="form-input auth-form-input">
      </div>

      <div class="form-section auth-form-section">
        <span class="form-input-title auth-form-input-title">{{ $t('auth.username') }}</span>
        <input v-model="login" type="text"  class="form-input auth-form-input">
      </div>

      <div class="form-section auth-form-section">
        <span class="form-input-title auth-form-input-title">{{ $t('auth.email') }}</span>
        <input v-model="email" type="email" class="form-input auth-form-input">
      </div>

      <div class="form-section auth-form-section">
        <span class="form-input-title auth-form-input-title">{{ $t('auth.password') }}</span>
        <input v-model="password" type="password" class="form-input auth-form-input">
      </div>

      <div class="form-section auth-form-section">
        <span class="form-input-title auth-form-input-title">{{ $t('auth.repeat-password') }}</span>
        <input v-model="repeatPassword" type="password" class="form-input auth-form-input">
      </div>

      <div class="form-check auth-form-section agree-check-box" style="display: inline-block">
        <input type="checkbox" class="form-check-input" id="checkBox" style="box-shadow: none;">
        <label class="form-check-label" for="checkBox" style="text-align: left">{{ $t('auth.agree-terms-and-conditions') }}
          <RouterLink class="link" :to="Translation.i18nRoute({ name: 'terms and conditions' })">"{{ $t('auth.terms-and-conditions') }}"</RouterLink>
        </label>
      </div>

      <div class="auth-form-buttons">
        <button class="button" type="button" @click="tryCreateUser" :disabled=canSendForm>{{ $t('auth.button-sign-up') }}</button>
<!--        <RouterLink class="button" :to="Translation.i18nRoute({ name: 'list of institutions' })"></RouterLink>-->
      </div>


      <span class="auth-form-footer-text">
        {{ $t('auth.link-to-sign-in') }}
        <RouterLink class="link" :to="Translation.i18nRoute({ name: 'sign in' })">{{ $t('auth.button-sign-in') }}</RouterLink>
      </span>
    </form>
  </AuthLayout>
</template>

<style scoped>
.error-alert {
  margin-bottom: 1rem;
}

.agree-check-box, .agree-check-box a {
  font-family: 'Raleway', sans-serif;
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 19px;
}
</style>