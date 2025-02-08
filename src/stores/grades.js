import {defineStore} from "pinia";
import {combineUrl} from "../utils/url-helper";
import {schedulerServiceUrlV1} from "../configs/scheduler-service";
import {useAuthStore} from "./auth";
import i18n from "../i18n/index"
import Translation from "../i18n/translation";

export const useGradesStore = defineStore('grades', {
    state: () => ({
        journal: null,
        journalLoading: false,
        journalError: null,

        editLoading: false,
        editError: null,
        editValidationFailure: null,

        editColumnLoading: false,
        editColumnError: null,
        editColumnValidationFailure: null,

        deleting: false,

        column: null,
        columnLoading: false,
        columnError: null,
        columnValidationError: null,

        deletingColumnId: null,

        creatingColumnLoading: false,
        creatingColumnError: null,
        creatingColumnValidationFailure: null,

        gradeLoading: null,
        gradeError: null,
        gradeValidationFailure: null,

        studentGrades: null,
        studentGradesLoading: false,
        studentGradesError: null,

        lastStudentGrades: null,
        lastStudentGradesLoading: false,
        lastStudentGradesError: null,
    }),
    actions: {
        loadJournal(institutionId, journalId, withGrades = true) {
            this.$reset()

            this.journalLoading = true

            fetch(combineUrl(schedulerServiceUrlV1, `institutions/${institutionId}/journals/${journalId}?withGrades=${withGrades}`), {
                method: 'GET',
                headers: {
                    'Authorization': useAuthStore().jwt,
                    'Content-Type': 'application/json'
                }
            })
                .then(res => {
                    this.journalLoading = false

                    if (res === null || res === undefined || res.status === 500)
                    {
                        this.journalError = i18n.global.t('errors.internal-error')
                    }
                    else if (res.status === 200) {
                        return res.json()
                    }
                    else if (res.status === 401) {
                        // logout or whatever
                        this.journalError = i18n.global.t('errors.no-authentication')
                    }
                    else if (res.status === 404) {
                        this.journalError = i18n.global.t('errors.not-found.default')
                    }
                })
                .then(json => {
                    if (json === null || json === undefined)
                        return;

                    if (json.data === null) {
                        this.journalError = i18n.global.t('errors.internal-error')
                        return
                    }

                    this.journal = json.data
                })
                .catch(() => {
                    this.journalLoading = false
                    this.journalError = i18n.global.t('errors.no-connection')
                })
        },
        editJournal(institutionId, journalId, journalName) {
            this.editLoading = true
            this.editError = null
            this.editValidationFailure = null

            fetch(combineUrl(schedulerServiceUrlV1, `institutions/${institutionId}/journals/update/${journalId}`), {
                method: 'PUT',
                headers: {
                    'Authorization': useAuthStore().jwt,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: journalName,
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
                            name: 'institution grades journal',
                            params: { locale: Translation.currentLocale, id: institutionId, journalId: journalId }
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
        deleteJournal(institutionId, journalId) {
            this.deleting = true

            fetch(combineUrl(schedulerServiceUrlV1, `institutions/${institutionId}/journals/delete/${journalId}`), {
                method: 'DELETE',
                headers: {
                    'Authorization': useAuthStore().jwt,
                    'Content-Type': 'application/json'
                }
            })
                .then(res => {
                    this.deleting = false

                    if (res === null || res === undefined || res.status === 500)
                    {
                        this.journalError = i18n.global.t('errors.internal-error')
                    }
                    else if (res.status === 200) {
                        this.$router.push({
                            name: 'institution grades journals',
                            params: { locale: Translation.currentLocale, id: institutionId }
                        })
                    }
                    else if (res.status === 401) {
                        // logout or whatever
                        this.journalError = i18n.global.t('errors.no-authentication')
                    }
                    else if (res.status === 404) {
                        this.journalError = i18n.global.t('errors.not-found.default')
                    }
                })
                .catch(err => {
                    this.deleting = false
                    this.journalError = i18n.global.t('errors.no-connection')
                })
        },

        loadColumn(institutionId, journalId, columnId) {
            this.columnLoading = true
            this.column = null

            fetch(combineUrl(schedulerServiceUrlV1, `institutions/${institutionId}/journals/${journalId}/columns/${columnId}`), {
                method: 'GET',
                headers: {
                    'Authorization': useAuthStore().jwt,
                    'Content-Type': 'application/json'
                }
            })
                .then(res => {
                    this.columnLoading = false

                    if (res === null || res === undefined || res.status === 500)
                    {
                        this.columnError = i18n.global.t('errors.internal-error')
                    }
                    else if (res.status === 200) {
                        return res.json()
                    }
                    else if (res.status === 401) {
                        // logout or whatever
                        this.columnError = i18n.global.t('errors.no-authentication')
                    }
                    else if (res.status === 404) {
                        this.columnError = i18n.global.t('errors.not-found.default')
                    }
                })
                .then(json => {
                    if (json === null || json === undefined)
                        return;

                    if (json.data === null) {
                        this.columnError = i18n.global.t('errors.internal-error')
                        return
                    }

                    this.column = json.data
                })
                .catch(() => {
                    this.columnLoading = false
                    this.columnError = i18n.global.t('errors.no-connection')
                })
        },
        createColumn(institutionId, journalId, columnName, columnDate, columnLessonId, columnHomeworkId) {
            this.creatingColumnLoading = true
            this.creatingColumnError = null
            this.creatingColumnValidationFailure = null

            if (columnLessonId !== null)
                columnLessonId = parseInt(columnLessonId)
            else if (columnHomeworkId !== null)
                columnHomeworkId = parseInt(columnHomeworkId)

            fetch(combineUrl(schedulerServiceUrlV1, `institutions/${institutionId}/journals/${journalId}/columns/create`), {
                method: 'POST',
                headers: {
                    'Authorization': useAuthStore().jwt,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    columnHeader: columnName,
                    date: columnDate,
                    lessonId: columnLessonId,
                    homeworkId: columnHomeworkId
                })
            })
                .then(res => {
                    this.creatingColumnLoading = false

                    if (res === null || res === undefined || res.status === 500)
                    {
                        this.creatingColumnError = i18n.global.t('errors.internal-error')
                    }
                    else if (res.status === 201) {
                        return res.json()
                    }
                    else if (res.status === 400) {
                        return res.json()
                    }
                    else if (res.status === 401) {
                        // logout or whatever
                        this.creatingColumnError = i18n.global.t('errors.no-authentication')
                    }
                    else if (res.status === 404) {
                        this.creatingColumnError = i18n.global.t('errors.not-found.institution')
                    }
                })
                .then(response => {
                    if (response === null || response === undefined)
                        return;

                    if (response.status === 201) {
                        this.$router.push({
                            name: 'institution grades journal',
                            params: { locale: Translation.currentLocale, id: institutionId, journalId: journalId }
                        })
                    } else if (response.status === 400) {
                        this.creatingColumnValidationFailure = response.data
                    }
                })
                .catch(() => {
                    this.creatingColumnLoading = false
                    this.creatingColumnError = i18n.global.t('errors.no-connection')
                })
        },
        deleteColumn(institutionId, journalId, columnId) {
            this.deletingColumnId = columnId

            fetch(combineUrl(schedulerServiceUrlV1, `institutions/${institutionId}/journals/${journalId}/columns/delete/${columnId}`), {
                method: 'DELETE',
                headers: {
                    'Authorization': useAuthStore().jwt,
                    'Content-Type': 'application/json'
                }
            })
                .then(res => {
                    this.deletingColumnId = null

                    if (res === null || res === undefined || res.status === 500)
                    {
                        this.journalError = i18n.global.t('errors.internal-error')
                    }
                    else if (res.status === 200) {
                        this.journal.columns = this.journal.columns.filter(e => e.id !== columnId)
                    }
                    else if (res.status === 401) {
                        // logout or whatever
                        this.journalError = i18n.global.t('errors.no-authentication')
                    }
                    else if (res.status === 404) {
                        this.journalError = i18n.global.t('errors.not-found.default')
                    }
                })
                .catch(err => {
                    this.deletingColumnId = null
                    this.journalError = i18n.global.t('errors.no-connection')
                })
        },
        editColumn(institutionId, journalId, columnId, columnHeader) {
            this.editColumnLoading = true
            this.editColumnError = null
            this.editColumnValidationFailure = null

            if (columnHeader === '')
                columnHeader = null

            fetch(combineUrl(schedulerServiceUrlV1, `institutions/${institutionId}/journals/${journalId}/columns/update/${columnId}`), {
                method: 'PUT',
                headers: {
                    'Authorization': useAuthStore().jwt,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    columnHeader: columnHeader,
                })
            })
                .then(res => {
                    this.editColumnLoading = false

                    if (res === null || res === undefined || res.status === 500)
                    {
                        this.editColumnError = i18n.global.t('errors.internal-error')
                    }
                    else if (res.status === 200) {
                        return res.json()
                    }
                    else if (res.status === 400) {
                        return res.json()
                    }
                    else if (res.status === 401) {
                        // logout or whatever
                        this.editColumnError = i18n.global.t('errors.no-authentication')
                    }
                    else if (res.status === 404) {
                        this.editColumnError = i18n.global.t('errors.not-found.institution')
                    }
                })
                .then(response => {
                    if (response === null || response === undefined)
                        return;

                    if (response.status === 200) {
                        this.$router.push({
                            name: 'institution grades journal',
                            params: { locale: Translation.currentLocale, id: institutionId, journalId: journalId }
                        })
                    } else if (response.status === 400) {
                        this.editColumnValidationFailure = response.data
                    }
                })
                .catch(() => {
                    this.editColumnLoading = false
                    this.editColumnError = i18n.global.t('errors.no-connection')
                })
        },
        rateStudent(institutionId, journalId, columnId, studentId, points, description) {
            this.gradeLoading = { columnId: columnId, studentId: studentId }
            this.gradeError = null
            this.gradeValidationFailure = null

            if (description === '')
                description = null

            if (points === 0)
                points = null

            fetch(combineUrl(schedulerServiceUrlV1, `institutions/${institutionId}/journals/${journalId}/columns/${columnId}/mark-student`), {
                method: 'POST',
                headers: {
                    'Authorization': useAuthStore().jwt,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    studentId: studentId,
                    points: points,
                    description: description
                })
            })
                .then(res => {
                    this.gradeLoading = false

                    if (res === null || res === undefined || res.status === 500)
                    {
                        this.gradeError = i18n.global.t('errors.internal-error')
                    }
                    else if (res.status === 200) {
                        return res.json()
                    }
                    else if (res.status === 400) {
                        return res.json()
                    }
                    else if (res.status === 401) {
                        // logout or whatever
                        this.gradeError = i18n.global.t('errors.no-authentication')
                    }
                    else if (res.status === 404) {
                        this.gradeError = i18n.global.t('errors.not-found.default')
                    }
                })
                .then(response => {
                    if (response === null || response === undefined)
                        return;

                    if (response.status === 200) {
                        const column = this.journal.columns.find(e => e.id === columnId)
                        const grade = column.grades.find(e => e.studentId === studentId)

                        if (grade === undefined || grade === null) {
                            column.grades.push({studentId: studentId, points: points, description: description})
                        }
                        else {
                            grade.points = points
                            grade.description = description
                        }
                    } else if (response.status === 400) {
                        this.gradeValidationFailure = response.data
                    }
                })
                .catch(() => {
                    this.gradeLoading = false
                    this.gradeError = i18n.global.t('errors.no-connection')
                })
        },
        loadStudentGrades(institutionId) {
            this.studentGrades = null
            this.studentGradesLoading = true
            this.studentGradesError = null

            fetch(combineUrl(schedulerServiceUrlV1, `institutions/${institutionId}/grades/all`), {
                method: 'GET',
                headers: {
                    'Authorization': useAuthStore().jwt,
                    'Content-Type': 'application/json'
                }
            })
                .then(res => {
                    this.studentGradesLoading = false

                    if (res === null || res === undefined || res.status === 500)
                    {
                        this.studentGradesError = i18n.global.t('errors.internal-error')
                    }
                    else if (res.status === 200) {
                        return res.json()
                    }
                    else if (res.status === 401) {
                        // logout or whatever
                        this.studentGradesError = i18n.global.t('errors.no-authentication')
                    }
                    else if (res.status === 404) {
                        this.studentGradesError = i18n.global.t('errors.not-found.default')
                    }
                })
                .then(json => {
                    if (json === null || json === undefined)
                        return;

                    if (json.data === null) {
                        this.studentGradesError = i18n.global.t('errors.internal-error')
                        return
                    }

                    this.studentGrades = json.data
                })
                .catch(() => {
                    this.studentGradesLoading = false
                    this.studentGradesError = i18n.global.t('errors.no-connection')
                })
        },
        loadLastStudentGrades(institutionId) {
            const numberOfGrades = 5

            this.lastStudentGrades = null
            this.lastStudentGradesLoading = true
            this.lastStudentGradesError = null

            fetch(combineUrl(schedulerServiceUrlV1, `institutions/${institutionId}/grades/last?numberOfGrades=${numberOfGrades}`), {
                method: 'GET',
                headers: {
                    'Authorization': useAuthStore().jwt,
                    'Content-Type': 'application/json'
                }
            })
                .then(res => {
                    this.lastStudentGradesLoading = false

                    if (res === null || res === undefined || res.status === 500)
                    {
                        this.lastStudentGradesError = i18n.global.t('errors.internal-error')
                    }
                    else if (res.status === 200) {
                        return res.json()
                    }
                    else if (res.status === 401) {
                        // logout or whatever
                        this.lastStudentGradesError = i18n.global.t('errors.no-authentication')
                    }
                    else if (res.status === 404) {
                        this.lastStudentGradesError = i18n.global.t('errors.not-found.default')
                    }
                })
                .then(json => {
                    if (json === null || json === undefined)
                        return;

                    if (json.data === null) {
                        this.lastStudentGradesError = i18n.global.t('errors.internal-error')
                        return
                    }

                    this.lastStudentGrades = json.data
                })
                .catch(() => {
                    this.lastStudentGradesLoading = false
                    this.lastStudentGradesError = i18n.global.t('errors.no-connection')
                })
        }
    }
})