import {defineStore} from "pinia";
import {combineUrl} from "../utils/url-helper";
import {schedulerServiceUrlV1} from "../configs/scheduler-service";
import Translation from "../i18n/translation";
import {useAuthStore} from "./auth";
import i18n from "../i18n/index"

export const useBellSchedulesStore = defineStore('bell-schedules', {
    state: () => ({
        bellSchedules: null,
        loading: false,
        error: null,

        loadedBellSchedule: null,
        editLoading: false,
        editError: null,
        editValidationFailure: null,

        itemsForLessonsSchedule: null,

        loadingItemsBellScheduleId: null,

        creatingLoading: false,
        creatingError: null,
        creatingValidationFailure: null,

        creatingBellScheduleItemValidationFailure: null,
        creatingBellScheduleItemValidationFailureBellScheduleId: null,

        deletingBellScheduleItemId: null,

        deletingBellScheduleId: null,
    }),
    getters: {
        getTime: (state) => {
            return (dayOfWeek, lessonIndex) => {
                if (state.itemsForLessonsSchedule === null)
                    return ''

                for (const item of state.itemsForLessonsSchedule) {
                    if (item.dayOfWeek === dayOfWeek && item.lessonIndex === lessonIndex)
                        return `${item.lessonStartTime.replace(new RegExp(':00' + "*$"), '')}-${item.lessonEndTime.replace(new RegExp(':00' + "*$"), '')}`
                }

                return ''
            }
        }
    },
    actions: {
        loadBellScheduleItemsByIdForLessons(institutionId, bellScheduleId) {
            fetch(combineUrl(schedulerServiceUrlV1, `institutions/${institutionId}/bells-schedules/${bellScheduleId}/items/all`), {
                method: 'GET',
                headers: {
                    'Authorization': useAuthStore().jwt,
                    'Content-Type': 'application/json'
                }
            })
                .then(res => {
                    if (res !== null && res !== undefined && res.status === 200) {
                        return res.json()
                    }
                })
                .then(json => {
                    if (json === null || json === undefined || json.data === null) {
                        this.itemsForLessonsSchedule = []
                        return;
                    }

                    this.itemsForLessonsSchedule = json.data
                })
        },
        loadBellSchedules(institutionId) {
            this.$reset()

            this.loading = true

            fetch(combineUrl(schedulerServiceUrlV1, `institutions/${institutionId}/bells-schedules/all`), {
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

                    this.bellSchedules = json.data
                })
                .catch(() => {
                    this.loading = false
                    this.error = i18n.global.t('errors.no-connection')
                })
        },
        loadBellScheduleById(institutionId, bellScheduleId) {
            if (this.loadedBellSchedule !== null && this.loadedBellSchedule.id === bellScheduleId)
                return;

            if (this.bellSchedules !== null) {
                for (const bellSchedule of this.bellSchedules) {
                    if (bellSchedule.id.toString() === bellScheduleId.toString()) {
                        this.loadedBellSchedule = bellSchedule
                        return
                    }
                }
            }

            fetch(combineUrl(schedulerServiceUrlV1, `institutions/${institutionId}/bells-schedules/${bellScheduleId}`), {
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
                        this.editError = i18n.global.t('errors.not-found.bell-schedule')
                    }
                })
                .then(json => {
                    if (json === null || json === undefined)
                        return;

                    if (json.data === null) {
                        this.editError = i18n.global.t('errors.internal-error')
                        return
                    }

                    this.loadedBellSchedule = json.data
                })
                .catch(() => {
                    this.editLoading = false
                    this.editError = i18n.global.t('errors.no-connection')
                })
        },
        createBellSchedule(institutionId, bellScheduleName) {
            this.creatingLoading = true

            fetch(combineUrl(schedulerServiceUrlV1, `institutions/${institutionId}/bells-schedules/create/`), {
                method: 'POST',
                headers: {
                    'Authorization': useAuthStore().jwt,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: bellScheduleName
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
                            name: 'institution bell schedules',
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
        editBellSchedule(institutionId, bellScheduleId, bellScheduleName) {
            this.editLoading = true

            fetch(combineUrl(schedulerServiceUrlV1, `institutions/${institutionId}/bells-schedules/update/${bellScheduleId}`), {
                method: 'PUT',
                headers: {
                    'Authorization': useAuthStore().jwt,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: bellScheduleName
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
                            name: 'institution bell schedules',
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
        deleteBellSchedule(institutionId, id){
            this.deletingBellScheduleId = id

            fetch(combineUrl(schedulerServiceUrlV1, `institutions/${institutionId}/bells-schedules/delete/${id}`), {
                method: 'DELETE',
                headers: {
                    'Authorization': useAuthStore().jwt,
                    'Content-Type': 'application/json'
                }
            })
                .then(res => {
                    this.deletingBellScheduleId = null

                    if (res === null || res === undefined || res.status === 500)
                    {
                        this.error = i18n.global.t('errors.internal-error')
                    }
                    else if (res.status === 200) {
                        this.bellSchedules = this.bellSchedules.filter(e => e.id !== id)
                    }
                    else if (res.status === 401) {
                        // logout or whatever
                        this.error = i18n.global.t('errors.no-authentication')
                    }
                    else if (res.status === 404) {
                        this.error = i18n.global.t('errors.not-found.default')
                    }
                })
                .catch(() => {
                    this.deletingBellScheduleId = null
                    this.error = i18n.global.t('errors.no-connection')
                })
        },
        loadBellScheduleItems(institutionId, bellScheduleId) {
            const bellSchedule = this.bellSchedules.find(o => o.id === bellScheduleId);

            if (bellSchedule.items !== undefined && bellSchedule.items !== null)
                return

            this.loadingItemsBellScheduleId = bellScheduleId

            fetch(combineUrl(schedulerServiceUrlV1, `institutions/${institutionId}/bells-schedules/${bellScheduleId}/items/all`), {
                method: 'GET',
                headers: {
                    'Authorization': useAuthStore().jwt,
                    'Content-Type': 'application/json'
                }
            })
                .then(res => {
                    this.loadingItemsBellScheduleId = null

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
                        this.error = i18n.global.t('errors.not-found.default')
                    }
                })
                .then(json => {
                    if (json === null || json === undefined)
                        return;

                    if (json.data === null) {
                        this.error = i18n.global.t('errors.internal-error')
                        return
                    }

                    this.bellSchedules.find((o, i) => {
                        if (o.id === bellScheduleId) {
                            this.bellSchedules[i].items = json.data
                            return true
                        }
                    });
                })
                .catch(() => {
                    this.loadingItemsBellScheduleId = null
                    this.error = i18n.global.t('errors.no-connection')
                })
        },
        createBellScheduleItem(institutionId, bellScheduleId, lessonIndex, lessonStartTime, lessonEndTime, lessonDays) {
            this.creatingBellScheduleItemValidationFailureBellScheduleId = null
            this.creatingBellScheduleItemValidationFailure = null
            this.loadingItemsBellScheduleId = bellScheduleId

            let daysToCreate = ''
            for (const lessonDay of lessonDays) {
                daysToCreate += daysToCreate === '' ? '?' : '&';
                daysToCreate += 'daysToCreate=' + parseInt(lessonDay)
            }

            fetch(combineUrl(schedulerServiceUrlV1, `institutions/${institutionId}/bells-schedules/${bellScheduleId}/items/create${daysToCreate}`), {
                method: 'POST',
                headers: {
                    'Authorization': useAuthStore().jwt,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    lessonIndex: lessonIndex,
                    lessonStartTime: lessonStartTime + ':00.00000',
                    lessonEndTime: lessonEndTime + ':00.00000'
                })
            })
                .then(res => {
                    this.loadingItemsBellScheduleId = null

                    if (res === null || res === undefined || res.status === 500)
                    {
                        this.error = i18n.global.t('errors.internal-error')
                    }
                    else if (res.status === 201) {
                        return res.json()
                    }
                    else if (res.status === 400) {
                        return res.json()
                    }
                    else if (res.status === 401) {
                        // logout or whatever
                        this.error = i18n.global.t('errors.no-authentication')
                    }
                    else if (res.status === 404) {
                        this.error = i18n.global.t('errors.not-found.default')
                    }
                })
                .then(json => {
                    if (json === null || json === undefined)
                        return;

                    if (json.data === null) {
                        this.error = i18n.global.t('errors.internal-error')
                        return
                    }

                    if (json.status === 201) {
                        this.bellSchedules.find((o, i) => {
                            if (o.id === bellScheduleId) {
                                for (const item of json.data) {
                                    this.bellSchedules[i].items.push(item)
                                }

                                return true
                            }
                        });
                    }
                    else if (json.status === 400) {
                        this.creatingBellScheduleItemValidationFailureBellScheduleId = bellScheduleId
                        this.creatingBellScheduleItemValidationFailure = json.data
                    }
                })
                .catch(() => {
                    this.loadingItemsBellScheduleId = null
                    this.error = i18n.global.t('errors.no-connection')
                })
        },
        deleteBellScheduleItem(institutionId, bellScheduleId, bellScheduleItemId) {
            this.deletingBellScheduleItemId = bellScheduleItemId

            fetch(combineUrl(schedulerServiceUrlV1, `institutions/${institutionId}/bells-schedules/${bellScheduleId}/items/delete/${bellScheduleItemId}`), {
                method: 'DELETE',
                headers: {
                    'Authorization': useAuthStore().jwt,
                    'Content-Type': 'application/json'
                }
            })
                .then(res => {
                    this.deletingBellScheduleItemId = null

                    if (res === null || res === undefined || res.status === 500)
                    {
                        this.error = i18n.global.t('errors.internal-error')
                    }
                    else if (res.status === 200) {
                        this.bellSchedules.find((o, i) => {
                            if (o.id === bellScheduleId) {
                                this.bellSchedules[i].items = this.bellSchedules[i].items.filter(e => e.id !== bellScheduleItemId)
                                return true
                            }
                        });
                    }
                    else if (res.status === 401) {
                        this.error = i18n.global.t('errors.no-authentication')
                    }
                    else if (res.status === 404) {
                        this.error = i18n.global.t('errors.not-found.default')
                    }
                })
                .catch(() => {
                    this.deletingBellScheduleItemId = null
                    this.error = i18n.global.t('errors.no-connection')
                })
        }
    }
})