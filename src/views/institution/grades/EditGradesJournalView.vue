<script>
import JournalIcon from "../../../components/icons/JournalIcon.vue";
import {useCurrentInstitutionStore} from "../../../stores/current-institution";
import Translation from "../../../i18n/translation";
import {storeToRefs} from "pinia/dist/pinia";
import {useJournalsStore} from "../../../stores/journals";
import AddIcon from "../../../components/icons/AddIcon.vue";
import {useGradesStore} from "../../../stores/grades";
export default {
  name: "ListOfGradesJournals",
  components: {AddIcon, JournalIcon},
  setup() {
    const currentInstitutionStore = useCurrentInstitutionStore()
    const gradesStore = useGradesStore()

    const { institution } = storeToRefs(currentInstitutionStore)
    const { journal, journalLoading, journalError, editLoading, editError, editValidationFailure } = storeToRefs(gradesStore)
    const { editJournal, loadJournal } = gradesStore

    return { institution, Translation,
      journal, journalLoading, journalError, editLoading, editError, editValidationFailure, editJournal, loadJournal }
  },
  data() {
    return {
      journalName: '',
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
        if (this.journal.hasAccessToEdit !== true) {
          this.$router.push({ name: 'dashboard', params: { locale: Translation.currentLocale } })
        }

        this.journalName = this.journal.name
      }
    }
  }
}
</script>

<template>
  <div class="default-form">
    <RouterLink :to="Translation.i18nRoute({ name: 'institution grades journal', params: { id: $route.params.id, journalId: $route.params.journalId } })" class="link">{{ $t('grades-journal.go-back-to-journal') }}</RouterLink>

    <h2 class="form-title">{{ $t('grades-journal.edit-view.title') }}</h2>

    <div v-if="journalLoading === true" class="spinner"></div>
    <div v-else-if="journalError !== null" class="error-alert">{{ journalError }}</div>
    <div v-else-if="editError !== null" class="error-alert">{{ editError }}</div>
    <ul v-if="editValidationFailure !== null" class="error-alert validation-alert">
      <li v-for="problem in editValidationFailure">
        {{ problem.key }}:
        <ul>
          <li v-for="error in problem.errors">{{ error }}</li>
        </ul>
      </li>
    </ul>

    <div v-if="journal !== null" class="form-section">
      <strong class="form-input-title">{{ $t('form-fields.name') }}</strong>
      <input v-model="journalName" class="form-input" type="text"/>
    </div>

    <button v-if="journal !== null && this.editLoading !== true" @click="editJournal(institution.id, journal.id, journalName)" type="button" class="button">{{ $t('buttons.edit') }}</button>
    <div v-else-if="journal !== null" class="spinner"></div>
  </div>
</template>

<style scoped>

</style>