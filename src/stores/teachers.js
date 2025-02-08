import {defineStore} from "pinia";
import {combineUrl} from "../utils/url-helper";
import {schedulerServiceUrlV1} from "../configs/scheduler-service";
import {useAuthStore} from "./auth";
import i18n from "../i18n/index"

export const useTeachersStore = defineStore('teachers', {
    state: () => ({
        teachers: null,
        teachersLoading: false,
        teachersError: null,
        removingTeacherId: null,
        removingTeacherIsHeadTeacher: false,
        addingNewTeacherLoading: false
    }),
    actions: {
        loadTeachers(institutionId) {
            this.$reset()

            this.teachersLoading = true

            fetch(combineUrl(schedulerServiceUrlV1, `institutions/${institutionId}/teachers/all`), {
                method: 'GET',
                headers: {
                    'Authorization': useAuthStore().jwt,
                    'Content-Type': 'application/json'
                }
            })
                .then(res => {
                    this.teachersLoading = false

                    if (res === null || res === undefined || res.status === 500)
                    {
                        this.teachersError = i18n.global.t('errors.internal-error')
                    }
                    else if (res.status === 200) {
                        return res.json()
                    }
                    else if (res.status === 401) {
                        // logout or whatever
                        this.teachersError = i18n.global.t('errors.no-authentication')
                    }
                    else if (res.status === 404) {
                        this.teachersError = i18n.global.t('errors.not-found.institution')
                    }
                })
                .then(json => {
                    if (json === null || json === undefined)
                        return;

                    if (json.data === null) {
                        this.teachersError = i18n.global.t('errors.internal-error')
                        return
                    }

                    this.teachers = json.data
                })
                .catch(() => {
                    this.teachersLoading = false
                    this.teachersError = i18n.global.t('errors.no-connection')
                })
        },
        addTeacher(institutionId, userId) {
            this.addingNewTeacherLoading = true

            fetch(combineUrl(schedulerServiceUrlV1, `institutions/${institutionId}/teachers/add/${userId}`), {
                method: 'POST',
                headers: {
                    'Authorization': useAuthStore().jwt,
                    'Content-Type': 'application/json'
                }
            })
                .then(res => {
                    this.addingNewTeacherLoading = false

                    if (res === null || res === undefined || res.status === 500)
                    {
                        this.teachersError = i18n.global.t('errors.internal-error')
                    }
                    else if (res.status === 200) {
                        this.teachers.push({ id: userId })
                    }
                    else if (res.status === 401) {
                        // logout or whatever
                        this.teachersError = i18n.global.t('errors.no-authentication')
                    }
                    else if (res.status === 404) {
                        this.teachersError = i18n.global.t('errors.not-found.institution')
                    }
                })
                .catch(() => {
                    this.addingNewTeacherLoading = false
                    this.teachersError = i18n.global.t('errors.no-connection')
                })
        },
        removeTeacher(institutionId, userId) {
            this.removingTeacherIsHeadTeacher = false
            this.removingTeacherId = userId

            fetch(combineUrl(schedulerServiceUrlV1, `institutions/${institutionId}/teachers/remove/${userId}`), {
                method: 'DELETE',
                headers: {
                    'Authorization': useAuthStore().jwt,
                    'Content-Type': 'application/json'
                }
            })
                .then(res => {
                    this.removingTeacherId = null

                    if (res === null || res === undefined || res.status === 500)
                    {
                        this.teachersError = i18n.global.t('errors.internal-error')
                    }
                    else if (res.status === 200) {
                        this.teachers = this.teachers.filter(e => e.id !== userId)
                    }
                    else if (res.status === 400) {
                        this.removingTeacherIsHeadTeacher = true
                    }
                    else if (res.status === 401) {
                        // logout or whatever
                        this.teachersError = i18n.global.t('errors.no-authentication')
                    }
                    else if (res.status === 404) {
                        this.teachersError = i18n.global.t('errors.not-found.institution')
                    }
                })
                .catch(() => {
                    this.removingTeacherId = null
                    this.teachersError = i18n.global.t('errors.no-connection')
                })
        }
    }
})