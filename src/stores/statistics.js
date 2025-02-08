import {defineStore} from "pinia";
import {combineUrl} from "@/utils/url-helper";
import {schedulerServiceUrlV1} from "@/configs/scheduler-service";
import {useAuthStore} from "./auth";
import i18n from "../i18n/index"
import {getDateString} from "@/utils/date-helper";

export const useStatisticsStore = defineStore('statistics', {
    state: () => ({
        adminsCount: null,
        teachersCount: null,
        studentsCount: null,
        personnelCountLoading: false,
        personnelCountError: null,

        totalCount: null,
        doneCount: null,
        pendingCount: null,
        missingCount: null,
        homeworksCountLoading: false,
        homeworksCountError: null,

        attendanceStatistics: null,
        attendanceStatisticsLoading: false,
        attendanceStatisticsError: null,

        lessonsCount: null,
        lessonsCountLoading: false,
        lessonsCountError: null,
    }),
    actions: {
        loadPersonnelStatistics(institutionId) {
            this.adminsCount = null
            this.teachersCount = null
            this.studentsCount = null
            this.personnelCountError = null
            this.personnelCountLoading = true

            fetch(combineUrl(schedulerServiceUrlV1, `institutions/${institutionId}/personnel-count`), {
                method: 'GET',
                headers: {
                    'Authorization': useAuthStore().jwt,
                    'Content-Type': 'application/json'
                }
            })
                .then(res => {
                    this.personnelCountLoading = false

                    if (res === null || res === undefined || res.status === 500)
                    {
                        this.personnelCountError = i18n.global.t('errors.internal-error')
                    }
                    else if (res.status === 200) {
                        return res.json()
                    }
                    else if (res.status === 401) {
                        // logout or whatever
                        this.personnelCountError = i18n.global.t('errors.no-authentication')
                    }
                    else if (res.status === 404) {
                        this.personnelCountError = i18n.global.t('errors.not-found.institution')
                    }
                })
                .then(json => {
                    if (json === null || json === undefined)
                        return;

                    if (json.data === null) {
                        this.personnelCountError = i18n.global.t('errors.internal-error')
                        return
                    }

                    this.adminsCount = json.data.adminsCount
                    this.teachersCount = json.data.teachersCount
                    this.studentsCount = json.data.studentsCount
                })
                .catch(() => {
                    this.personnelCountLoading = false
                    this.personnelCountError = i18n.global.t('errors.no-connection')
                })
        },
        loadLessonsCount(institutionId) {
            this.lessonsCount = null
            this.lessonsCountError = null
            this.lessonsCountLoading = true

            fetch(combineUrl(schedulerServiceUrlV1, `institutions/${institutionId}/lessons/count?start=${getDateString(new Date())}&end=${getDateString(new Date())}`), {
                method: 'GET',
                headers: {
                    'Authorization': useAuthStore().jwt,
                    'Content-Type': 'application/json'
                }
            })
                .then(res => {
                    this.lessonsCountLoading = false

                    if (res === null || res === undefined || res.status === 500)
                    {
                        this.lessonsCountError = i18n.global.t('errors.internal-error')
                    }
                    else if (res.status === 200) {
                        return res.json()
                    }
                    else if (res.status === 401) {
                        // logout or whatever
                        this.lessonsCountError = i18n.global.t('errors.no-authentication')
                    }
                    else if (res.status === 404) {
                        this.lessonsCountError = i18n.global.t('errors.not-found.institution')
                    }
                })
                .then(json => {
                    if (json === null || json === undefined)
                        return;

                    if (json.data === null) {
                        this.lessonsCountError = i18n.global.t('errors.internal-error')
                        return
                    }

                    this.lessonsCount = json.data.count
                })
                .catch(() => {
                    this.lessonsCountLoading = false
                    this.lessonsCountError = i18n.global.t('errors.no-connection')
                })
        },
        loadHomeworksStatistics(institutionId) {
            this.totalCount = null
            this.doneCount = null
            this.pendingCount = null
            this.missingCount = null
            this.homeworksCountError = null
            this.homeworksCountLoading = true

            fetch(combineUrl(schedulerServiceUrlV1, `institutions/${institutionId}/homeworks/count`), {
                method: 'GET',
                headers: {
                    'Authorization': useAuthStore().jwt,
                    'Content-Type': 'application/json'
                }
            })
                .then(res => {
                    this.homeworksCountLoading = false

                    if (res === null || res === undefined || res.status === 500)
                    {
                        this.homeworksCountError = i18n.global.t('errors.internal-error')
                    }
                    else if (res.status === 200) {
                        return res.json()
                    }
                    else if (res.status === 401) {
                        // logout or whatever
                        this.homeworksCountError = i18n.global.t('errors.no-authentication')
                    }
                    else if (res.status === 404) {
                        this.homeworksCountError = i18n.global.t('errors.not-found.institution')
                    }
                })
                .then(json => {
                    if (json === null || json === undefined)
                        return;

                    if (json.data === null) {
                        this.homeworksCountError = i18n.global.t('errors.internal-error')
                        return
                    }

                    this.totalCount = json.data.total
                    this.missingCount = json.data.missing
                    this.pendingCount = json.data.pending
                    this.doneCount = json.data.done
                })
                .catch(() => {
                    this.homeworksCountLoading = false
                    this.homeworksCountError = i18n.global.t('errors.no-connection')
                })
        },
        loadAttendanceStatistics(institutionId) {
            this.attendanceStatistics = null
            this.attendanceStatisticsError = null
            this.attendanceStatisticsLoading = true

            fetch(combineUrl(schedulerServiceUrlV1, `institutions/${institutionId}/attendance/statistics?endDate=${getDateString(new Date())}`), {
                method: 'GET',
                headers: {
                    'Authorization': useAuthStore().jwt,
                    'Content-Type': 'application/json'
                }
            })
                .then(res => {
                    this.attendanceStatisticsLoading = false

                    if (res === null || res === undefined || res.status === 500)
                    {
                        this.attendanceStatisticsError = i18n.global.t('errors.internal-error')
                    }
                    else if (res.status === 200) {
                        return res.json()
                    }
                    else if (res.status === 401) {
                        // logout or whatever
                        this.attendanceStatisticsError = i18n.global.t('errors.no-authentication')
                    }
                    else if (res.status === 404) {
                        this.homeworksCountError = i18n.global.t('errors.not-found.institution')
                    }
                })
                .then(json => {
                    if (json === null || json === undefined)
                        return;

                    if (json.data === null) {
                        this.attendanceStatisticsError = i18n.global.t('errors.internal-error')
                        return
                    }

                    this.attendanceStatistics = json.data
                })
                .catch(() => {
                    this.attendanceStatisticsLoading = false
                    this.attendanceStatisticsError = i18n.global.t('errors.no-connection')
                })
        }
    }
})