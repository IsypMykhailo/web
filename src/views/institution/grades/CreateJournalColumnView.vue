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
    const lessonsStore = useLessonsSchedulesStore()
    const homeworksStore = useHomeworksStore()

    const { institution } = storeToRefs(currentInstitutionStore)

    const { journal, journalLoading, journalError,
      creatingColumnLoading, creatingColumnError, creatingColumnValidationFailure } = storeToRefs(gradesStore)
    const { loadJournal, createColumn } = gradesStore

    const { loadedLessonItem, lessonLoading, lessonError } = storeToRefs(lessonsStore)
    const { loadLessonById } = lessonsStore

    const { loadedHomework, editLoading, editError } = storeToRefs(homeworksStore)
    const { loadHomeworkById } = homeworksStore

    return { institution, Translation,
      journal, journalLoading, journalError, loadJournal,
      creatingColumnLoading, creatingColumnError, creatingColumnValidationFailure, createColumn,
      loadedLessonItem, lessonLoading, lessonError, loadLessonById,
      loadedHomework, editLoading, editError, loadHomeworkById }
  },
  data() {
    return {
      columnName: null,
      columnDate: null,
      columnLessonId: null,
      columnHomeworkId: null,
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
      if (this.journal !== null && this.journal.hasAccessToEdit !== true) {
        this.$router.push({ name: 'dashboard', params: { locale: Translation.currentLocale } })
      }

      this.loadedHomework = null
      this.loadedLessonItem = null

      if (this.$route.query.lessonId !== undefined && this.$route.query.lessonId !== null) {
        this.loadLessonById(this.institution.id, this.journal.group.id, parseInt(this.$route.query.lessonId))
      }
      else if (this.$route.query.homeworkId !== undefined && this.$route.query.homeworkId !== null) {
        this.loadHomeworkById(this.institution.id, this.journal.group.id, parseInt(this.$route.query.homeworkId))
      }
    },
    loadedLessonItem() {
      if (this.loadedLessonItem !== null)
        this.columnLessonId = this.loadedLessonItem.id
    },
    loadedHomework() {
      if (this.loadedHomework !== null)
        this.columnHomeworkId = this.loadedHomework.id
    }
  }
}
</script>

<template>
  <div class="default-form">
    <RouterLink :to="Translation.i18nRoute({ name: 'institution grades journal', params: { id: $route.params.id, journalId: $route.params.journalId } })" class="link">{{ $t('grades-journal.go-back-to-journal') }}</RouterLink>

    <h2 class="form-title">{{ $t('grades-journal.create-column-view.title') }}</h2>
    <div v-if="journalError !== null" class="error-alert">{{ journalError }}</div>
    <div v-else-if="lessonError !== null" class="error-alert">{{ lessonError }}</div>
    <div v-else-if="editError !== null" class="error-alert">{{ editError }}</div>
    <div v-else-if="creatingColumnError !== null" class="error-alert">{{ creatingColumnError }}</div>
    <ul v-if="creatingColumnValidationFailure !== null" class="error-alert validation-alert">
      <li v-for="problem in creatingColumnValidationFailure">
        {{ problem.key }}:
        <ul>
          <li v-for="error in problem.errors">{{ error }}</li>
        </ul>
      </li>
    </ul>

    <div v-if="journalLoading === true || lessonLoading === true || editLoading === true" class="spinner"></div>
    <div v-else-if="journal !== null">
      <div class="form-section">
        <strong class="form-input-title">{{ $t('form-fields.name') }}</strong>
        <input v-model="columnName" class="form-input" type="text"/>
      </div>

      <div v-if="loadedLessonItem !== null" class="form-section attachment-section">
        <strong class="form-input-title">{{ $t('form-fields.attached-lesson') }}</strong>
        <span style="font-weight: bold">#{{ loadedLessonItem.lessonIndex }}. {{ loadedLessonItem.subject.name }}</span>
        <span v-if="loadedLessonItem.subGroup !== null">
          {{ loadedLessonItem.subGroup.name }}
          <span v-if="journal.group.id === loadedLessonItem.subGroup.id" class="muted-text">{{ journal.group.parentGroup.name }}</span>
          <span v-else class="muted-text">{{ journal.group.name }}</span>
        </span>
        <span v-else>{{ journal.group.name }}</span>
        <span>{{ loadedLessonItem.date }}</span>
      </div>

      <div v-else-if="loadedHomework !== null" class="form-section attachment-section">
        <strong class="form-input-title">{{ $t('form-fields.attached-homework') }}</strong>

        <span>
          <span style="font-weight: bold">{{ loadedHomework.title }}. </span>
          <span v-if="journal.group.parentGroup !== null" class="muted-text">{{ journal.group.parentGroup.name }}: {{ journal.group.name }}</span>
          <span v-else class="muted-text">{{ journal.group.name }}</span>
        </span>

        <span>{{ $t('form-fields.date') }}: <span class="muted-text">{{ new Date(loadedHomework.uploadedDate).toLocaleString(this.$t('language'), { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric'}) }}</span></span>
        <span>{{ $t('form-fields.due-date') }}: <span class="muted-text">{{ new Date(loadedHomework.dueDate).toLocaleString(this.$t('language'), { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric'}) }}</span></span>
      </div>

      <div v-else class="form-section">
        <strong class="form-input-title">{{ $t('form-fields.date') }}</strong>
        <input v-model="columnDate" class="form-input" type="date"/>
      </div>

      <button v-if="creatingColumnLoading === false"
              @click="createColumn(institution.id, journal.id, columnName, columnDate, columnLessonId, columnHomeworkId)"
              :disabled="loadedLessonItem === null && loadedHomework === null && columnDate === null"
              type="button" class="button">{{ $t('buttons.create') }}</button>
      <div v-else class="spinner"></div>
    </div>
  </div>
</template>

<style scoped>
.attachment-section {
  display: flex;
  flex-direction: column;
}
</style>