<script>
import Translation from "../../i18n/translation";
import {useAuthStore} from "../../stores/auth";
import {useUserStore} from "../../stores/user";
export default {
  name: "ProfileDropdown",
  setup() {
    const storeUser = useUserStore()
    const store = useAuthStore()
    const login =  storeUser.user.login
    return { Translation, store, login }
  },
  props: {
    showUsername: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<template>
  <div class="dropdown">
    <span class="d-block text-decoration-none dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
      <img src="https://github.com/tyulyukov.png" alt="pfp" width="32" height="32" class="rounded-circle">
      <strong  class="ms-1 pc-only">{{ login }}</strong>
    </span>
    <ul class="dropdown-menu text-small">
      <li><RouterLink :to="Translation.i18nRoute({ name: 'my profile' })" class="dropdown-item"><span>{{ $t('nav.profile') }}</span></RouterLink></li>
      <li><RouterLink :to="Translation.i18nRoute({ name: 'my profile' })" class="dropdown-item"><span>{{ $t('nav.settings') }}</span></RouterLink></li>
      <li><hr class="dropdown-divider"></li>
      <li><button @click="store.UserLogout()" class="dropdown-item">{{ $t('nav.sign-out') }}</button></li>
    </ul>
  </div>
</template>