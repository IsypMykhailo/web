<script>
import JournalIcon from "../../../components/icons/JournalIcon.vue";
import {useCurrentInstitutionStore} from "../../../stores/current-institution";
import Translation from "../../../i18n/translation";
import {storeToRefs} from "pinia/dist/pinia";
import {useJournalsStore} from "../../../stores/journals";
import {groupBy} from "../../../utils/array-helper";
import AddIcon from "../../../components/icons/AddIcon.vue";
export default {
  name: "ListOfGradesJournals",
  components: {AddIcon, JournalIcon},
  setup() {
    const currentInstitutionStore = useCurrentInstitutionStore()
    const journalsStore = useJournalsStore()

    const { institution } = storeToRefs(currentInstitutionStore)
    const { journals, journalsLoading, journalsError } = storeToRefs(journalsStore)
    const { loadJournals } = journalsStore

    return { institution, Translation,
      journals, journalsLoading, journalsError,
      loadJournals }
  },
  computed: {
    groupsJournals() {
      if (this.journals === null)
        return []

      return groupBy(this.journals, journal => journal.group)
    },
    isOwnerOrAdmin() { return this.institution.role === 0 || this.institution.role === 1 },
    isTeacher() { return this.institution.role === 2 }
  },
  mounted() {
    if (this.institution.role !== 0 && this.institution.role !== 1 && this.institution.role !== 2) {
      this.$router.push({ name: 'dashboard', params: { locale: Translation.currentLocale } })
    }

    this.loadJournals(this.institution.id)
  }
}
</script>

<template>
  <div v-if="journalsError" class="default-form error-alert">
    {{ journalsError }}
  </div>

  <div v-if="journalsLoading" class="default-form centered-container">
    <div class="spinner"></div>
  </div>
  <div v-else v-for="[key, value] in groupsJournals.entries()" class="default-form">
    <h2 class="form-title">{{ key.name }}<span v-if="key.parentGroup !== undefined && key.parentGroup !== null" class="muted-text">{{ key.parentGroup.name }}</span></h2>

    <div class="form-section">
      <div class="journals-container">
        <RouterLink :to="Translation.i18nRoute({ name: 'institution grades journal', params: { id: institution.id, journalId: journal.id} })" v-for="journal in value" class="journal">
          <div class="ico">
            <JournalIcon />
          </div>

          <div class="journal-info">
            <span><strong>{{ journal.subject.name }}. </strong><span v-if="journal.name !== null">{{ journal.name }}</span></span>
            <span v-if="isOwnerOrAdmin" class="muted-text">{{ $t('grades-journal.created-by', {teacherId: journal.teacherId}) }}</span>
          </div>
        </RouterLink>
      </div>
    </div>
  </div>

  <div v-if="isTeacher === true && journalsLoading === false && journals !== null" class="default-form centered-container">
    <RouterLink :to="Translation.i18nRoute({ name: 'create institution grades journal', params: { id: institution.id } })" class="simplified-button">
      <AddIcon class="ico" />
    </RouterLink>
  </div>
</template>

<style scoped>
.centered-container {
  display: flex;
  justify-content: center;
}

.form-title .muted-text {
  margin-left: 0.25rem;
}

.journals-container {
  display: flex;
  flex-wrap: wrap;
}

.journal {
  text-decoration: none;
  color: var(--text-color);
  cursor: pointer;
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  height: 5rem;
  margin-bottom: 1rem;
  border-radius: 1rem;
  border: 1px solid var(--border-color);
  line-height: 1.20rem;
}

.journal .ico {
  margin: 1rem;
}

.journal-info {
  display: flex;
  flex-direction: column;
}

.journal-info .muted-text {
  font-size: 10pt;
}
</style>