import {defineStore} from "pinia";
import {combineUrl} from "../utils/url-helper";
import {schedulerServiceUrlV1} from "../configs/scheduler-service";
import {useAuthStore} from "./auth";
import i18n from "../i18n/index"

export const useAdminsStore = defineStore('admins', {
    state: () => ({
        admins: null,
        adminsLoading: false,
        adminsError: null,
        removingAdminId: null,
        addingNewAdminLoading: false
    }),
    actions: {
        loadAdmins(institutionId) {
            this.$reset()

            this.adminsLoading = true

            fetch(combineUrl(schedulerServiceUrlV1, `institutions/${institutionId}/admins/all`), {
                method: 'GET',
                headers: {
                    'Authorization': useAuthStore().jwt,
                    'Content-Type': 'application/json'
                }
            })
                .then(res => {
                    this.adminsLoading = false

                    if (res === null || res === undefined || res.status === 500)
                    {
                        this.adminsError = i18n.global.t('errors.internal-error')
                    }
                    else if (res.status === 200) {
                        return res.json()
                    }
                    else if (res.status === 401) {
                        // logout or whatever
                        this.adminsError = i18n.global.t('errors.no-authentication')
                    }
                    else if (res.status === 404) {
                        this.adminsError = i18n.global.t('errors.not-found.institution')
                    }
                })
                .then(json => {
                    if (json === null || json === undefined)
                        return;

                    if (json.data === null) {
                        this.adminsError = i18n.global.t('errors.internal-error')
                        return
                    }

                    this.admins = json.data
                })
                .catch(() => {
                    this.adminsLoading = false
                    this.adminsError = i18n.global.t('errors.no-connection')
                })
        },
        addAdmin(institutionId, userId) {
            this.addingNewAdminLoading = true

            fetch(combineUrl(schedulerServiceUrlV1, `institutions/${institutionId}/admins/add/${userId}`), {
                method: 'POST',
                headers: {
                    'Authorization': useAuthStore().jwt,
                    'Content-Type': 'application/json'
                }
            })
                .then(res => {
                    this.addingNewAdminLoading = false

                    if (res === null || res === undefined || res.status === 500)
                    {
                        this.adminsError = i18n.global.t('errors.internal-error')
                    }
                    else if (res.status === 200) {
                        this.admins.push({ id: userId })
                    }
                    else if (res.status === 401) {
                        // logout or whatever
                        this.adminsError = i18n.global.t('errors.no-authentication')
                    }
                    else if (res.status === 404) {
                        this.adminsError = i18n.global.t('errors.not-found.institution')
                    }
                })
                .catch(() => {
                    this.addingNewAdminLoading = false
                    this.adminsError = i18n.global.t('errors.no-connection')
                })
        },
        removeAdmin(institutionId, userId) {
            this.removingAdminId = userId

            fetch(combineUrl(schedulerServiceUrlV1, `institutions/${institutionId}/admins/remove/${userId}`), {
                method: 'DELETE',
                headers: {
                    'Authorization': useAuthStore().jwt,
                    'Content-Type': 'application/json'
                }
            })
                .then(res => {
                    this.removingAdminId = null

                    if (res === null || res === undefined || res.status === 500)
                    {
                        this.adminsError = i18n.global.t('errors.internal-error')
                    }
                    else if (res.status === 200) {
                        this.admins = this.admins.filter(e => e.id !== userId)
                    }
                    else if (res.status === 401) {
                        // logout or whatever
                        this.adminsError = i18n.global.t('errors.no-authentication')
                    }
                    else if (res.status === 404) {
                        this.adminsError = i18n.global.t('errors.not-found.institution')
                    }
                })
                .catch(() => {
                    this.removingAdminId = null
                    this.adminsError = i18n.global.t('errors.no-connection')
                })
        }
    }
})