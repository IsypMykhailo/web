<script>
import Translation from "../../i18n/translation";
import {storeToRefs} from "pinia";
import {useUserStore} from "../../stores/user";
import {useRoute} from "vue-router";
export default {
  setup()
  {
    const route = useRoute()
    const store = useUserStore()
    const { errorsMsg } = storeToRefs(store)
    const { successMsg } = storeToRefs(store)
    store.emailConfirm(route.query.token)
    return {
      Translation, errorsMsg, successMsg
    }
  },
}
</script>

<style scoped>

</style>
<template>
    <form class="auth-form">
    <h1 class="auth-form-title">Confirm Email</h1>
    <div v-if="this.errorsMsg !== null" class="error-alert">{{ this.errorsMsg }}</div>
    <div v-else-if="this.successMsg !== null" class="success-alert">{{ this.successMsg }}</div>

    <div class="auth-form-buttons">
             <RouterLink class="button" :to="Translation.i18nRoute({ name: 'sign in' })">Return to login</RouterLink>
    </div>


    </form>
</template>

