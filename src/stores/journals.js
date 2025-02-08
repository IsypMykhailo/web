import {defineStore} from "pinia";
import {combineUrl} from "../utils/url-helper";
import {schedulerServiceUrlV1} from "../configs/scheduler-service";
import {useAuthStore} from "./auth";
import i18n from "../i18n/index"
import Translation from "../i18n/translation";

export const useJournalsStore = defineStore('journals', {
    state: () => ({
        journals: null,
        journalsLoading: false,
        journalsError: null,

        journalsByGroupAndSubject: null,
        journalsByGroupAndSubjectLoading: false,
        journalsByGroupAndSubjectError: null,

        journalsByGroup: null,
        journalsByGroupLoading: false,
        journalsByGroupError: null,

        teachingGroups: null,
        teachingGroupsLoading: false,
        teachingGroupsError: null,

        teachingSubjects: null,
        teachingSubjectsLoading: false,
        teachingSubjectsError: null,

        creatingLoading: false,
        creatingError: null,
        creatingValidationFailure: null,
    }),
    actions: {
        loadJournals(institutionId) {
            this.$reset()

            this.journalsLoading = true

            fetch(combineUrl(schedulerServiceUrlV1, `institutions/${institutionId}/journals/all`), {
                method: 'GET',
                headers: {
                    'Authorization': useAuthStore().jwt,
                    'Content-Type': 'application/json'
                }
            })
                .then(res => {
                    this.journalsLoading = false

                    if (res === null || res === undefined || res.status === 500)
                    {
                        this.journalsError = i18n.global.t('errors.internal-error')
                    }
                    else if (res.status === 200) {
                        return res.json()
                    }
                    else if (res.status === 401) {
                        // logout or whatever
                        this.journalsError = i18n.global.t('errors.no-authentication')
                    }
                    else if (res.status === 404) {
                        this.journalsError = i18n.global.t('errors.not-found.institution')
                    }
                })
                .then(json => {
                    if (json === null || json === undefined)
                        return;

                    if (json.data === null) {
                        this.journalsError = i18n.global.t('errors.internal-error')
                        return
                    }

                    this.journals = json.data
                })
                .catch(() => {
                    this.journalsLoading = false
                    this.journalsError = i18n.global.t('errors.no-connection')
                })
        },
        loadJournalsByGroupAndSubject(institutionId, groupId, subjectId) {
            this.journalsByGroupAndSubjectLoading = true

            fetch(combineUrl(schedulerServiceUrlV1, `institutions/${institutionId}/groups/${groupId}/journals?subjectId=${subjectId}`), {
                method: 'GET',
                headers: {
                    'Authorization': useAuthStore().jwt,
                    'Content-Type': 'application/json'
                }
            })
                .then(res => {
                    this.journalsByGroupAndSubjectLoading = false

                    if (res === null || res === undefined || res.status === 500)
                    {
                        this.journalsByGroupAndSubjectError = i18n.global.t('errors.internal-error')
                    }
                    else if (res.status === 200) {
                        return res.json()
                    }
                    else if (res.status === 401) {
                        // logout or whatever
                        this.journalsByGroupAndSubjectError = i18n.global.t('errors.no-authentication')
                    }
                    else if (res.status === 404) {
                        this.journalsByGroupAndSubjectError = i18n.global.t('errors.not-found.institution')
                    }
                })
                .then(json => {
                    if (json === null || json === undefined)
                        return;

                    if (json.data === null) {
                        this.journalsByGroupAndSubjectError = i18n.global.t('errors.internal-error')
                        return
                    }

                    this.journalsByGroupAndSubject = json.data
                })
                .catch(() => {
                    this.journalsByGroupAndSubjectLoading = false
                    this.journalsByGroupAndSubjectError = i18n.global.t('errors.no-connection')
                })
        },
        loadJournalsByGroup(institutionId, groupId) {
            this.journalsByGroupLoading = true

            fetch(combineUrl(schedulerServiceUrlV1, `institutions/${institutionId}/groups/${groupId}/journals`), {
                method: 'GET',
                headers: {
                    'Authorization': useAuthStore().jwt,
                    'Content-Type': 'application/json'
                }
            })
                .then(res => {
                    this.journalsByGroupLoading = false

                    if (res === null || res === undefined || res.status === 500)
                    {
                        this.journalsByGroupError = i18n.global.t('errors.internal-error')
                    }
                    else if (res.status === 200) {
                        return res.json()
                    }
                    else if (res.status === 401) {
                        // logout or whatever
                        this.journalsByGroupError = i18n.global.t('errors.no-authentication')
                    }
                    else if (res.status === 404) {
                        this.journalsByGroupError = i18n.global.t('errors.not-found.institution')
                    }
                })
                .then(json => {
                    if (json === null || json === undefined)
                        return;

                    if (json.data === null) {
                        this.journalsByGroupError = i18n.global.t('errors.internal-error')
                        return
                    }

                    this.journalsByGroup = json.data
                })
                .catch(() => {
                    this.journalsByGroupLoading = false
                    this.journalsByGroupError = i18n.global.t('errors.no-connection')
                })
        },
        createJournal(institutionId, journalName, journalGroupId, journalSubjectId) {
            this.creatingLoading = true
            this.creatingError = null
            this.creatingValidationFailure = null

            fetch(combineUrl(schedulerServiceUrlV1, `institutions/${institutionId}/journals/create/`), {
                method: 'POST',
                headers: {
                    'Authorization': useAuthStore().jwt,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: journalName,
                    groupId: journalGroupId,
                    subjectId: journalSubjectId
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
                            name: 'institution grades journal',
                            params: { locale: Translation.currentLocale, id: institutionId, journalId: response.data.id }
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
        loadTeachingGroups(institutionId) {
            this.teachingGroupsLoading = true

            fetch(combineUrl(schedulerServiceUrlV1, `institutions/${institutionId}/journals/get-teaching-groups`), {
                method: 'GET',
                headers: {
                    'Authorization': useAuthStore().jwt,
                    'Content-Type': 'application/json'
                }
            })
                .then(res => {
                    this.teachingGroupsLoading = false

                    if (res === null || res === undefined || res.status === 500)
                    {
                        this.teachingGroupsError = i18n.global.t('errors.internal-error')
                    }
                    else if (res.status === 200) {
                        return res.json()
                    }
                    else if (res.status === 401) {
                        // logout or whatever
                        this.teachingGroupsError = i18n.global.t('errors.no-authentication')
                    }
                    else if (res.status === 404) {
                        this.teachingGroupsError = i18n.global.t('errors.not-found.institution')
                    }
                })
                .then(json => {
                    if (json === null || json === undefined)
                        return;

                    if (json.data === null) {
                        this.teachingGroupsError = i18n.global.t('errors.internal-error')
                        return
                    }

                    this.teachingGroups = json.data
                })
                .catch(() => {
                    this.teachingGroupsLoading = false
                    this.teachingGroupsError = i18n.global.t('errors.no-connection')
                })
        },
        loadTeachingSubjects(institutionId) {
            this.teachingSubjectsLoading = true
            this.teachingSubjects = null

            fetch(combineUrl(schedulerServiceUrlV1, `institutions/${institutionId}/subjects/teaching-all`), {
                method: 'GET',
                headers: {
                    'Authorization': useAuthStore().jwt,
                    'Content-Type': 'application/json'
                }
            })
                .then(res => {
                    this.teachingSubjectsLoading = false

                    if (res === null || res === undefined || res.status === 500)
                    {
                        this.teachingSubjectsError = i18n.global.t('errors.internal-error')
                    }
                    else if (res.status === 200) {
                        return res.json()
                    }
                    else if (res.status === 401) {
                        // logout or whatever
                        this.teachingSubjectsError = i18n.global.t('errors.no-authentication')
                    }
                    else if (res.status === 404) {
                        this.teachingSubjectsError = i18n.global.t('errors.not-found.institution')
                    }
                })
                .then(json => {
                    if (json === null || json === undefined)
                        return;

                    if (json.data === null) {
                        this.teachingSubjectsError = i18n.global.t('errors.internal-error')
                        return
                    }

                    this.teachingSubjects = json.data
                })
                .catch(() => {
                    this.teachingSubjectsLoading = false
                    this.teachingSubjectsError = i18n.global.t('errors.no-connection')
                })
        },
    }
})