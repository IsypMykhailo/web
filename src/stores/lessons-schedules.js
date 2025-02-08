import {defineStore} from "pinia";
import {combineUrl} from "../utils/url-helper";
import {schedulerServiceUrlV1} from "../configs/scheduler-service";
import {useAuthStore} from "./auth";
import i18n from "../i18n/index"
import Translation from "../i18n/translation";
import {useBellSchedulesStore} from "./bell-schedules";

export const useLessonsSchedulesStore = defineStore('lessons-schedules', {
    state: () => ({
        lessonSchedules: {},
        scheduleLoading: false,
        scheduleError: null,

        loadedLessonItem: null,
        lessonLoading: false,
        lessonError: null,

        creatingLoading: false,
        creatingError: null,
        creatingValidationFailure: null,
    }),
    actions: {
        loadLessonsScheduleByGroupId(institutionId, groupId, start, end) {
            this.scheduleError = null

            if (this.lessonSchedules[groupId] !== undefined) {
                this.loadLessons(institutionId, groupId, start, end)
                return
            }

            this.scheduleLoading = true

            fetch(combineUrl(schedulerServiceUrlV1, `institutions/${institutionId}/groups/${groupId}/lessons-schedule/get`), {
                method: 'GET',
                headers: {
                    'Authorization': useAuthStore().jwt,
                    'Content-Type': 'application/json'
                }
            })
                .then(res => {
                    this.scheduleLoading = false

                    if(res === null || res === undefined || res.status === 500){
                        this.scheduleError = i18n.global.t('errors.internal-error')
                    }
                    else if (res.status === 200) {
                        return res.json()
                    }
                    else if (res.status === 401) {
                        this.scheduleError = i18n.global.t('errors.no-authentication')
                    }
                    else if (res.status === 404) {
                        this.lessonSchedules[groupId] = null
                    }
                })
                .then(json => {
                    if(json === null || json === undefined)
                        return;

                    if(json.data === null) {
                        this.scheduleError = i18n.global.t('errors.internal-error')
                        return
                    }

                    this.lessonSchedules[groupId] = json.data
                    this.lessonSchedules[groupId].loading = false
                    this.lessonSchedules[groupId].error = null
                    this.lessonSchedules[groupId].items = null

                    this.loadLessons(institutionId, groupId, start, end)
                })
                .catch(() => {
                    this.scheduleLoading = false
                    this.scheduleError = i18n.global.t('errors.no-connection')
                })
        },
        createLessonsSchedule(institutionId, groupId, lessonsScheduleName, bellScheduleId) {
            this.creatingLoading = true

            fetch(combineUrl(schedulerServiceUrlV1, `institutions/${institutionId}/groups/${groupId}/lessons-schedule/create`), {
                method: 'POST',
                headers: {
                    'Authorization' : useAuthStore().jwt,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: lessonsScheduleName,
                    bellsScheduleId: parseInt(bellScheduleId)
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
                        this.creatingError = i18n.global.t('errors.not-found.default')
                    }
                    else if (res.status === 409) {
                        this.creatingError = i18n.global.t('errors.already-exists.lessons-schedule')
                    }
                })
                .then(response => {
                    if (response === null || response === undefined)
                        return;

                    if (response.status === 201) {
                        this.lessonSchedules[groupId] = response.data
                        this.lessonSchedules[groupId].loading = false
                        this.lessonSchedules[groupId].validationError = null
                        this.lessonSchedules[groupId].error = null
                        this.lessonSchedules[groupId].items = null

                        this.$router.push({
                            name: 'institution lesson schedules',
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
        loadLessons(institutionId, groupId, start, end) {
            if (this.lessonSchedules[groupId] === undefined)
                return

            const bellScheduleStore = useBellSchedulesStore()
            bellScheduleStore.loadBellScheduleItemsByIdForLessons(institutionId, this.lessonSchedules[groupId].bellsScheduleId)

            this.lessonSchedules[groupId].loading = true
            this.lessonSchedules[groupId].error = null

            fetch(combineUrl(schedulerServiceUrlV1, `institutions/${institutionId}/groups/${groupId}/lessons-schedule/items/get?start=${start.toDateString()}&end=${end.toDateString()}`), {
                method: 'GET',
                headers: {
                    'Authorization': useAuthStore().jwt,
                    'Content-Type': 'application/json'
                }
            })
                .then(res => {
                    this.lessonSchedules[groupId].loading = false

                    if(res === null || res === undefined || res.status === 500){
                        this.lessonSchedules[groupId].error = i18n.global.t('errors.internal-error')
                    }
                    else if (res.status === 200) {
                        return res.json()
                    }
                    else if (res.status === 401) {
                        this.lessonSchedules[groupId].error = i18n.global.t('errors.no-authentication')
                    }
                    else if (res.status === 404) {
                        this.lessonSchedules[groupId].error = i18n.global.t('errors.not-found.default')
                    }
                })
                .then(json => {
                    if(json === null || json === undefined)
                        return;

                    if(json.data === null) {
                        this.lessonSchedules[groupId].error = i18n.global.t('errors.internal-error')
                        return
                    }

                    this.lessonSchedules[groupId].items = json.data
                })
                .catch(() => {
                    this.lessonSchedules[groupId].loading = false
                    this.lessonSchedules[groupId].error = i18n.global.t('errors.no-connection')
                })
        },
        loadLessonById(institutionId, groupId, lessonId) {
            if (this.loadedLessonItem !== null && this.loadedLessonItem.id === lessonId)
                return

            this.loadedLessonItem = null
            this.lessonLoading = true
            this.lessonError = null

            fetch(combineUrl(schedulerServiceUrlV1, `institutions/${institutionId}/groups/${groupId}/lessons-schedule/items/${lessonId}`), {
                method: 'GET',
                headers: {
                    'Authorization': useAuthStore().jwt,
                    'Content-Type': 'application/json'
                }
            })
                .then(res => {
                    this.lessonLoading = false

                    if(res === null || res === undefined || res.status === 500){
                        this.lessonError = i18n.global.t('errors.internal-error')
                    }
                    else if (res.status === 200) {
                        return res.json()
                    }
                    else if (res.status === 401) {
                        this.lessonError = i18n.global.t('errors.no-authentication')
                    }
                    else if (res.status === 404) {
                        this.lessonError = i18n.global.t('errors.not-found.default')
                    }
                })
                .then(json => {
                    if(json === null || json === undefined)
                        return;

                    if(json.data === null) {
                        this.lessonError = i18n.global.t('errors.internal-error')
                        return
                    }

                    this.loadedLessonItem = json.data
                })
                .catch(() => {
                    this.lessonLoading = false
                    this.lessonError = i18n.global.t('errors.no-connection')
                })
        },
        createLesson(institutionId, groupId, lessonFreq, teacherId, subGroupId, lessonIndex, subjectId, dayOfWeek, from, to) {
            lessonFreq = parseInt(lessonFreq)
            lessonIndex = parseInt(lessonIndex)
            subjectId = parseInt(subjectId)
            dayOfWeek = parseInt(dayOfWeek)

            if (subGroupId === '-1')
                subGroupId = null
            else
                subGroupId = parseInt(subGroupId)

            this.lessonSchedules[groupId].loading = true
            this.lessonSchedules[groupId].error = null
            this.lessonSchedules[groupId].validationError = null

            fetch(combineUrl(schedulerServiceUrlV1, `institutions/${institutionId}/groups/${groupId}/lessons-schedule/items/create-range?lessonFrequency=${lessonFreq}`), {
                method: 'POST',
                headers: {
                    'Authorization': useAuthStore().jwt,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    teacherId: teacherId,
                    subGroupId: subGroupId,
                    lessonIndex: lessonIndex,
                    subjectId: subjectId,
                    dayOfWeek: dayOfWeek,
                    from: from,
                    to: to
                })
            })
                .then(res => {
                    this.lessonSchedules[groupId].loading = false

                    if (res === null || res === undefined || res.status === 500)
                    {
                        this.lessonSchedules[groupId].error = i18n.global.t('errors.internal-error')
                    }
                    else if (res.status === 201) {
                        return res.json()
                    }
                    else if (res.status === 400) {
                        return res.json()
                    }
                    else if (res.status === 401) {
                        // logout or whatever
                        this.lessonSchedules[groupId].error = i18n.global.t('errors.no-authentication')
                    }
                    else if (res.status === 404) {
                        this.lessonSchedules[groupId].error = i18n.global.t('errors.not-found.default')
                    }
                })
                .then(json => {
                    if (json === null || json === undefined)
                        return;

                    if (json.data === null) {
                        this.lessonSchedules[groupId].error = i18n.global.t('errors.internal-error')
                        return
                    }

                    if (json.status === 201) {
                        if (json.data.length > 0)
                            this.lessonSchedules[groupId].items.push(json.data[0])
                    }
                    else if (json.status === 400) {
                        this.lessonSchedules[groupId].validationError = json.data
                    }
                })
                .catch(() => {
                    this.lessonSchedules[groupId].loading = false
                    this.lessonSchedules[groupId].error = i18n.global.t('errors.no-connection')
                })
        },
        deleteLesson(institutionId, groupId, lessonId) {
            this.lessonSchedules[groupId].loading = true
            this.lessonSchedules[groupId].error = null

            fetch(combineUrl(schedulerServiceUrlV1, `institutions/${institutionId}/groups/${groupId}/lessons-schedule/items/delete/${lessonId}`), {
                method: 'DELETE',
                headers: {
                    'Authorization': useAuthStore().jwt,
                    'Content-Type': 'application/json'
                },
            })
                .then(res => {
                    this.lessonSchedules[groupId].loading = false

                    if (res === null || res === undefined || res.status === 500)
                    {
                        this.lessonSchedules[groupId].error = i18n.global.t('errors.internal-error')
                    }
                    else if (res.status === 200) {
                        this.lessonSchedules[groupId].items = this.lessonSchedules[groupId].items.filter(e => e.id !== lessonId)
                    }
                    else if (res.status === 401) {
                        // logout or whatever
                        this.lessonSchedules[groupId].error = i18n.global.t('errors.no-authentication')
                    }
                    else if (res.status === 404) {
                        this.lessonSchedules[groupId].error = i18n.global.t('errors.not-found.default')
                    }
                })
                .catch(() => {
                    this.lessonSchedules[groupId].loading = false
                    this.lessonSchedules[groupId].error = i18n.global.t('errors.no-connection')
                })
        }
    }
})