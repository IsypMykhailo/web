import {defineStore} from "pinia";
import {combineUrl} from "../utils/url-helper";
import {schedulerServiceUrlV1} from "../configs/scheduler-service";
import {useAuthStore} from "./auth";
import Translation from "../i18n/translation";
import i18n from "../i18n";

export const useHomeworksStore = defineStore('homeworks', {
    state: () => ({
        homeworks: null,
        homeworksLoading: false,
        homeworksError: null,
        removingHomeworkId: null,

        creatingLoading: false,
        creatingError: null,
        creatingValidationFailure: null,

        loadedHomework: null,
        editLoading: false,
        editError: null,
        editValidationFailure: null
    }),
    actions: {
        loadHomeworks(institutionId, groupId){
            this.$reset()

            this.homeworksLoading = true

            fetch(combineUrl(schedulerServiceUrlV1, `institutions/${institutionId}/groups/${groupId}/homeworks/all`), {
                method: 'GET',
                headers: {
                    'Authorization': useAuthStore().jwt,
                    'Content-Type': 'application/json'
                }
            })
                .then(res => {
                    this.homeworksLoading = false

                    if(res === null || res === undefined || res.status === 500){
                        this.homeworksError = i18n.global.t('errors.internal-error')
                    }
                    else if (res.status === 200) {
                        return res.json()
                    }
                    else if (res.status === 401) {
                        this.homeworksError = i18n.global.t('errors.no-authentication')
                    }
                    else if (res.status === 404) {
                        this.homeworksError = i18n.global.t('errors.not-found.institution')
                    }
                })
                .then(json => {
                    if(json === null || json === undefined)
                        return;

                    if(json.data === null) {
                        this.homeworksError = i18n.global.t('errors.internal-error')
                        return
                    }
                    this.homeworks = json.data
                    this.homeworks.forEach((homework, i) => {
                        this.homeworks[i].groupId = groupId
                    })
                })
                .catch(() => {
                    this.homeworksLoading = false
                    this.homeworksError = i18n.global.t('errors.no-connection')
                })
        },
        loadHomeworkById(institutionId, groupId, homeworkId) {
            this.editError = null

            /*if (this.loadedHomework !== null && this.loadedHomework.id === homeworkId)
                return;

            if (this.homeworks !== null) {
                for (const homework of this.homeworks) {
                    if (homework.id.toString() === homeworkId.toString()) {
                        this.loadedHomework = homework
                        return
                    }
                }
            }*/
            this.editLoading = true
            fetch(combineUrl(schedulerServiceUrlV1, `institutions/${institutionId}/groups/${groupId}/homeworks/all`), {
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

                    this.homeworks = json.data

                    for (const homework of this.homeworks) {
                        if (homework.id.toString() === homeworkId.toString()) {
                            this.loadedHomework = homework
                            this.loadedHomework.groupId = groupId
                            return
                        }
                    }

                    if (this.loadedHomework === null) {
                        this.editError = i18n.global.t('errors.not-found.subject')
                    }
                })
                .catch(() => {
                    this.editLoading = false
                    this.editError = i18n.global.t('errors.no-connection')
                })
        },
        loadMyHomeworkItemInHomework(institutionId, groupId, homeworkId) {
            this.editError = null

            for (const homework of this.homeworks) {
                if (homework.id.toString() === homeworkId.toString()) {
                    homework.myHomeworkItemLoading = true
                    break;
                }
            }

            fetch(combineUrl(schedulerServiceUrlV1, `institutions/${institutionId}/groups/${groupId}/homeworks/${homeworkId}/items/my-homework`), {
                method: 'GET',
                headers: {
                    'Authorization': useAuthStore().jwt,
                    'Content-Type': 'application/json'
                }
            })
                .then(res => {
                    for (const homework of this.homeworks) {
                        if (homework.id.toString() === homeworkId.toString()) {
                            homework.myHomeworkItemLoading = false
                            break;
                        }
                    }

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

                    for (const homework of this.homeworks) {
                        if (homework.id.toString() === homeworkId.toString()) {
                            homework.myHomeworkItemLoading = false
                            homework.myHomeworkItem = json.data
                            break;
                        }
                    }
                })
                .catch(() => {
                    for (const homework of this.homeworks) {
                        if (homework.id.toString() === homeworkId.toString()) {
                            homework.myHomeworkItemLoading = false
                            break;
                        }
                    }
                    this.editError = i18n.global.t('errors.no-connection')
                })
        },
        addHomework(institutionId, groupId, homeworkTitle, homeworkPath, homeworkDescription, homeworkDueDate) {
            this.creatingLoading = true

            fetch(combineUrl(schedulerServiceUrlV1, `institutions/${institutionId}/groups/${groupId}/homeworks/create`), {
                method: 'POST',
                headers: {
                    'Authorization' : useAuthStore().jwt,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: homeworkTitle,
                    homeworkPath: homeworkPath,
                    description: homeworkDescription,
                    dueDate: homeworkDueDate
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
                            name: 'institution homeworks',
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
        removeHomework(institutionId, groupId, homeworkId) {
            this.removingHomeworkId = homeworkId

            fetch(combineUrl(schedulerServiceUrlV1, `institutions/${institutionId}/groups/${groupId}/homeworks/delete/${homeworkId}`), {
                method: 'DELETE',
                headers: {
                    'Authorization' : useAuthStore().jwt,
                    'Content-Type': 'application/json'
                }
            })
                .then(res => {
                    this.removingHomeworkId = null

                    if(res === null || res === undefined || res.status === 500)
                    {
                        this.homeworksError = i18n.global.t('errors.internal-error')
                    }
                    else if(res.status === 200) {
                        this.homeworks = this.homeworks.filter(e => e.id !== homeworkId)
                    }
                    else if (res.status === 401) {
                        this.homeworksError = i18n.global.t('errors.no-authentication')
                    }
                    else if (res.status === 404) {
                        this.homeworksError = i18n.global.t('errors.not-found.institution')
                    }
                })
                .catch(() => {
                    this.removingHomeworkId = null
                    this.homeworksError = i18n.global.t('errors.no-connection')
                })
        },
        editHomework(institutionId, groupId, homeworkId, homeworkTitle, homeworkPath, homeworkDescription, homeworkDueDate) {
            this.editLoading = true

            fetch(combineUrl(schedulerServiceUrlV1, `institutions/${institutionId}/groups/${groupId}/homeworks/update/${homeworkId}`), {
                method: 'PUT',
                headers: {
                    'Authorization': useAuthStore().jwt,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: homeworkTitle,
                    homeworkPath: homeworkPath,
                    description: homeworkDescription,
                    dueDate: homeworkDueDate
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
                            name: 'institution homeworks',
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
        },
    }
})