import {defineStore} from "pinia";
import {combineUrl} from "../utils/url-helper";
import {schedulerServiceUrlV1} from "../configs/scheduler-service";
import {useAuthStore} from "./auth";
import Translation from "../i18n/translation";
import i18n from "../i18n/index"

export const useHomeworkItemsStore = defineStore('homeworkItems', {
    state: () => ({
        homeworkItems: null,
        loading: false,
        error: null,
        removingHomeworkItemId: null,

        creatingLoading: false,
        creatingError: null,
        creatingValidationFailure: null,

        myHomeworkItemLoading: false,
        loadedHomeworkItem: null,

        editLoading: false,
        editError: null,
        editValidationFailure: null,
    }),
    actions: {
        loadHomeworkItems(institutionId, groupId, homeworkId) {
            this.$reset()

            this.loading = true

            fetch(combineUrl(schedulerServiceUrlV1, `institutions/${institutionId}/groups/${groupId}/homeworks/${homeworkId}/items/all`), {
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
                    this.homeworkItems = json.data
                })
                .catch(() => {
                    this.loading = false
                    this.error = i18n.global.t('errors.no-connection')
                })
        },
        loadHomeworkItemById(institutionId, groupId, homeworkId, homeworkItemId){
            if (this.loadedHomeworkItem !== null && this.loadedHomeworkItem.id === homeworkItemId)
                return;

            if (this.homeworkItems !== null) {
                for (const homeworkItem of this.homeworkItems) {
                    if (homeworkItem.id.toString() === homeworkItemId.toString()) {
                        this.loadedHomeworkItem = homeworkItem
                        return
                    }
                }
            }

            fetch(combineUrl(schedulerServiceUrlV1, `institutions/${institutionId}/groups/${groupId}/homeworks/${homeworkId}/items/all`), {
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

                    this.homeworkItems = json.data

                    for (const homeworkItem of this.homeworkItems) {
                        if (homeworkItem.id.toString() === homeworkItemId.toString()) {
                            this.loadedHomeworkItem = homeworkItem
                            return
                        }
                    }

                    if (this.loadedHomeworkItem === null) {
                        this.editError = i18n.global.t('errors.not-found')
                    }
                })
                .catch(() => {
                    this.editLoading = false
                    this.editError = i18n.global.t('errors.no-connection')
                })
        },
        loadHomeworkItemByStudentId(institutionId, studentId, groupId, homeworkId){
            this.loadedHomeworkItem = null
            this.editLoading = true

            fetch(combineUrl(schedulerServiceUrlV1, `institutions/${institutionId}/groups/${groupId}/homeworks/${homeworkId}/items/students/${studentId}`), {
                method: 'GET',
                headers: {
                    'Authorization': useAuthStore().jwt,
                    'Content-Type': 'application/json'
                }
            })
                .then(res => {
                    this.editLoading = false

                    if(res === null || res === undefined || res.status === 500)
                    {
                        this.editError = i18n.global.t('errors.internal-error')
                    }
                    else if (res.status === 200) {
                        return res.json()
                    }
                    else if (res.status === 401) {
                        this.editError = i18n.global.t('errors.no-authentication')
                    }
                    else if (res.status === 404) {
                        this.editError = i18n.global.t('errors.not-found.default')
                    }
                })
                .then(json => {
                    if(json === null || json === undefined)
                        return;

                    if(json.data === null) {
                        this.editError = i18n.global.t('errors.internal-error')
                        return
                    }
                    this.loadedHomeworkItem = json.data
                })
                .catch(() => {
                    this.editLoading = false
                    this.editError = i18n.global.t('errors.no-connection')
                })
        },
        loadMyHomeworkItem(institutionId, groupId, homeworkId) {
            this.editError = null
            this.myHomeworkItemLoading = true

            fetch(combineUrl(schedulerServiceUrlV1, `institutions/${institutionId}/groups/${groupId}/homeworks/${homeworkId}/items/my-homework`), {
                method: 'GET',
                headers: {
                    'Authorization': useAuthStore().jwt,
                    'Content-Type': 'application/json'
                }
            })
                .then(res => {
                    this.myHomeworkItemLoading = false

                    if(res === null || res === undefined || res.status === 500)
                    {
                        this.editError = i18n.global.t('errors.internal-error')
                    }
                    else if (res.status === 200) {
                        return res.json()
                    }
                    else if (res.status === 401) {
                        this.editError = i18n.global.t('errors.no-authentication')
                    }
                    else if (res.status === 404) {
                        this.loadedHomeworkItem = null
                    }
                })
                .then(json => {
                    if(json === null || json === undefined)
                        return;

                    if(json.data === null) {
                        this.editError = i18n.global.t('errors.internal-error')
                        return
                    }

                    this.loadedHomeworkItem = json.data
                })
                .catch(() => {
                    this.myHomeworkItemLoading = false
                    this.editError = i18n.global.t('errors.no-connection')
                })
        },
        addHomeworkItem(institutionId, groupId, homeworkId, completedHomework, homeworkComment) {
            this.creatingLoading = true

            fetch(combineUrl(schedulerServiceUrlV1, `institutions/${institutionId}/groups/${groupId}/homeworks/${homeworkId}/items/create`), {
                method: 'POST',
                headers: {
                    'Authorization' : useAuthStore().jwt,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    completedHomework: completedHomework,
                    comment: homeworkComment
                })
            })
                .then(res => {
                    this.creatingLoading = false

                    if (res === null || res === undefined || res.status === 500)
                    {
                        this.creatingError = $t('errors.internal-error')
                    }
                    else if (res.status === 201) {
                        return res.json()
                    }
                    else if (res.status === 400) {
                        return res.json()
                    }
                    else if (res.status === 401) {
                        // logout or whatever
                        this.creatingError = $t('errors.no-authentication')
                    }
                    else if (res.status === 404) {
                        this.creatingError = $t('errors.not-found.institution')
                    }
                })
                .then(response => {
                    if (response === null || response === undefined)
                        return;

                    if (response.status === 201) {
                        this.$router.push({
                            name: 'institution homework',
                            params: { locale: Translation.currentLocale, id: institutionId, homeworkId: homeworkId },
                            query: { groupId: groupId }
                        })
                    } else if (response.status === 400) {
                        this.creatingValidationFailure = response.data
                    }
                })
                .catch(() => {
                    this.creatingLoading = false
                    this.creatingError = $t('errors.no-connection')
                })
        },
        removeHomeworkItem(institutionId, groupId, homeworkId, homeworkItemId){
            this.removingHomeworkItemId = homeworkItemId

            fetch(combineUrl(schedulerServiceUrlV1, `institutions/${institutionId}/groups/${groupId}/homeworks/${homeworkId}/items/delete/${homeworkItemId}`), {
                method: 'DELETE',
                headers: {
                    'Authorization' : useAuthStore().jwt,
                    'Content-Type': 'application/json'
                }
            })
                .then(res => {
                    this.removingHomeworkItemId = null

                    if(res === null || res === undefined || res.status === 500)
                    {
                        this.error = $t('errors.internal-error')
                    }
                    else if(res.status === 200) {
                        this.$router.push({
                            name: 'institution homework',
                            params: { locale: Translation.currentLocale, id: institutionId }
                        })
                    }
                    else if (res.status === 401) {
                        this.error = $t('errors.no-authentication')
                    }
                    else if (res.status === 404) {
                        this.error = $t('errors.not-found.institution')
                    }
                })
                .catch(() => {
                    this.removingHomeworkItemId = null
                    this.error = $t('errors.no-connection')
                })
        },
        editHomeworkItem(institutionId, groupId, homeworkId, homeworkItemId, completedHomework, homeworkComment){
            this.editLoading = true

            fetch(combineUrl(schedulerServiceUrlV1, `institutions/${institutionId}/groups/${groupId}/homeworks/${homeworkId}/items/update/${homeworkItemId}`), {
                method: 'PUT',
                headers: {
                    'Authorization': useAuthStore().jwt,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    completedHomework: completedHomework,
                    comment: homeworkComment
                })
            })
                .then(res => {
                    this.editLoading = false

                    if (res === null || res === undefined || res.status === 500)
                    {
                        this.editError = $t('errors.internal-error')
                    }
                    else if (res.status === 200) {
                        return res.json()
                    }
                    else if (res.status === 400) {
                        return res.json()
                    }
                    else if (res.status === 401) {
                        this.editError = $t('errors.no-authentication')
                    }
                    else if (res.status === 404) {
                        this.editError = $t('errors.not-found.institution')
                    }
                })
                .then(response => {
                    if (response === null || response === undefined)
                        return;

                    if (response.status === 200) {
                        this.$router.push({
                            name: 'institution homework',
                            params: { locale: Translation.currentLocale, id: institutionId }
                        })
                    } else if (response.status === 400) {
                        this.editValidationFailure = response.data
                    }
                })
                .catch(() => {
                    this.editLoading = false
                    this.editError = $t('errors.no-connection')
                })
        }
    }
})