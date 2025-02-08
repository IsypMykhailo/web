<script>
import {useCurrentInstitutionStore} from "../../../stores/current-institution";
import Translation from "../../../i18n/translation";
import {storeToRefs} from "pinia/dist/pinia";
import {useGradesStore} from "../../../stores/grades";
import {getDateString} from "../../../utils/date-helper";

export default {
  setup() {
    const currentInstitutionStore = useCurrentInstitutionStore()
    const gradesStore = useGradesStore()

    const { institution } = storeToRefs(currentInstitutionStore)
    const { studentGrades, studentGradesLoading, studentGradesError } = storeToRefs(gradesStore)
    const { loadStudentGrades } = gradesStore

    return { institution, Translation, getDateString,
      studentGrades, studentGradesLoading, studentGradesError, loadStudentGrades }
  },
  data() {
    return {
      selectedGrade: null,
    }
  },
  mounted() {
    if (this.institution.role !== 3) {
      this.$router.push({ name: 'dashboard', params: { locale: Translation.currentLocale } })
    }

    this.loadStudentGrades(this.institution.id)
  },
  computed: {
    maxGradesCount() {
      let max = 0

      for (const subjectGrades of this.studentGrades) {
        if (subjectGrades.value.length > max)
          max = subjectGrades.value.length
      }

      return max
    }
  },
  methods: {
    selectGrade(grade, subject) {
      if (grade === undefined || grade === null)
        return

      this.selectedGrade = grade
      this.selectedGrade.subject = subject

      const gradeInfoModal = new bootstrap.Modal(document.getElementById('gradeInfoModal'))
      gradeInfoModal.show()
    }
  }
}
</script>

<template>
  <div class="journal-container">
    <div v-if="studentGradesError !== null" class="error-alert">{{ studentGradesError }}</div>

    <div v-if="studentGradesLoading === true">
      <div class="spinner"></div>
    </div>

    <div v-else-if="studentGrades !== null">
      <h1 style="margin-bottom: 1rem">{{ $t('grades.view.your-grades') }}</h1>

      <div class="journal-table-container">
        <table class="journal-table">
          <tr>
            <th>{{ $t('form-fields.subject') }}</th>
            <th v-if="studentGrades.length > 0" :colspan="maxGradesCount">{{ $t('nav.institution-grades') }}</th>
            <th v-else>
              <div class="journal-column-header" style="color: var(--muted-color); font-weight: normal; font-size: 10pt">
                {{ $t('grades.view.no-grades') }}
              </div>
            </th>
          </tr>
          <tr v-for="subjectGrades in studentGrades">
            <td>{{ subjectGrades.key.name }}</td>
            <td v-if="studentGrades.length > 0" v-for="index in maxGradesCount" :class="{ 'journal-table-grades': subjectGrades.value[index - 1] !== undefined }" @click="selectGrade(subjectGrades.value[index - 1], subjectGrades.key)" >
              <div v-if="subjectGrades.value[index - 1] !== undefined" class="grade" :class="`grade-${subjectGrades.value[index - 1].points}`">{{ subjectGrades.value[index - 1].points }}</div>
            </td>
            <td v-else></td>
          </tr>
        </table>
      </div>
    </div>
  </div>

  <div class="modal modal-alert" tabindex="-1" role="dialog" id="gradeInfoModal">
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content rounded-4 shadow">
        <div class="modal-body p-5">
          <h2 class="fw-bold mb-0">{{ $t('grade.information') }}</h2>

          <ul v-if="selectedGrade !== null" class="d-grid gap-4 my-5 list-unstyled">
            <li class="d-flex gap-4">
              <div>
                <h5 class="mb-0">{{ $t('form-fields.name') }}</h5>
                <span v-if="selectedGrade.column.columnHeader !== null">{{ selectedGrade.column.columnHeader }}</span>
                <span v-else class="muted-text">{{ $t('lessons-schedule.view.no-data') }}</span>
              </div>
            </li>
            <li class="d-flex gap-4">
              <div>
                <h5 class="mb-0">{{ $t('form-fields.subject') }}</h5>
                <span v-if="selectedGrade.subject !== null">{{ selectedGrade.subject.name }}</span>
                <span v-else class="muted-text">{{ $t('lessons-schedule.view.no-data') }}</span>
              </div>
            </li>
            <li class="d-flex gap-4">
              <div v-if="selectedGrade.column.date !== null">
                <h5 class="mb-0">{{ $t('form-fields.date') }}</h5>
                <span>{{ selectedGrade.column.date }}</span>
              </div>
              <div v-else-if="selectedGrade.column.lesson !== null">
                <h5 class="mb-0">{{ $t('form-fields.lesson') }}</h5>
                <div style="display: flex; flex-direction: column">
                  <span>
                    <span style="font-weight: bold">#{{ selectedGrade.column.lesson.lessonIndex }}. </span>
                    <span>{{ selectedGrade.column.lesson.date }}</span>
                  </span>

                  <span>{{ $t('user-roles.teacher') }}: $id {{ selectedGrade.column.lesson.teacherId }}</span>
                </div>
              </div>
              <div v-else-if="selectedGrade.column.homework !== null">
                <h5 class="mb-0">{{ $t('form-fields.homework') }}</h5>
                <div style="display: flex; flex-direction: column">
                  <span>
                    <span style="font-weight: bold;">{{ selectedGrade.column.homework.title }}.</span>
                  </span>
                  <span>{{ $t('form-fields.date')}}: {{ getDateString(new Date(selectedGrade.column.homework.uploadedDate)) }}</span>
                  <span>{{ $t('form-fields.due-date')}}: {{ getDateString(new Date(selectedGrade.column.homework.dueDate)) }}</span>
                </div>
              </div>
              <div v-else>
                <h5 class="mb-0">{{ $t('form-fields.date') }}</h5>
                <span class="muted-text">{{ $t('lessons-schedule.view.no-data') }}</span>
              </div>
            </li>
            <li class="d-flex gap-4">
              <div>
                <h5 class="mb-0">{{ $t('form-fields.comment') }}</h5>
                <span v-if="selectedGrade.description !== null">{{ selectedGrade.description }}</span>
                <span v-else class="muted-text">{{ $t('lessons-schedule.view.no-data') }}</span>
              </div>
            </li>
          </ul>

          <button type="button" class="button button-large mt-5 w-100" data-bs-dismiss="modal">{{ $t('buttons.thanks') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.error-alert {
  margin-bottom: 1rem;
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

.journal-column-header {
  display: flex;
  flex-direction: row;
  text-align: center;
}

.journal-table-grades {
  text-align: center;
  transition: .15s background-color;
  cursor: pointer;
}

.journal-table-grades:hover {
  background-color: rgba(0,0,0,0.1);
}

table tr th,
table tr td {
  min-width: 3rem;
}
</style>