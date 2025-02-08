import {defineStore} from "pinia";
import {combineUrl} from "../utils/url-helper";
import {schedulerServiceUrlV1} from "../configs/scheduler-service";
import {useAuthStore} from "./auth";
import i18n from "../i18n/index"
import Translation from "../i18n/translation";
import {useBellSchedulesStore} from "./bell-schedules";

export const useTeacherLessonsStore = defineStore('teacher-lessons', {
    state: () => ({
        lessons: null,
        lessonsLoading: false,
        lessonsError: null,
        updatingValidationFailure: null
    }),
    actions: {
        loadLessons(institutionId, start, end) {
            this.$reset()

            this.lessonsLoading = true

            fetch(combineUrl(schedulerServiceUrlV1, `institutions/${institutionId}/teachers/lessons?start=${start.toDateString()}&end=${end.toDateString()}`), {
                method: 'GET',
                headers: {
                    'Authorization': useAuthStore().jwt,
                    'Content-Type': 'application/json'
                }
            })
                .then(res => {
                    this.lessonsLoading = false

                    if(res === null || res === undefined || res.status === 500){
                        this.lessonsError = i18n.global.t('errors.internal-error')
                    }
                    else if (res.status === 200) {
                        return res.json()
                    }
                    else if (res.status === 401) {
                        this.lessonsError = i18n.global.t('errors.no-authentication')
                    }
                    else if (res.status === 404) {
                        this.lessonsError = i18n.global.t('errors.not-found.default')
                    }
                })
                .then(json => {
                    if(json === null || json === undefined)
                        return;

                    if(json.data === null) {
                        this.lessonsError = i18n.global.t('errors.internal-error')
                        return
                    }

                    this.lessons = json.data
                })
                .catch(() => {
                    this.lessonsLoading = false
                    this.lessonsError = i18n.global.t('errors.no-connection')
                })
        },
        updateLessonInfo(institutionId, groupId, lessonId, lessonTopic, lessonHomework) {
            if (lessonTopic === '')
                lessonTopic = null

            if (lessonHomework === '')
                lessonHomework = null

            this.lessonsLoading = true
            this.lessonsError = null
            this.updatingValidationFailure = null

            fetch(combineUrl(schedulerServiceUrlV1, `institutions/${institutionId}/groups/${groupId}/lessons-schedule/items/${lessonId}/info/update`), {
                method: 'PUT',
                headers: {
                    'Authorization': useAuthStore().jwt,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    theme: lessonTopic,
                    homeworkDescription: lessonHomework
                })
            })
                .then(res => {
                    this.lessonsLoading = false

                    if (res === null || res === undefined || res.status === 500)
                    {
                        this.lessonsError = i18n.global.t('errors.internal-error')
                    }
                    else if (res.status === 200) {
                        const lesson = this.lessons.find(e => e.id === lessonId)
                        lesson.theme = lessonTopic
                        lesson.homeworkDescription = lessonHomework
                    }
                    else if (res.status === 400) {
                        return res.json()
                    }
                    else if (res.status === 401) {
                        // logout or whatever
                        this.lessonsError = i18n.global.t('errors.no-authentication')
                    }
                    else if (res.status === 404) {
                        this.lessonsError = i18n.global.t('errors.not-found.default')
                    }
                })
                .then(json => {
                    if (json === null || json === undefined)
                        return;

                    if (json.data === null) {
                        this.lessonsError = i18n.global.t('errors.internal-error')
                        return
                    }

                    else if (json.status === 400) {
                        this.updatingValidationFailure = json.data
                    }
                })
                .catch(() => {
                    this.lessonsLoading = false
                    this.lessonsError = i18n.global.t('errors.no-connection')
                })
        },
    }
})