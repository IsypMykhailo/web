import {createApp, markRaw} from 'vue'
import { createPinia } from 'pinia'
import i18n from "./i18n";

import App from './App.vue'
import router from './router'

import './assets/main.css'
import {useAuthStore} from "./stores/auth";

const app = createApp(App)

const pinia = createPinia()
pinia.use(({ store }) => {
    store.$router = markRaw(router)
});

router.beforeEach((to, from, next) => {
    const logedStore = useAuthStore()
    if (to.name === 'sign in' && logedStore.isAuthenticated) next({ name: 'list of institutions' })
    else if (to.name === 'sign up' && logedStore.isAuthenticated) next({ name: 'list of institutions' })
    else if (to.name === 'list of institutions' && !logedStore.isAuthenticated) next({ name: 'sign in' })
    else if (to.name === 'create institution' && !logedStore.isAuthenticated) next({ name: 'sign in' })
    else if (to.name === 'institution' && !logedStore.isAuthenticated) next({ name: 'sign in' })
    else next()
})

app.use(pinia)
app.use(router)
app.use(i18n)

app.mount('#app')
