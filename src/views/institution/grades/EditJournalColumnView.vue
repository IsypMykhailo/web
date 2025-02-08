<script>
import JournalIcon from "../../../components/icons/JournalIcon.vue";
import {useCurrentInstitutionStore} from "../../../stores/current-institution";
import Translation from "../../../i18n/translation";
import {storeToRefs} from "pinia/dist/pinia";
import AddIcon from "../../../components/icons/AddIcon.vue";
import {useGradesStore} from "../../../stores/grades";
import {useLessonsSchedulesStore} from "../../../stores/lessons-schedules";
import {useHomeworksStore} from "../../../stores/homeworks";
export default {
  components: {AddIcon, JournalIcon},
  setup() {
    const currentInstitutionStore = useCurrentInstitutionStore()
    const gradesStore = useGradesStore()

    const { institution } = storeToRefs(currentInstitutionStore)

    const { journal, journalLoading, journalError,
      column, columnLoading, columnError,
      editColumnLoading, editColumnError, editColumnValidationFailure } = storeToRefs(gradesStore)
    const { loadJournal, loadColumn, editColumn } = gradesStore

    return { institution, Translation,
      journal, journalLoading, journalError, loadJournal,
      column, columnLoading, columnError, loadColumn,
      editColumnLoading, editColumnError, editColumnValidationFailure, editColumn }
  },
  data() {
    return {
      columnName: null,
    }
  },
  mounted() {
    if (this.institution.role !== 2) {
      this.$router.push({ name: 'dashboard', params: { locale: Translation.currentLocale } })
    }

    this.loadJournal(this.institution.id, this.$route.params.journalId, false)
  },
  watch: {
    journal() {
      if (this.journal !== null) {
        if (this.journal.hasAccessToEdit !== true)
          this.$router.push({ name: 'dashboard', params: { locale: Translation.currentLocale } })

        this.loadColumn(this.institution.id, this.journal.id, this.$route.params.columnId)
      }
    },
    column() {
      if (this.column !== null) {
        this.columnName = this.column.columnHeader
      }
    }
  }
}
</script>

<template>
  <div class="default-form">
    <RouterLink :to="Translation.i18nRoute({ name: 'institution grades journal', params: { id: $route.params.id, journalId: $route.params.journalId } })" class="link">{{ $t('grades-journal.go-back-to-journal') }}</RouterLink>

    <h2 class="form-title">{{ $t('grades-journal.edit-column-view.title') }}</h2>
    <div v-if="journalError !== null" class="error-alert">{{ journalError }}</div>
    <div v-else-if="columnError !== null" class="error-alert">{{ columnError }}</div>
    <div v-else-if="editColumnError !== null" class="error-alert">{{ editColumnError }}</div>
    <ul v-if="editColumnValidationFailure !== null" class="error-alert validation-alert">
      <li v-for="problem in editColumnValidationFailure">
        {{ problem.key }}:
        <ul>
          <li v-for="error in problem.errors">{{ error }}</li>
        </ul>
      </li>
    </ul>

    <div v-if="journalLoading === true" class="spinner"></div>
    <div v-else-if="columnLoading === true" class="spinner"></div>
    <div v-else-if="journal !== null && column !== null">
      <div class="form-section">
        <strong class="form-input-title">{{ $t('form-fields.name') }}</strong>
        <input v-model="columnName" class="form-input" type="text"/>
      </div>

      <button v-if="editColumnLoading === false"
              @click="editColumn(institution.id, journal.id, column.id, columnName)"
              type="button" class="button">{{ $t('buttons.edit') }}</button>
      <div v-else class="spinner"></div>
    </div>
  </div>
</template>