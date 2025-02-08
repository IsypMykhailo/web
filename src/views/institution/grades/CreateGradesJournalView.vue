<script>
import JournalIcon from "../../../components/icons/JournalIcon.vue";
import {useCurrentInstitutionStore} from "../../../stores/current-institution";
import Translation from "../../../i18n/translation";
import {storeToRefs} from "pinia/dist/pinia";
import {useJournalsStore} from "../../../stores/journals";
import AddIcon from "../../../components/icons/AddIcon.vue";
export default {
  components: {AddIcon, JournalIcon},
  setup() {
    const currentInstitutionStore = useCurrentInstitutionStore()
    const journalsStore = useJournalsStore()

    const { institution } = storeToRefs(currentInstitutionStore)
    const { creatingLoading, creatingError, creatingValidationFailure,
      teachingGroups, teachingGroupsLoading, teachingGroupsError,
      teachingSubjects, teachingSubjectsLoading, teachingSubjectsError  } = storeToRefs(journalsStore)
    const { createJournal, loadTeachingGroups, loadTeachingSubjects } = journalsStore

    return { institution, Translation,
      creatingLoading, creatingError, creatingValidationFailure, createJournal,
      teachingSubjects, teachingSubjectsLoading, teachingSubjectsError, loadTeachingSubjects,
      teachingGroups, teachingGroupsLoading, teachingGroupsError, loadTeachingGroups }
  },
  data() {
    return {
      journalName: '',
      journalGroupId: '',
      journalSubjectId: '',
    }
  },
  mounted() {
    if (this.institution.role !== 2) {
      this.$router.push({ name: 'dashboard', params: { locale: Translation.currentLocale } })
    }

    this.loadTeachingGroups(this.institution.id)
    this.loadTeachingSubjects(this.institution.id)
  }
}
</script>

<template>
  <div class="default-form">
    <RouterLink :to="Translation.i18nRoute({ name: 'institution grades journals', params: { id: $route.params.id } })" class="link">{{ $t('grades-journal.go-back') }}</RouterLink>

    <h2 class="form-title">{{ $t('grades-journal.create-view.title') }}</h2>
    <div v-if="this.creatingError !== null" class="error-alert">{{ this.creatingError }}</div>
    <div v-else-if="this.teachingGroupsError !== null" class="error-alert">{{ this.teachingGroupsError }}</div>
    <div v-else-if="this.teachingSubjectsError !== null" class="error-alert">{{ this.teachingSubjectsError }}</div>
    <ul v-if="this.creatingValidationFailure !== null" class="error-alert validation-alert">
      <li v-for="problem in creatingValidationFailure">
        {{ problem.key }}:
        <ul>
          <li v-for="error in problem.errors">{{ error }}</li>
        </ul>
      </li>

    </ul>

    <div class="form-section">
      <strong class="form-input-title">{{ $t('form-fields.name') }}</strong>
      <input v-model="this.journalName" class="form-input" type="text"/>
    </div>

    <div class="form-section">
      <strong class="form-input-title">{{ $t('form-fields.group') }}</strong>
      <select v-model="this.journalGroupId" class="form-input">
        <option disabled>{{ $t('form-fields.group-select') }}</option>
        <option v-if="teachingGroupsLoading === true" disabled>{{ $t('loading') }}</option>
        <option v-else v-for="teachingGroup in this.teachingGroups" :value="teachingGroup.id">
          <span v-if="teachingGroup.parentGroup === null">{{ teachingGroup.name }}</span>
          <span v-else>{{ teachingGroup.name }} ({{ teachingGroup.parentGroup.name }})</span>
        </option>
      </select>
      <RouterLink :to="Translation.i18nRoute({ name: 'institution teacher lessons', params: { id: institution.id } })" class="link">{{ $t('teachers-lessons.go-to') }}</RouterLink>
    </div>

    <div class="form-section">
      <strong class="form-input-title">{{ $t('form-fields.subject') }}</strong>
      <select v-model="this.journalSubjectId" class="form-input">
        <option disabled>{{ $t('subject.view.select') }}</option>
        <option v-if="teachingSubjectsLoading === true" disabled>{{ $t('loading') }}</option>
        <option v-else v-for="teachingSubject in this.teachingSubjects" :value="teachingSubject.id">
          <span>{{ teachingSubject.name }}</span>
        </option>
      </select>
    </div>

    <button v-if="this.creatingLoading !== true" @click="createJournal(institution.id, journalName, journalGroupId, journalSubjectId)" type="button" class="button">{{ $t('buttons.create') }}</button>
    <div v-else class="spinner"></div>
  </div>
</template>

<style scoped>

</style>