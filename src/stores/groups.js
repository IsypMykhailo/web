import {defineStore} from "pinia";
import {combineUrl} from "../utils/url-helper";
import {schedulerServiceUrlV1} from "../configs/scheduler-service";
import {useAuthStore} from "./auth";
import i18n from "../i18n/index"
import Translation from "../i18n/translation";

export const useGroupsStore = defineStore('groups', {
    state: () => ({
        groups: null,
        loading: false,
        error: null,
        removingGroupId: null,

        loadedGroup: null,

        editLoading: false,
        editError: null,
        editValidationFailure: null,

        creatingLoading: false,
        creatingError: null,
        creatingValidationFailure: null,
    }),
    actions: {
        loadGroups(institutionId){
            this.$reset()

            this.loading = true

            fetch(combineUrl(schedulerServiceUrlV1, `institutions/${institutionId}/groups/all`), {
                method: 'GET',
                headers: {
                    'Authorization': useAuthStore().jwt,
                    'Content-Type': 'application/json'
                }
            })
                .then(res => {
                    this.loading = false
                    if(res === null || res === undefined || res.status === 500){
                        this.error = i18n.global.t('errors.internal-error')
                    }
                    else if (res.status === 200) {
                        return res.json()
                    }
                    else if (res.status === 401) {
                        this.error = i18n.global.t('errors.no-authentication')
                    }
                    else if (res.status === 404) {
                        this.error = i18n.global.t('errors.not-found.institution')
                    }
                })
                .then(json => {
                    if(json === null || json === undefined)
                        return;

                    if(json.data === null) {
                        this.error = i18n.global.t('errors.internal-error')
                        return
                    }

                    this.groups = json.data
                })
                .catch(() => {
                    this.loading = false
                    this.error = i18n.global.t('errors.no-connection')
                })
        },
        loadGroupById(institutionId, groupId) {
            if (this.loadedGroup !== null && this.loadedGroup.id === groupId)
                return;

            if (this.groups !== null) {
                for (const group of this.groups) {
                    if (group.id.toString() === groupId.toString()) {
                        this.loadedGroup = group
                        return
                    }
                }
            }

            fetch(combineUrl(schedulerServiceUrlV1, `institutions/${institutionId}/groups/${groupId}`), {
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

                    this.loadedGroup = json.data
                })
                .catch(() => {
                    this.editLoading = false
                    this.editError = i18n.global.t('errors.no-connection')
                })
        },
        addGroup(institutionId, groupName, headTeacherId) {
            this.creatingLoading = true

            fetch(combineUrl(schedulerServiceUrlV1, `institutions/${institutionId}/groups/create`), {
                method: 'POST',
                headers: {
                    'Authorization' : useAuthStore().jwt,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: groupName,
                    headTeacherId: headTeacherId
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
                            name: 'institution groups',
                            params: { locale: Translation.currentLocale, id: institutionId }
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
        editGroup(institutionId, groupId, groupName, headTeacherId) {
            this.editLoading = true

            fetch(combineUrl(schedulerServiceUrlV1, `institutions/${institutionId}/groups/update/${groupId}`), {
                method: 'PUT',
                headers: {
                    'Authorization': useAuthStore().jwt,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: groupName,
                    headTeacherId: headTeacherId
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
                            name: 'institution groups',
                            params: { locale: Translation.currentLocale, id: institutionId }
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
        removeGroup(institutionId, groupId) {
            this.removingGroupId = groupId

            fetch(combineUrl(schedulerServiceUrlV1, `institutions/${institutionId}/groups/delete/${groupId}`), {
                method: 'DELETE',
                headers: {
                    'Authorization' : useAuthStore().jwt,
                    'Content-Type': 'application/json'
                }
            })
                .then(res => {
                    this.removingGroupId = null

                    if(res === null || res === undefined || res.status === 500)
                    {
                        this.error = i18n.global.t('errors.internal-error')
                    }
                    else if(res.status === 200) {
                        this.groups = this.groups.filter(e => e.id !== groupId)
                    }
                    else if (res.status === 401) {
                        this.error = i18n.global.t('errors.no-authentication')
                    }
                    else if (res.status === 404) {
                        this.error = i18n.global.t('errors.not-found.institution')
                    }
                })
                .catch(() => {
                    this.removingGroupId = null
                    this.error = i18n.global.t('errors.no-connection')
                })
        }
    }
})