import {defineStore} from "pinia";
import {combineUrl} from "../utils/url-helper";
import {schedulerServiceUrlV1} from "../configs/scheduler-service";
import Translation from "../i18n/translation";
import {useAuthStore} from "./auth";
import i18n from "../i18n/index"

export const useCurrentInstitutionStore = defineStore('current-institution', {
    state: () => ({
        institution: null,
        loading: false,
        error: null,
        updatingLoading: false,
        updatingError: null,
        updatingValidationFailure: null,
        deletingError: null,
        deletingLoading: false
    }),
    actions: {
        loadInstitution(id) {
            this.$reset()

            this.loading = true

            fetch(combineUrl(schedulerServiceUrlV1, 'institutions/' + id), {
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
                    else if (res.status === 404) {
                        this.error = i18n.global.t('errors.not-found.institution')
                    }
                })
                .then(json => {
                    if (json === null || json === undefined)
                        return;

                    if (json.data === null) {
                        this.error = i18n.global.t('errors.internal-error')
                        return
                    }

                    this.institution = json.data
                })
                .catch(() => {
                    this.loading = false
                    this.error = i18n.global.t('errors.no-connection')
                })
        },
        clearErrors() {
            this.error = null
            this.updatingError = null
            this.updatingValidationFailure = null
            this.loading = false
            this.updatingLoading = false
            this.deletingError = null
            this.deletingLoading = false
        },
        updateInfo(name, description) {
            if (this.institution === null) {
                this.updatingError = i18n.global.t('errors.institution-is-not-loaded')
                return
            }

            this.updatingError = null
            this.updatingValidationFailure = null
            this.updatingLoading = true

            fetch(combineUrl(schedulerServiceUrlV1, 'institutions/update/' + this.institution.id), {
                method: 'PUT',
                headers: {
                    'Authorization': useAuthStore().jwt,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({name, description})
            })
                .then(res => {
                    this.updatingLoading = false

                    if (res === null || res === undefined || res.status === 500)
                    {
                        this.updatingError = i18n.global.t('errors.internal-error')
                    }
                    else if (res.status === 200) {
                        return res.json()
                    }
                    else if (res.status === 400) {
                        return res.json()
                    }
                    else if (res.status === 401) {
                        // logout or whatever
                        this.updatingError = i18n.global.t('errors.no-authentication')
                    }
                    else if (res.status === 404) {
                        this.updatingError = i18n.global.t('errors.not-found.institution')
                    }
                })
                .then(response => {
                    if (response === null || response === undefined)
                        return;

                    if (response.status === 200) {
                        this.institution.name = name
                        this.institution.description = description
                    }
                    else if (response.status === 400) {
                        this.updatingValidationFailure = response.data
                    }
                })
                .catch(err => {
                    console.error(err)
                    this.updatingLoading = false
                    this.updatingError = i18n.global.t('errors.no-connection')
                })
        },
        deleteInstitution() {
            if (this.institution === null) {
                this.deletingError = i18n.global.t('errors.institution-is-not-loaded')
                return
            }

            this.deletingError = null
            this.deletingLoading = true

            fetch(combineUrl(schedulerServiceUrlV1, 'institutions/delete/' + this.institution.id), {
                method: 'DELETE',
                headers: {
                    'Authorization': useAuthStore().jwt,
                    'Content-Type': 'application/json'
                }
            })
                .then(res => {
                    this.deletingLoading = false

                    if (res === null || res === undefined || res.status === 500)
                    {
                        this.deletinggError = i18n.global.t('errors.internal-error')
                    }
                    else if (res.status === 200) {
                        return res.json()
                    }
                    else if (res.status === 400) {
                        return res.json()
                    }
                    else if (res.status === 401) {
                        // logout or whatever
                        this.deletingError = i18n.global.t('errors.no-authentication')
                    }
                    else if (res.status === 404) {
                        this.deletingError = i18n.global.t('errors.not-found.institution')
                    }
                })
                .then(response => {
                    if (response === null || response === undefined)
                        return;

                    if (response.status === 200) {
                        this.$router.push({ name: 'list of institutions', params: { locale: Translation.currentLocale } })
                    }
                })
                .catch(err => {
                    console.error(err)
                    this.updatingLoading = false
                    this.updatingError = i18n.global.t('errors.no-connection')
                })
        }
    }
})