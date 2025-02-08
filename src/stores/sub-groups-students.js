import {defineStore} from "pinia";
import {combineUrl} from "../utils/url-helper";
import {schedulerServiceUrlV1} from "../configs/scheduler-service";
import {useAuthStore} from "./auth";
import i18n from "../i18n/index"

export const useSubGroupStudentsStore = defineStore('sub-group-students', {
    state: () => ({
        subGroupStudents: null,
        subGroupStudentsLoadingInSubGroupId: null,
        subGroupStudentsError: null,

        removingSubGroupStudentId: null,
        addingStudentInSubGroupId: null,
        studentIsNotAGroupStudent: false
    }),
    actions: {
        loadSubGroupStudents(institutionId, groupId, subGroupId) {
            this.$reset()

            this.subGroupStudentsLoadingInSubGroupId = subGroupId

            fetch(combineUrl(schedulerServiceUrlV1, `institutions/${institutionId}/groups/${groupId}/sub-groups/${subGroupId}/students/all`), {
                method: 'GET',
                headers: {
                    'Authorization': useAuthStore().jwt,
                    'Content-Type': 'application/json'
                }
            })
                .then(res => {
                    this.subGroupStudentsLoadingInSubGroupId = null

                    if(res === null || res === undefined || res.status === 500){
                        this.subGroupStudentsError = i18n.global.t('errors.internal-error')
                    }
                    else if (res.status === 200) {
                        return res.json()
                    }
                    else if (res.status === 401) {
                        this.subGroupStudentsError = i18n.global.t('errors.no-authentication')
                    }
                    else if (res.status === 404) {
                        this.subGroupStudentsError = i18n.global.t('errors.not-found.institution')
                    }
                })
                .then(json => {
                    if(json === null || json === undefined)
                        return;

                    if(json.data === null) {
                        this.subGroupStudentsError = i18n.global.t('errors.internal-error')
                        return
                    }

                    this.subGroupStudents = json.data
                })
                .catch(() => {
                    this.subGroupStudentsLoadingInSubGroupId = null
                    this.subGroupStudentsError = i18n.global.t('errors.no-connection')
                })
        },
        addSubGroupStudent(institutionId, groupId, subGroupId, studentId) {
            this.addingStudentInSubGroupId = subGroupId
            this.studentIsNotAGroupStudent = false

            fetch(combineUrl(schedulerServiceUrlV1, `institutions/${institutionId}/groups/${groupId}/sub-groups/${subGroupId}/students/add/${studentId}`), {
                method: 'POST',
                headers: {
                    'Authorization' : useAuthStore().jwt,
                    'Content-Type': 'application/json'
                }
            })
                .then(res => {
                    this.addingStudentInSubGroupId = null

                    if (res === null || res === undefined || res.status === 500)
                    {
                        this.subGroupStudentsError = i18n.global.t('errors.internal-error')
                    }
                    else if (res.status === 200) {
                        this.subGroupStudents.push({ id: studentId })
                    }
                    else if (res.status === 400) {
                        this.studentIsNotAGroupStudent = true
                    }
                    else if (res.status === 401) {
                        this.subGroupStudentsError = i18n.global.t('errors.no-authentication')
                    }
                    else if (res.status === 404) {
                        this.subGroupStudentsError = i18n.global.t('errors.not-found.institution')
                    }
                })
                .catch(() => {
                    this.addingStudentInSubGroupId = null
                    this.subGroupStudentsError = i18n.global.t('errors.no-connection')
                })
        },
        removeSubGroupStudent(institutionId, groupId, subGroupId, studentId) {
            this.removingSubGroupStudentId = studentId

            fetch(combineUrl(schedulerServiceUrlV1, `institutions/${institutionId}/groups/${groupId}/sub-groups/${subGroupId}/students/remove/${studentId}`), {
                method: 'DELETE',
                headers: {
                    'Authorization' : useAuthStore().jwt,
                    'Content-Type': 'application/json'
                }
            })
                .then(res => {
                    this.removingSubGroupStudentId = null

                    if(res === null || res === undefined || res.status === 500)
                    {
                        this.subGroupStudentsError = i18n.global.t('errors.internal-error')
                    }
                    else if(res.status === 200) {
                        this.subGroupStudents = this.subGroupStudents.filter(e => e.id !== studentId)
                    }
                    else if (res.status === 401) {
                        this.subGroupStudentsError = i18n.global.t('errors.no-authentication')
                    }
                    else if (res.status === 404) {
                        this.subGroupStudentsError = i18n.global.t('errors.not-found.institution')
                    }
                })
                .catch(() => {
                    this.removingSubGroupStudentId = null
                    this.subGroupStudentsError = i18n.global.t('errors.no-connection')
                })
        }
    }
})