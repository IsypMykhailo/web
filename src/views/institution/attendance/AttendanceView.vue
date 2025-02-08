<script>
import {useCurrentInstitutionStore} from "../../../stores/current-institution";
import Translation from "../../../i18n/translation";
import {storeToRefs} from "pinia/dist/pinia";
import {useAttendanceStore} from "../../../stores/attendance";
import AddIcon from "../../../components/icons/AddIcon.vue";

export default {
  components: {AddIcon},
  setup() {
    const currentInstitutionStore = useCurrentInstitutionStore()
    const attendanceStore = useAttendanceStore()

    const { institution } = storeToRefs(currentInstitutionStore)

    const { attendees, attendeesLoading, attendeesError, updatingStudentId } = storeToRefs(attendanceStore)
    const { loadAttendees, checkAttendance } = attendanceStore

    return { institution, Translation,
      attendees, attendeesLoading, attendeesError, updatingStudentId, loadAttendees, checkAttendance }
  },
  mounted() {
    if (this.institution.role !== 2) {
      this.$router.push(this.Translation.i18nRoute({ name: 'dashboard' }))
    }

    this.loadAttendees(this.institution.id, this.$route.params.lessonId)
  }
}
</script>

<template>
  <RouterLink class="link" :to="Translation.i18nRoute({ name: 'institution teacher lessons', params: { id: institution.id } })">{{ $t('attendance.go-back-to-schedule') }}</RouterLink>

  <div v-if="attendeesError" class="error-alert">
    {{ attendeesError }}
  </div>

  <div v-if="attendeesLoading === true">
    <div class="spinner"></div>
  </div>

  <div v-else-if="attendees !== null" class="attendance-container">
    <div class="attendance-nav">
      <h1 class="attendance-title">{{ $t('form-fields.attendance') }}</h1>

      <div class="attendance-control-panel">
        <button @click="checkAttendance(institution.id, $route.params.lessonId)" type="button" class="button">{{ $t('buttons.save') }}</button>
      </div>
    </div>

    <div class="attendance-table-container">
      <table class="attendance-table">
        <tr>
          <th>{{ $t('user-roles.student') }}</th>
          <th>{{ $t('attendance.status') }}</th>
          <th>{{ $t('form-fields.comment') }}</th>
        </tr>
        <tr v-for="student in attendees" class="attendee">
          <td>
            <div class="student-info">
              <div class="pfp" />
              <span>$id {{ student.key }} *first name* *last name*</span>
            </div>
          </td>
          <td>
            <div class="attendance-radio-buttons">
              <input type="radio" v-model="student.value.attendanceType" :name="student.key" :value="0" />
              <input type="radio" v-model="student.value.attendanceType" :name="student.key" :value="1" />
              <input type="radio" v-model="student.value.attendanceType" :name="student.key" :value="2" />
            </div>
          </td>
          <td>
            <div class="attendance-comment">
              <textarea v-if="student.value.description !== null" v-model="student.value.description" class="form-input"></textarea>
              <div v-else-if="student.value.attendanceType !== -1" @click="student.value.description = ''" class="simplified-button">
                <AddIcon class="ico" />
              </div>
              <span class="muted-text" v-else>{{ $t('lessons-schedule.view.no-data') }}</span>
            </div>
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>

<style scoped>
.error-alert {
  margin-top: 1rem;
  margin-bottom: 1rem;
}

.attendance-nav {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.attendance-control-panel {
  display: flex;
  align-items: center;
}

.attendance-table-container {
  width: 100%;
  max-width: 100%;
  overflow-y: auto;
  height: 100%;
}

.attendance-table {
  width: 100%;
}

.attendee .student-info {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.attendee .student-info .pfp {
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 50%;
  border: 1px solid var(--border-color);
  margin-right: 0.75rem;
}

.attendee .attendance-comment {
  display: flex;
  justify-content: center;
}

.attendance-radio-buttons {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;
}

.attendance-radio-buttons input[type='radio'] {
  width: 1rem;
  height: 1rem;
  vertical-align: top;
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
  border: 2px solid;
  border-radius: 50%;
  appearance: none;
  margin: 0.5rem;
  cursor: pointer;
  transition: .15s all;
}

.attendance-radio-buttons input[type='radio']:nth-child(1) {
  border-color: #f00;
}

.attendance-radio-buttons input[type='radio']:nth-child(1):checked {
  background-color: #f00;
  box-shadow: 0 0 15px rgba(255, 0, 0, 0.25);
}

.attendance-radio-buttons input[type='radio']:nth-child(2) {
  border-color: #f4c000;
}

.attendance-radio-buttons input[type='radio']:nth-child(2):checked {
  background-color: #f4c000;
  box-shadow: 0 0 15px rgba(244, 192, 0, 0.25);
}

.attendance-radio-buttons input[type='radio']:nth-child(3) {
  border-color: #11b200;
}

.attendance-radio-buttons input[type='radio']:nth-child(3):checked {
  background-color: #11b200;
  box-shadow: 0 0 15px rgba(17, 178, 0, 0.25);
}

table tr th,
table tr td {
  padding: 1rem;
}
</style>