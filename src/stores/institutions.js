import {defineStore} from "pinia";
import {combineUrl} from "../utils/url-helper";
import {schedulerServiceUrlV1} from "../configs/scheduler-service";
import Translation from "../i18n/translation";
import {useAuthStore} from "./auth";
import i18n from "../i18n/index"

export const useInstitutionsStore = defineStore('institutions', {
    state: () => ({
        institutions: null,
        loading: false,
        error: null,
        creatingLoading: false,
        creatingError: null,
        creatingValidationFailure: null
    }),
    actions: {
        loadInstitutions() {
            this.$reset()

            this.loading = true

            fetch(combineUrl(schedulerServiceUrlV1, 'institutions/all'), {
                method: 'GET',
                headers: {
                    'Authorization': useAuthStore().jwt,
                    'Content-Type': 'application/json'
                }
            })
                .then(res => {
                    this.loading = false

                    if (res === null || res === undefined || res.status === 500)
                    {
                        this.error = i18n.global.t('errors.internal-error')
                    }
                    else if (res.status === 200) {
                        return res.json()
                    }
                    else if (res.status === 401) {
                        // logout or whatever
                        this.error = i18n.global.t('errors.no-authentication')
                    }
                })
                .then(response => {
                    if (response === null || response === undefined) {
                        return;
                    }

                    if (response.data === null) {
                        this.error = i18n.global.t('errors.internal-error')
                        return
                    }

                    this.institutions = response.data
                })
                .catch(() => {
                    this.loading = false
                    this.error = i18n.global.t('errors.no-connection')
                })
        },
        clearErrors() {
            this.error = null
            this.creatingError = null
            this.creatingValidationFailure = null
            this.loading = false
            this.creatingLoading = false
        },
        createInstitution(name, description) {
            this.creatingError = null
            this.creatingValidationFailure = null
            this.creatingLoading = true

            fetch(combineUrl(schedulerServiceUrlV1, 'institutions/create/'), {
                method: 'POST',
                headers: {
                    'Authorization': useAuthStore().jwt,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({name, description})
            })
                .then(res => {
                    this.creatingLoading = false

                    if (res === null || res === undefined || res.status === 500)
                    {
                        this.creatingError = i18n.global.t('errors.internal-error')
                    }
                    else if (res.status === 201) {
                        return res.json()
                    }
                    else if (res.status === 400) {
                        return res.json()
                    }
                    else if (res.status === 401) {
                        // logout or whatever
                        this.creatingError = i18n.global.t('errors.no-authentication')
                    }
                })
                .then(response => {
                    if (response === null || response === undefined)
                        return;

                    if (response.status === 201) {
                        this.$router.push({
                            name: 'dashboard',
                            params: { locale: Translation.currentLocale, id: response.data.id }
                        })
                    } else if (response.status === 400) {
                        this.creatingValidationFailure = response.data
                    }
                })
                .catch(err => {
                    console.error(err)
                    this.creatingLoading = false
                    this.creatingError = i18n.global.t('errors.no-connection')
                })
        }
    }
})