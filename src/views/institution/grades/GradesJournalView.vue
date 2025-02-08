<script>
import JournalIcon from "../../../components/icons/JournalIcon.vue";
import {useCurrentInstitutionStore} from "../../../stores/current-institution";
import Translation from "../../../i18n/translation";
import {storeToRefs} from "pinia/dist/pinia";
import AddIcon from "../../../components/icons/AddIcon.vue";
import {useGradesStore} from "../../../stores/grades";
import EditIcon from "../../../components/icons/EditIcon.vue";
import DeleteIcon from "../../../components/icons/DeleteIcon.vue";
import {getDateString} from "../../../utils/date-helper";
export default {
  components: {DeleteIcon, EditIcon, AddIcon, JournalIcon},
  setup() {
    const currentInstitutionStore = useCurrentInstitutionStore()
    const gradesStore = useGradesStore()

    const { institution } = storeToRefs(currentInstitutionStore)
    const { journal, journalLoading, journalError, deletingColumnId, gradeLoading, gradeError, gradeValidationFailure } = storeToRefs(gradesStore)
    const { loadJournal, deleteJournal, deleteColumn, rateStudent } = gradesStore

    return { institution, Translation, getDateString,
      journal, journalLoading, journalError,
      gradeLoading, gradeError, gradeValidationFailure, rateStudent,
      deletingColumnId, deleteColumn,
      loadJournal, deleteJournal }
  },
  data() {
    return {
      selectedColumn: null,
      selectedGrade: null,
      selectedPoints: null,
      gradeDescription: '',
    }
  },
  mounted() {
    if (this.institution.role !== 0 && this.institution.role !== 1 && this.institution.role !== 2) {
      this.$router.push({ name: 'dashboard', params: { locale: Translation.currentLocale } })
    }

    this.loadJournal(this.institution.id, this.$route.params.journalId, true)
  },
  computed: {
    getStudentsGrade() { return (column, studentId) => {
      const grade = column.grades.find(e => e.studentId === studentId)

      if (grade === undefined || grade === null)
        return null

      return grade.points
    }}
  },
  methods: {
    selectColumn(column) {
      this.selectedColumn = column
    },
    selectColumnAndStudent(column, studentId) {
      this.selectedGrade = { columnId: column.id, studentId: studentId }

      const grade = column.grades.find(e => e.studentId === studentId)

      console.log(grade)
      if (grade !== undefined && grade !== null) {
        this.selectedPoints = grade.points
        this.gradeDescription = grade.description
      }
      else {
        this.selectedPoints = 0
        this.gradeDescription = null
      }

      const rateStudentModal = new bootstrap.Modal(document.getElementById('rateStudentModal'))
      rateStudentModal.show()
    }
  }
}
</script>

<template>
  <div class="journal-container">
    <div class="journal-control-panel">
      <RouterLink :to="Translation.i18nRoute({ name: 'institution grades journals', params: { id: institution.id } })" class="link">{{ $t('grades-journal.go-back') }}</RouterLink>
    </div>

    <div v-if="journalError !== null" class="error-alert">{{ journalError }}</div>
    <div v-else-if="gradeError !== null" class="error-alert">{{ gradeError }}</div>
    <ul v-else-if="gradeValidationFailure !== null" class="error-alert validation-alert">
      <li v-for="problem in gradeValidationFailure">
        {{ problem.key }}:
        <ul>
          <li v-for="error in problem.errors">{{ error }}</li>
        </ul>
      </li>
    </ul>

    <div v-if="journalLoading === true" class="centered-container">
      <div class="spinner"></div>
    </div>
    <div v-else-if="journal !== null">
      <div class="journal-control-panel">
        <div class="journal-control-panel-main-info">
          <h2 class="journal-title">{{ journal.name }}</h2>

          <RouterLink :to="Translation.i18nRoute({ name: 'edit institution grades journal', params: { id: institution.id, journalId: journal.id } })" v-if="journal.hasAccessToEdit" class="simplified-button">
            <EditIcon class="ico" />
          </RouterLink>

          <div data-bs-toggle="modal" data-bs-target="#deleteJournalModal" v-if="journal.hasAccessToEdit" class="simplified-button">
            <DeleteIcon class="ico" />
          </div>
        </div>

        <div class="journal-control-panel-additional-info">
          <span>{{ $t('form-fields.subject') }}: {{ journal.subject.name }}</span>
          <span>{{ $t('form-fields.group') }}: {{ journal.group.name }} <span class="muted-text" v-if="journal.group.parentGroup !== null">{{ journal.group.parentGroup.name }}</span></span>
          <span v-if="journal.hasAccessToEdit === false" >{{ $t('form-fields.teacher') }}: $id {{ journal.teacherId }}</span>
        </div>
      </div>

      <div class="journal-table-container">
        <table class="journal-table">
          <tr>
            <th>{{ $t('user-roles.student') }}</th>
            <th v-if="journal.columns.length !== 0"
                v-for="column in journal.columns"
                @click="selectColumn(column)"
                :class="{ 'selected': journal.hasAccessToEdit === true && selectedColumn !== null && selectedColumn.id === column.id }"
                class="journal-column-header-container">
              <div v-if="deletingColumnId !== column.id" class="journal-column-header">
                <div class="journal-column-info">
                  <span v-if="column.columnHeader !== null">{{ column.columnHeader }}</span>
                  <span v-if="column.lesson !== null" class="journal-column-date">{{ $t('form-fields.lesson') }}: {{ column.lesson.date }}</span>
                  <span v-else-if="column.homework !== null" class="journal-column-date">{{ $t('form-fields.homework-short') }}: {{ getDateString(new Date(column.homework.uploadedDate)) }}</span>
                  <span v-else-if="column.date !== null" class="journal-column-date">{{ column.date }}</span>
                </div>
                <div v-if="journal.hasAccessToEdit && selectedColumn !== null && selectedColumn.id === column.id" class="journal-column-control-panel">
                  <RouterLink :to="Translation.i18nRoute({ name: 'edit institution journal column', params: { id: institution.id, journalId: journal.id, columnId: column.id } })" class="simplified-button">
                    <EditIcon class="ico ico-small" />
                  </RouterLink>
                  <div class="simplified-button">
                    <DeleteIcon data-bs-toggle="modal" data-bs-target="#deleteColumnModal" class="ico ico-small" />
                  </div>
                </div>
              </div>

              <div v-else class="journal-column-header">
                <div class="spinner"></div>
              </div>
            </th>
            <th v-else>
              <div class="journal-column-header" style="color: var(--muted-color); font-weight: normal; font-size: 10pt">
                {{ $t('journal.view.no-columns') }}
              </div>
            </th>
            <th v-if="journal.hasAccessToEdit === true">
              <RouterLink :to="Translation.i18nRoute({ name: 'create institution journal column', params: { id: institution.id, journalId: journal.id } })" class="simplified-button" style="display: block">
                <AddIcon class="ico" />
              </RouterLink>
            </th>
          </tr>
          <tr v-for="student in journal.group.users">
            <td>$id {{ student.id }}</td>
            <td @mouseup="selectColumnAndStudent(column, student.id)" v-if="journal.columns.length !== 0" v-for="column in journal.columns" class="journal-table-grades">
              <div v-if="gradeLoading !== null && gradeLoading.columnId === column.id && gradeLoading.studentId === student.id">
                <div class="spinner"></div>
              </div>
              <div v-else class="grade" :class="`grade-${getStudentsGrade(column, student.id)}`">{{ getStudentsGrade(column, student.id) }}</div>
            </td>
            <td v-else></td>
            <td v-if="journal.hasAccessToEdit === true"></td>
          </tr>
        </table>
      </div>
    </div>
  </div>

  <div v-if="journal !== null && journal.hasAccessToEdit" class="modal modal-alert" tabindex="-1" role="dialog" id="deleteJournalModal" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content rounded-3 shadow">
        <div class="modal-body p-4 text-center">
          <h5 class="mb-0">{{ $t('journal.view.delete-modal.title') }}</h5>
          <p style="font-size: 11pt" class="mb-0">{{ $t('modal.default-warning') }}</p>
        </div>
        <div class="modal-footer flex-nowrap p-0">
          <button type="button" class="btn btn-lg btn-link fs-6 text-decoration-none col-6 m-0 rounded-0" data-bs-dismiss="modal"><strong>{{ $t('buttons.cancel') }}</strong></button>
          <button @click="deleteJournal(institution.id, journal.id)" type="button" class="btn btn-lg btn-link fs-6 text-decoration-none col-6 m-0 rounded-0" style="font-weight: 500; color: var(--danger-color)"  data-bs-dismiss="modal">{{ $t('buttons.delete') }}</button>
        </div>
      </div>
    </div>
  </div>

  <div v-if="journal !== null && journal.hasAccessToEdit" class="modal modal-alert" tabindex="-1" role="dialog" id="deleteColumnModal" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content rounded-3 shadow">
        <div class="modal-body p-4 text-center">
          <h5 class="mb-0">{{ $t('journal.view.delete-column-modal.title') }}</h5>
          <p style="font-size: 11pt" class="mb-0">{{ $t('modal.default-warning') }}</p>
        </div>
        <div class="modal-footer flex-nowrap p-0">
          <button type="button" class="btn btn-lg btn-link fs-6 text-decoration-none col-6 m-0 rounded-0" data-bs-dismiss="modal"><strong>{{ $t('buttons.cancel') }}</strong></button>
          <button @click="deleteColumn(institution.id, journal.id, selectedColumn.id)" type="button" class="btn btn-lg btn-link fs-6 text-decoration-none col-6 m-0 rounded-0" style="font-weight: 500; color: var(--danger-color)" data-bs-dismiss="modal">{{ $t('buttons.delete') }}</button>
        </div>
      </div>
    </div>
  </div>

  <div v-if="journal !== null && journal.hasAccessToEdit === true" class="modal modal-alert" tabindex="-1" role="dialog" id="rateStudentModal" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content rounded-3 shadow">
        <div class="modal-body p-4 text-center">
          <h5 class="mb-0">{{ $t('journal.view.mark-student.title') }}</h5>
          <p style="font-size: 11pt" class="mb-0">{{ $t('journal.view.mark-student.hint') }}</p>

          <select v-model="selectedPoints" class="form-input">
            <option selected disabled>{{ $t('journal.select-grade') }}</option>
            <option :value="0">{{ $t('form-fields.none') }}</option>
            <option v-for="n in 12" :value="n">{{ n }}</option>
          </select>

          <textarea v-model="gradeDescription" class="form-input"></textarea>
        </div>
        <div class="modal-footer flex-nowrap p-0">
          <button type="button" class="btn btn-lg btn-link fs-6 text-decoration-none col-6 m-0 rounded-0" data-bs-dismiss="modal"><strong>{{ $t('buttons.cancel') }}</strong></button>
          <button :disabled="selectedPoints === null" @click="rateStudent(institution.id, journal.id, selectedGrade.columnId, selectedGrade.studentId, selectedPoints, gradeDescription)" type="button" class="btn btn-lg btn-link fs-6 text-decoration-none col-6 m-0 rounded-0" data-bs-dismiss="modal">{{ $t('buttons.rate') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.journal-control-panel {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
}

.journal-control-panel .journal-control-panel-main-info {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
}

.journal-control-panel .journal-control-panel-additional-info {
  display: flex;
  flex-direction: column;
}

.journal-control-panel a:first-child {
  margin-right: 0.5rem;
}

.error-alert, .journal-control-panel {
  margin-bottom: 1rem;
}

.centered-container {
  display: flex;
  justify-content: center;
}

.journal-container {
  display: flex;
  flex-direction: column;
}

.journal-table-container {
  width: 100%;
  max-width: 100%;
  overflow-y: auto;
  height: 100%;
}

.journal-table {
  height: 100%;
}

.journal-column-header-container {
  transition: background-color .15s;
  cursor: pointer;
}

.journal-column-header-container.selected {
  background-color: rgba(0,0,0,0.1);
}

.journal-column-header-container:hover {
  background-color: rgba(0,0,0,0.1);
}

.journal-column-header {
  display: flex;
  flex-direction: row;
  text-align: center;
}

.journal-column-info {
  display: flex;
  flex-direction: column;
}

.journal-column-control-panel {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.journal-column-control-panel .simplified-button {
  margin: 0.1rem;
}

.ico {
  fill: none;
}

.journal-table-grades {
  text-align: center;
  transition: .15s background-color;
  cursor: pointer;
}

.journal-table-grades:hover {
  background-color: rgba(0,0,0,0.1);
}

.journal-column-date {
  color: var(--muted-color);
  font-size: 9pt;
  font-weight: normal;
}



.modal-body .form-input {
  margin-top: 0.5rem;
}

table tr th,
table tr td {
  min-width: 3rem;
}
</style>