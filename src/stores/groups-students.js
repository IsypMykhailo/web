import {defineStore} from "pinia";
import {combineUrl} from "../utils/url-helper";
import {schedulerServiceUrlV1} from "../configs/scheduler-service";
import {useAuthStore} from "./auth";
import i18n from "../i18n/index"

export const useGroupStudentsStore = defineStore('group-students', {
    state: () => ({
        groupStudents: null,
        groupStudentsLoadingInGroupId: null,
        groupStudentsError: null,

        removingGroupStudentId: null,
        addingStudentInGroupId: false,
    }),
    actions: {
        loadGroupStudents(institutionId, groupId) {
            this.$reset()

            this.groupStudentsLoadingInGroupId = groupId

            fetch(combineUrl(schedulerServiceUrlV1, `institutions/${institutionId}/groups/${groupId}/students/all`), {
                method: 'GET',
                headers: {
                    'Authorization': useAuthStore().jwt,
                    'Content-Type': 'application/json'
                }
            })
                .then(res => {
                    this.groupStudentsLoadingInGroupId = null

                    if(res === null || res === undefined || res.status === 500){
                        this.groupStudentsError = i18n.global.t('errors.internal-error')
                    }
                    else if (res.status === 200) {
                        return res.json()
                    }
                    else if (res.status === 401) {
                        this.groupStudentsError = i18n.global.t('errors.no-authentication')
                    }
                    else if (res.status === 404) {
                        this.groupStudentsError = i18n.global.t('errors.not-found.institution')
                    }
                })
                .then(json => {
                    if(json === null || json === undefined)
                        return;

                    if(json.data === null) {
                        this.groupStudentsError = i18n.global.t('errors.internal-error')
                        return
                    }

                    this.groupStudents = json.data
                })
                .catch(() => {
                    this.groupStudentsLoadingInGroupId = null
                    this.groupStudentsError = i18n.global.t('errors.no-connection')
                })
        },
        addGroupStudent(institutionId, groupId, studentId) {
            this.addingStudentInGroupId = groupId

            fetch(combineUrl(schedulerServiceUrlV1, `institutions/${institutionId}/groups/${groupId}/students/add/${studentId}`), {
                method: 'POST',
                headers: {
                    'Authorization' : useAuthStore().jwt,
                    'Content-Type': 'application/json'
                }
            })
                .then(res => {
                    this.addingStudentInGroupId = null

                    if (res === null || res === undefined || res.status === 500)
                    {
                        this.groupStudentsError = i18n.global.t('errors.internal-error')
                    }
                    else if (res.status === 200) {
                        this.groupStudents.push({ id: studentId })
                    }
                    else if (res.status === 401) {
                        this.groupStudentsError = i18n.global.t('errors.no-authentication')
                    }
                    else if (res.status === 404) {
                        this.groupStudentsError = i18n.global.t('errors.not-found.institution')
                    }
                })
                .catch(() => {
                    this.addingStudentInGroupId = null
                    this.groupStudentsError = i18n.global.t('errors.no-connection')
                })
        },
        removeGroupStudent(institutionId, groupId, studentId) {
            this.removingGroupStudentId = studentId

            fetch(combineUrl(schedulerServiceUrlV1, `institutions/${institutionId}/groups/${groupId}/students/remove/${studentId}`), {
                method: 'DELETE',
                headers: {
                    'Authorization' : useAuthStore().jwt,
                    'Content-Type': 'application/json'
                }
            })
                .then(res => {
                    this.removingGroupStudentId = null

                    if(res === null || res === undefined || res.status === 500)
                    {
                        this.groupStudentsError = i18n.global.t('errors.internal-error')
                    }
                    else if(res.status === 200) {
                        this.groupStudents = this.groupStudents.filter(e => e.id !== studentId)
                    }
                    else if (res.status === 401) {
                        this.groupStudentsError = i18n.global.t('errors.no-authentication')
                    }
                    else if (res.status === 404) {
                        this.groupStudentsError = i18n.global.t('errors.not-found.institution')
                    }
                })
                .catch(() => {
                    this.removingGroupStudentId = null
                    this.groupStudentsError = i18n.global.t('errors.no-connection')
                })
        }
    }
})