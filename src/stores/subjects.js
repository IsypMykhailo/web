import {defineStore} from "pinia";
import {combineUrl} from "../utils/url-helper";
import {schedulerServiceUrlV1} from "../configs/scheduler-service";
import {useAuthStore} from "./auth";
import i18n from "../i18n/index"
import Translation from "../i18n/translation";

export const useSubjectsStore = defineStore('subjects', {
    state: () => ({
        subjects: null,
        subjectsLoading: false,
        subjectsError: null,
        loadingTeachersSubjectId: null,
        removingSubjectId: null,

        creatingLoading: false,
        creatingError: null,
        creatingValidationFailure: null,

        loadedSubject: null,
        editLoading: false,
        editError: null,
        editValidationFailure: null,

        addingNewTeacherLoading: false,
        removingTeacherId: null
    }),
    actions: {
        loadSubjects(institutionId){
            this.$reset()

            this.subjectsLoading = true

            fetch(combineUrl(schedulerServiceUrlV1, `institutions/${institutionId}/subjects/all`), {
                method: 'GET',
                headers: {
                    'Authorization': useAuthStore().jwt,
                    'Content-Type': 'application/json'
                }
            })
                .then(res => {
                    this.subjectsLoading = false

                    if(res === null || res === undefined || res.status === 500){
                        this.subjectsError = i18n.global.t('errors.internal-error')
                    }
                    else if (res.status === 200) {
                        return res.json()
                    }
                    else if (res.status === 401) {
                        this.subjectsError = i18n.global.t('errors.no-authentication')
                    }
                    else if (res.status === 404) {
                        this.subjectsError = i18n.global.t('errors.not-found.institution')
                    }
                })
                .then(json => {
                    if(json === null || json === undefined)
                        return;

                    if(json.data === null) {
                        this.subjectsError = i18n.global.t('errors.internal-error')
                        return
                    }

                    this.subjects = json.data
                })
                .catch(() => {
                    this.subjectsLoading = false
                    this.subjectsError = i18n.global.t('errors.no-connection')
                })
        },
        loadSubjectById(institutionId, subjectId) {
            if (this.loadedSubject !== null && this.loadedSubject.id === subjectId)
                return;

            if (this.subjects !== null) {
                for (const subject of this.subjects) {
                    if (subject.id.toString() === subject.toString()) {
                        this.loadedSubject = subject
                        return
                    }
                }
            }

            fetch(combineUrl(schedulerServiceUrlV1, `institutions/${institutionId}/subjects/${subjectId}`), {
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

                    this.loadedSubject = json.data
                })
                .catch(() => {
                    this.editLoading = false
                    this.editError = i18n.global.t('errors.no-connection')
                })
        },
        loadSubjectTeachers(institutionId, subjectId) {
            const subject = this.subjects.find(o => o.id === subjectId) ;

            if(subject.teachers !== undefined && subject.teachers !== null)
                return

            this.loadingTeachersSubjectId = subjectId

            fetch(combineUrl(schedulerServiceUrlV1, `institutions/${institutionId}/subjects/${subjectId}/teachers`), {
                method: 'GET',
                headers: {
                    'Authorization': useAuthStore().jwt,
                    'Content-Type': 'application/json'
                }
            })
                .then(res => {
                    this.loadingTeachersSubjectId = null

                    if(res === null || res === undefined || res.status === 500)
                    {
                        this.subjectsError = i18n.global.t('errors.internal-error')
                    }
                    else if (res.status === 200) {
                        return res.json()
                    }
                    else if (res.status === 401) {
                        this.subjectsError = i18n.global.t('errors.no-authentication')
                    }
                    else if (res.status === 404) {
                        this.subjectsError = i18n.global.t('errors.not-found.default')
                    }
                })
                .then(json => {
                    if(json === null || json === undefined)
                        return;

                    if(json.data === null) {
                        this.subjectsError = i18n.global.t('errors.internal-error')
                        return
                    }
                    this.subjects.find((o,i) => {
                        if(o.id === subjectId) {
                            this.subjects[i].teachers = json.data
                            return true
                        }
                    });
                })
                .catch(() => {
                    this.loadingTeachersSubjectId = null
                    this.subjectsError = i18n.global.t('errors.no-connection')
                })
        },
        addSubject(institutionId, subjectName) {
            this.creatingLoading = true

            fetch(combineUrl(schedulerServiceUrlV1, `institutions/${institutionId}/subjects/create`), {
                method: 'POST',
                headers: {
                    'Authorization' : useAuthStore().jwt,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: subjectName
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
                            name: 'institution subjects',
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
        addTeacherToSubject(institutionId, subjectId, teacherId) {
            this.addingNewTeacherLoading = true

            fetch(combineUrl(schedulerServiceUrlV1, `institutions/${institutionId}/teachers/${teacherId}/subjects/add/${subjectId}`), {
                method: 'POST',
                headers: {
                    'Authorization' : useAuthStore().jwt,
                    'Content-Type': 'application/json'
                }
            })
                .then(res => {
                    this.addingNewTeacherLoading = false
                    if(res === null || res === undefined || res.status === 500)
                    {
                        this.creatingError = i18n.global.t('errors.internal-error')
                    }
                    else if (res.status === 200) {
                        this.subjects.find((o,i) => {
                            if(o.id === subjectId) {
                                this.subjects[i].teachers.push({id: teacherId})
                                return true
                            }
                        });
                    }
                    else if (res.status === 400) {
                        return res.json()
                    }
                    else if (res.status === 401) {
                        this.creatingError = i18n.global.t('errors.no-authentication')
                    }
                    else if (res.status === 404) {
                        this.creatingError = i18n.global.t('errors.not-found.institution')
                    }
                })
                .catch(() => {
                    this.addingNewTeacherLoading = false
                    this.creatingError = i18n.global.t('errors.no-connection')
                })
        },
        removeSubject(institutionId, subjectId) {
            this.removingSubjectId = subjectId

            fetch(combineUrl(schedulerServiceUrlV1, `institutions/${institutionId}/subjects/delete/${subjectId}`), {
                method: 'DELETE',
                headers: {
                    'Authorization' : useAuthStore().jwt,
                    'Content-Type': 'application/json'
                }
            })
                .then(res => {
                    this.removingSubjectId = null

                    if(res === null || res === undefined || res.status === 500)
                    {
                        this.subjectsError = i18n.global.t('errors.internal-error')
                    }
                    else if(res.status === 200) {
                        this.subjects = this.subjects.filter(e => e.id !== subjectId)
                    }
                    else if (res.status === 401) {
                        this.subjectsError = i18n.global.t('errors.no-authentication')
                    }
                    else if (res.status === 404) {
                        this.subjectsError = i18n.global.t('errors.not-found.institution')
                    }
                })
                .catch(() => {
                    this.removingSubjectId = null
                    this.subjectsError = i18n.global.t('errors.no-connection')
                })
        },
        removeTeacherFromSubject(institutionId, subjectId, teacherId){
            this.removingTeacherId = teacherId

            fetch(combineUrl(schedulerServiceUrlV1, `institutions/${institutionId}/teachers/${teacherId}/subjects/remove/${subjectId}`), {
                method: 'DELETE',
                headers: {
                    'Authorization' : useAuthStore().jwt,
                    'Content-Type': 'application/json'
                }
            })
                .then(res => {
                    this.removingTeacherId = null

                    if(res === null || res === undefined || res.status === 500)
                    {
                        this.subjectsError = i18n.global.t('errors.internal-error')
                    }
                    else if(res.status === 200) {
                        this.subjects.find((o,i) => {
                            if(o.id === subjectId) {
                                this.subjects[i].teachers = this.subjects[i].teachers.filter(e => e.id !== teacherId)
                                return true
                            }
                        });
                    }
                    else if (res.status === 401) {
                        this.subjectsError = i18n.global.t('errors.no-authentication')
                    }
                    else if (res.status === 404) {
                        this.subjectsError = i18n.global.t('errors.not-found.institution')
                    }
                })
                .catch(() => {
                    this.removingTeacherId = null
                    this.subjectsError = i18n.global.t('errors.no-connection')
                })
        },
        editSubject(institutionId, subjectId, subjectName) {
            this.editLoading = true

            fetch(combineUrl(schedulerServiceUrlV1, `institutions/${institutionId}/subjects/update/${subjectId}`), {
                method: 'PUT',
                headers: {
                    'Authorization': useAuthStore().jwt,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: subjectName
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
                            name: 'institution subjects',
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
    }
})