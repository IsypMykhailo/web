import {defineStore} from "pinia";
import {combineUrl} from "../utils/url-helper";
import {schedulerServiceUrlV1} from "../configs/scheduler-service";
import {useAuthStore} from "./auth";
import i18n from "../i18n/index"

export const useAttendanceStore = defineStore('attendance', {
    state: () => ({
        attendees: null,
        savedAttendees: null,
        attendeesLoading: false,
        attendeesError: null,
        updatingStudentId: null,
    }),
    actions: {
        loadAttendees(institutionId, lessonId) {
            this.$reset()

            this.attendeesLoading = true

            fetch(combineUrl(schedulerServiceUrlV1, `institutions/${institutionId}/lessons/${lessonId}/attendance/get`), {
                method: 'GET',
                headers: {
                    'Authorization': useAuthStore().jwt,
                    'Content-Type': 'application/json'
                }
            })
                .then(res => {
                    this.attendeesLoading = false

                    if (res === null || res === undefined || res.status === 500)
                    {
                        this.attendeesError = i18n.global.t('errors.internal-error')
                    }
                    else if (res.status === 200) {
                        return res.json()
                    }
                    else if (res.status === 401) {
                        // logout or whatever
                        this.attendeesError = i18n.global.t('errors.no-authentication')
                    }
                    else if (res.status === 404) {
                        this.attendeesError = i18n.global.t('errors.not-found.institution')
                    }
                })
                .then(json => {
                    if (json === null || json === undefined)
                        return;

                    if (json.data === null) {
                        this.attendeesError = i18n.global.t('errors.internal-error')
                        return
                    }

                    for (let i = 0; i < json.data.length; i++) {
                        if (json.data[i].value === null)
                            json.data[i].value = { attendanceType: -1, description: null }
                    }

                    this.attendees = json.data
                    this.savedAttendees = JSON.parse(JSON.stringify(this.attendees))
                })
                .catch(() => {
                    this.attendeesLoading = false
                    this.attendeesError = i18n.global.t('errors.no-connection')
                })
        },
        checkAttendance(institutionId, lessonId) {
            this.attendeesLoading = true

            const attendances = []
            for (const attendee of this.attendees) {
                if (attendee.value.attendanceType !== -1) {
                    const attendanceObj = { studentId: attendee.key, attendanceType: attendee.value.attendanceType }
                    if (attendee.value.description !== null && attendee.value.description !== '')
                        attendanceObj.description = attendee.value.description

                    attendances.push(attendanceObj)
                }
            }

            const unsavedAttendees = JSON.parse(JSON.stringify(this.attendees))
            this.attendees = this.savedAttendees

            fetch(combineUrl(schedulerServiceUrlV1, `institutions/${institutionId}/lessons/${lessonId}/attendance/check-range`), {
                method: 'POST',
                headers: {
                    'Authorization': useAuthStore().jwt,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(attendances)
            })
                .then(res => {
                    this.attendeesLoading = false

                    if (res === null || res === undefined || res.status === 500)
                    {
                        this.attendeesError = i18n.global.t('errors.internal-error')
                    }
                    else if (res.status === 200) {
                        return res.json()
                    }
                    else if (res.status === 401) {
                        // logout or whatever
                        this.attendeesError = i18n.global.t('errors.no-authentication')
                    }
                    else if (res.status === 404) {
                        this.attendeesError = i18n.global.t('errors.not-found.institution')
                    }
                })
                .then(json => {
                    if (json === null || json === undefined)
                        return;

                    if (json.data === null) {
                        this.attendeesError = i18n.global.t('errors.internal-error')
                        return
                    }

                    for (let i = 0; i < unsavedAttendees.length; i++) {
                        if (unsavedAttendees[i].value !== null && unsavedAttendees[i].value.description === '')
                            unsavedAttendees[i].value.description = null
                    }

                    this.attendees = unsavedAttendees
                    this.savedAttendees = JSON.parse(JSON.stringify(unsavedAttendees))
                })
                .catch(() => {
                    this.attendeesLoading = false
                    this.attendeesError = i18n.global.t('errors.no-connection')
                })
        }
    }
})