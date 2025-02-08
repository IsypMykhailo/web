import {defineStore} from "pinia";
import {combineUrl} from "../utils/url-helper";
import {schedulerServiceUrlV1} from "../configs/scheduler-service";
import {useAuthStore} from "./auth";
import i18n from "../i18n/index"
import Translation from "../i18n/translation";

export const useSubGroupsStore = defineStore('sub-groups', {
    state: () => ({
        subGroups: null,
        loading: false,
        error: null,

        loadedSubGroup: null,

        editLoading: false,
        editError: null,
        editValidationFailure: null,

        creatingValidationFailure: null,
        creatingLoading: false,
        creatingError: null,

        deletingSubGroupId: null,
    }),
    actions: {
        loadSubGroups(institutionId, groupId) {
            this.$reset()

            this.loading = true

            fetch(combineUrl(schedulerServiceUrlV1, `institutions/${institutionId}/groups/${groupId}/sub-groups/all`), {
                method: 'GET',
                headers: {
                    'Authorization': useAuthStore().jwt,
                    'Content-Type': 'application/json'
                }
            })
                .then(res => {
                    this.loading = false

                    if(res === null || res === undefined || res.status === 500)
                    {
                        this.error = i18n.global.t('errors.internal-error')
                    }
                    else if (res.status === 200) {
                        return res.json()
                    }
                    else if (res.status === 401) {
                        this.error = i18n.global.t('errors.no-authentication')
                    }
                    else if (res.status === 404) {
                        this.error = i18n.global.t('errors.not-found.default')
                    }
                })
                .then(json => {
                    if(json === null || json === undefined)
                        return;

                    if(json.data === null) {
                        this.error = i18n.global.t('errors.internal-error')
                        return
                    }

                    this.subGroups = json.data
                })
                .catch(() => {
                    this.loading = false
                    this.error = i18n.global.t('errors.no-connection')
                })
        },
        loadSubGroupById(institutionId, groupId, subGroupId) {
            if (this.loadedSubGroup !== null && this.loadedSubGroup.id === subGroupId)
                return;

            if (this.subGroups !== null) {
                for (const subGroup of this.subGroups) {
                    if (subGroup.id.toString() === subGroupId.toString()) {
                        this.loadedSubGroup = subGroup
                        return
                    }
                }
            }

            fetch(combineUrl(schedulerServiceUrlV1, `institutions/${institutionId}/groups/${groupId}/sub-groups/${subGroupId}`), {
                method: 'GET',
                headers: {
                    'Authorization': useAuthStore().jwt,
                    'Content-Type': 'application/json'
                }
            })
                .then(res => {
                    this.editLoading = false

                    if (res === null || res === undefined || res.status === 500)
                    {
                        this.editError = i18n.global.t('errors.internal-error')
                    }
                    else if (res.status === 200) {
                        return res.json()
                    }
                    else if (res.status === 401) {
                        // logout or whatever
                        this.editError = i18n.global.t('errors.no-authentication')
                    }
                    else if (res.status === 404) {
                        this.editError = i18n.global.t('errors.not-found.institution')
                    }
                })
                .then(json => {
                    if (json === null || json === undefined)
                        return;

                    if (json.data === null) {
                        this.editError = i18n.global.t('errors.internal-error')
                        return
                    }

                    this.loadedSubGroup = json.data
                })
                .catch(() => {
                    this.editLoading = false
                    this.editError = i18n.global.t('errors.no-connection')
                })
        },
        createSubGroup(institutionId, groupId, subGroupName) {
            this.creatingLoading = true

            fetch(combineUrl(schedulerServiceUrlV1, `institutions/${institutionId}/groups/${groupId}/sub-groups/create`), {
                method: 'POST',
                headers: {
                    'Authorization' : useAuthStore().jwt,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: subGroupName,
                })
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
                    else if (res.status === 404) {
                        this.creatingError = i18n.global.t('errors.not-found.institution')
                    }
                })
                .then(response => {
                    if (response === null || response === undefined)
                        return;

                    if (response.status === 201) {
                        this.$router.push({
                            name: 'institution sub groups',
                            params: { locale: Translation.currentLocale, id: institutionId, groupId: groupId }
                        })
                    } else if (response.status === 400) {
                        this.creatingValidationFailure = response.data
                    }
                })
                .catch(() => {
                    this.creatingLoading = false
                    this.creatingError = i18n.global.t('errors.no-connection')
                })
        },
        editSubGroup(institutionId, groupId, subGroupId, subGroupName) {
            this.editLoading = true

            fetch(combineUrl(schedulerServiceUrlV1, `institutions/${institutionId}/groups/${groupId}/sub-groups/update/${subGroupId}`), {
                method: 'PUT',
                headers: {
                    'Authorization': useAuthStore().jwt,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: subGroupName,
                })
            })
                .then(res => {
                    this.editLoading = false

                    if (res === null || res === undefined || res.status === 500)
                    {
                        this.editError = i18n.global.t('errors.internal-error')
                    }
                    else if (res.status === 200) {
                        return res.json()
                    }
                    else if (res.status === 400) {
                        return res.json()
                    }
                    else if (res.status === 401) {
                        // logout or whatever
                        this.editError = i18n.global.t('errors.no-authentication')
                    }
                    else if (res.status === 404) {
                        this.editError = i18n.global.t('errors.not-found.institution')
                    }
                })
                .then(response => {
                    if (response === null || response === undefined)
                        return;

                    if (response.status === 200) {
                        this.$router.push({
                            name: 'institution sub groups',
                            params: { locale: Translation.currentLocale, id: institutionId, groupId: groupId }
                        })
                    } else if (response.status === 400) {
                        this.editValidationFailure = response.data
                    }
                })
                .catch(() => {
                    this.editLoading = false
                    this.editError = i18n.global.t('errors.no-connection')
                })
        },
        deleteSubGroup(institutionId, groupId, subGroupId){
            this.deletingSubGroupId = subGroupId

            fetch(combineUrl(schedulerServiceUrlV1, `institutions/${institutionId}/groups/${groupId}/sub-groups/delete/${subGroupId}`), {
                method: 'DELETE',
                headers: {
                    'Authorization' : useAuthStore().jwt,
                    'Content-Type': 'application/json'
                }
            })
                .then(res => {
                    this.deletingSubGroupId = null

                    if(res === null || res === undefined || res.status === 500)
                    {
                        this.error = i18n.global.t('errors.internal-error')
                    }
                    else if(res.status === 200) {
                        this.subGroups = this.subGroups.filter(e => e.id !== subGroupId)
                    }
                    else if (res.status === 401) {
                        this.error = i18n.global.t('errors.no-authentication')
                    }
                    else if (res.status === 404) {
                        this.error = i18n.global.t('errors.not-found.institution')
                    }
                })
                .catch(() => {
                    this.deletingSubGroupId = null
                    this.error = i18n.global.t('errors.no-connection')
                })
        },
    }
})