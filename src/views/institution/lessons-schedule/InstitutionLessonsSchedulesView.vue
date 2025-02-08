<script>
import {useCurrentInstitutionStore} from "../../../stores/current-institution";
import {storeToRefs} from "pinia/dist/pinia";
import {useGroupsStore} from "../../../stores/groups";
import Translation from "../../../i18n/translation";
import ArrowIcon from "../../../components/icons/ArrowIcon.vue";
import {useLessonsSchedulesStore} from "../../../stores/lessons-schedules";
import AddIcon from "../../../components/icons/AddIcon.vue";
import {useBellSchedulesStore} from "../../../stores/bell-schedules";
import {useSubjectsStore} from "../../../stores/subjects";
import {getDateString, getWeekNumber} from "../../../utils/date-helper";
import {useSubGroupsStore} from "../../../stores/sub-groups";
import {stringToColor} from "../../../utils/color-helper";

export default {
  components: {AddIcon, ArrowIcon},
  setup() {
    const currentInstitutionStore = useCurrentInstitutionStore()
    const groupsStore = useGroupsStore()
    const subGroupsStore = useSubGroupsStore()
    const lessonsSchedulesStore = useLessonsSchedulesStore()
    const bellSchedulesStore = useBellSchedulesStore()
    const subjectsStore = useSubjectsStore()

    const { institution } = storeToRefs(currentInstitutionStore)

    const { groups, loading, error, } = storeToRefs(groupsStore)
    const { loadGroups } = groupsStore

    const { subGroups } = storeToRefs(subGroupsStore)
    const { loadSubGroups } = subGroupsStore

    const { lessonSchedules, scheduleLoading, scheduleError } = storeToRefs(lessonsSchedulesStore)
    const { loadLessonsScheduleByGroupId, loadLessons, createLesson, deleteLesson } = lessonsSchedulesStore

    const { itemsForLessonsSchedule, getTime } = storeToRefs(bellSchedulesStore)

    const { subjects } = storeToRefs(subjectsStore)
    const { loadSubjects, loadSubjectTeachers } = subjectsStore

    return { groups, loading, error, loadGroups, institution,
      subGroups, loadSubGroups,
      lessonSchedules, scheduleLoading, scheduleError, loadLessonsScheduleByGroupId, loadLessons, createLesson, deleteLesson,
      getTime, itemsForLessonsSchedule,
      subjects, loadSubjects, loadSubjectTeachers,
      Translation, getWeekNumber, stringToColor }
  },
  data() {
    return {
      selectedGroup: null,
      currentDate: new Date(),
      currentWeek: [
        { index: 1, name: 'monday', date: new Date() },
        { index: 2, name: 'tuesday', date: new Date() },
        { index: 3, name: 'wednesday', date: new Date() },
        { index: 4, name: 'thursday', date: new Date() },
        { index: 5, name: 'friday', date: new Date() },
        { index: 6, name: 'saturday', date: new Date() },
        { index: 0, name: 'sunday', date: new Date() },
      ],
      firstDateOfWeek: new Date(),
      lastDateOfWeek: new Date(),

      fromDate: null,
      toDate: null,
      selectedSubGroup: '-1',
      selectedSubject: '-1',
      selectedTeacher: '-1',
      selectedLessonIndex: '-1',
      selectedDayOfWeek: '-1',
      selectedLessonFreq: '-1',

      selectedLesson: null,
      lessonTopic: '',
      lessonHomework: ''
    }
  },
  mounted() {
    this.loadGroups(this.institution.id)

    this.currentDate.setHours(0,0,0,0)

    this.resetFirstAndLastDaysOfWeek()

    if (this.isAdminOrOwner) {
      this.loadSubjects(this.institution.id)
    }
  },
  computed: {
    isAdminOrOwner() { return this.institution.role === 0 || this.institution.role === 1 },
    isTeacher() { return this.institution.role === 2 },
    getLastIndex() {
      return (lessons) => {
        if (lessons.length === 0)
          return 0;

        let max = lessons[0].lessonIndex
        for (const lesson of lessons) {
          if (max < lesson.lessonIndex)
            max = lesson.lessonIndex
        }
        return max;
      }
    },
    getMaxLessonCountByIndex() {
      return (lessons, index) => {
        let max = 1;

        for (const dayOfWeek of this.currentWeek) {
          let lessonsByIndex = 0;

          for (const lesson of lessons) {
            const lessonDate = new Date(lesson.date)
            lessonDate.setHours(0,0,0,0,)

            if (lessonDate.getTime() === dayOfWeek.date.getTime() && lesson.lessonIndex === index) {
              lessonsByIndex++;
            }
          }

          if (lessonsByIndex > max)
            max = lessonsByIndex
        }

        return max
      }
    },
    getLessonSubIndex() {
      return (lessons, id) => {
        let rows = this.getLastIndex(lessons)
        let maxSubIndexesFromEachRow = 0

        for (let row = 1; row <= rows; row++) {
          let prevDay = -1
          let prevIndex = -1

          let subIndexes = []

          for (const lesson of lessons.filter(e => e.lessonIndex === row)) {
            const lessonDay = new Date(lesson.date).getDate()

            if (subIndexes.find(e => e.key === lessonDay) === undefined)
              subIndexes.push({ key: lessonDay, value: -1 })

            subIndexes.find(e => e.key === lessonDay).value++

            if (lesson.id === id)
              return subIndexes.find(e => e.key === lessonDay).value + row + maxSubIndexesFromEachRow

            prevIndex = lesson.lessonIndex
            prevDay = lessonDay
          }

          let maxSubIndex = 0
          for (const subIndex of subIndexes) {
            if (maxSubIndex < subIndex.value)
              maxSubIndex = subIndex.value
          }

          maxSubIndexesFromEachRow += maxSubIndex
        }

        return 0
      }
    }
  },
  methods: {
    selectGroup(group) {
      if (this.selectedGroup === null || this.selectedGroup.id !== group.id) {
        this.selectedSubGroup = '-1'

        this.selectedGroup = group
        this.loadLessonsScheduleByGroupId(this.institution.id, group.id, this.firstDateOfWeek, this.lastDateOfWeek)

        if (this.isAdminOrOwner === true) {
          this.loadSubGroups(this.institution.id, this.selectedGroup.id)
        }
      }
    },
    selectLesson(lesson) {
      this.selectedLesson = lesson
      this.lessonHomework = lesson.homeworkDescription
      this.lessonTopic = lesson.theme
      const lessonInfoModal = new bootstrap.Modal(document.getElementById('lessonInfoModal'))
      lessonInfoModal.show()
    },
    addDays(days) {
      this.firstDateOfWeek = new Date(this.firstDateOfWeek.setDate(this.firstDateOfWeek.getDate() + days))
      this.lastDateOfWeek = new Date(this.lastDateOfWeek.setDate(this.lastDateOfWeek.getDate() + days))

      if (this.selectedGroup !== null && this.lessonSchedules[this.selectedGroup.id] !== undefined && this.lessonSchedules[this.selectedGroup.id] !== null) {
        this.loadLessons(this.institution.id, this.selectedGroup.id, this.firstDateOfWeek, this.lastDateOfWeek)
      }

      let date = new Date(this.firstDateOfWeek);
      for (const dayOfWeek of this.currentWeek) {
        dayOfWeek.date = new Date(date)
        date.setDate(date.getDate() + 1)
      }

      this.fromDate = getDateString(new Date(this.firstDateOfWeek))
      this.toDate = getDateString(new Date(this.lastDateOfWeek))
    },
    resetFirstAndLastDaysOfWeek() {
      const currentDate = new Date();
      currentDate.setHours(0,0,0,0)

      this.firstDateOfWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay() + (currentDate.getDay() === 0 ? -6 : 1)));
      this.lastDateOfWeek = new Date(this.firstDateOfWeek)
      this.lastDateOfWeek.setDate(this.lastDateOfWeek.getDate() + 6);

      let date = new Date(this.firstDateOfWeek);
      for (const dayOfWeek of this.currentWeek) {
        dayOfWeek.date = new Date(date)
        date.setDate(date.getDate() + 1)
      }

      if (this.selectedGroup !== null && this.lessonSchedules[this.selectedGroup.id] !== undefined && this.lessonSchedules[this.selectedGroup.id] !== null) {
        this.loadLessons(this.institution.id, this.selectedGroup.id, this.firstDateOfWeek, this.lastDateOfWeek)
      }

      this.fromDate = getDateString(new Date(this.firstDateOfWeek))
      this.toDate = getDateString(new Date(this.lastDateOfWeek))
    }
  },
  watch: {
    groups() {
      if (this.groups !== null && this.groups.length > 0)
        this.selectGroup(this.groups[0])
    },
    selectedSubject() {
      if (this.selectedSubject !== '-1') {
        this.loadSubjectTeachers(this.institution.id, parseInt(this.selectedSubject))
      }
    }
  }
}
</script>

<template>
  <div v-if="isAdminOrOwner === true && selectedGroup !== null && lessonSchedules[selectedGroup.id] !== undefined && lessonSchedules[selectedGroup.id] !== null && lessonSchedules[selectedGroup.id].items !== undefined && lessonSchedules[selectedGroup.id].items !== null" class="add-button-container">
    <div class="simplified-button" data-bs-toggle="modal" data-bs-target="#addLessonScheduleItemModal">
      <AddIcon class="ico ico-large" />
    </div>
  </div>

  <div v-if="isAdminOrOwner" class="modal modal-alert" tabindex="-1" role="dialog" id="addLessonScheduleItemModal" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content rounded-3 shadow">
        <div class="modal-body p-4 text-center">
          <h5 class="mb-0">{{ $t('lessons-schedule.view.create-lessons-modal.title') }}</h5>

          <div class="from-to-dates">
            <div>
              <span class="form-input-title">{{ $t('form-fields.from-date') }}</span>
              <input v-model="fromDate" :max="toDate" type="date" class="form-input" />
            </div>
            <div>
              <span class="form-input-title">{{ $t('form-fields.to-date') }}</span>
              <input v-model="toDate" :min="fromDate" type="date" class="form-input" />
            </div>
          </div>

          <div>
            <select v-model="selectedSubGroup" class="form-input">
              <option disabled selected value="-1">{{ $t('form-fields.sub-groups') }}</option>
              <option v-if="this.subGroups === null" disabled>{{ $t('loading') }}</option>
              <option v-else v-for="subGroup in subGroups" :value="subGroup.id">{{ subGroup.name }}</option>
            </select>

            <span class="muted-text">{{ $t('form-fields.not-required') }}</span>
          </div>

          <div>
            <select v-model="selectedSubject" class="form-input">
              <option disabled selected value="-1">{{ $t('form-fields.subject') }}</option>
              <option v-if="this.subjects === null" disabled>{{ $t('loading') }}</option>
              <option v-else v-for="subject in subjects" :value="subject.id">{{ subject.name }}</option>
            </select>
          </div>

          <div>
            <select v-model="selectedTeacher" :disabled="selectedSubject === '-1'" class="form-input" :class="{ 'disabled': selectedSubject === '-1' }">
              <option disabled selected value="-1">{{ $t('form-fields.teacher') }}</option>
              <option v-if="this.subjects === null
              || selectedSubject === '-1'
              || subjects.find(o => o.id === parseInt(selectedSubject)) === null
              || subjects.find(o => o.id === parseInt(selectedSubject)).teachers === undefined
              || subjects.find(o => o.id === parseInt(selectedSubject)).teachers === null" disabled>
                {{ $t('loading') }}
              </option>
              <option v-else-if="subjects.find(o => o.id === parseInt(selectedSubject)).teachers.length === 0" disabled value="-1">{{ $t('lessons-schedule.view.no-data') }}</option>
              <option v-else
                      v-for="teacher in subjects.find(o => o.id === parseInt(selectedSubject)).teachers" :value="teacher.id">
                $id: {{ teacher.id }}
              </option>
            </select>
          </div>

          <div>
            <select v-model="selectedLessonIndex" class="form-input">
              <option disabled selected value="-1">{{ $t('form-fields.lesson-number') }}</option>
              <option v-for="lessonNumber in 99" :value="lessonNumber">{{ lessonNumber }}</option>
            </select>
          </div>

          <div>
            <select v-model="selectedDayOfWeek" class="form-input">
              <option disabled selected value="-1">{{ $t('form-fields.day-of-week') }}</option>
              <option v-for="dayOfWeek in this.currentWeek" :value="dayOfWeek.index">
                {{ $t(`days.full.${dayOfWeek.name}`) }}
              </option>
            </select>
          </div>

          <div>
            <select v-model="selectedLessonFreq" class="form-input">
              <option disabled selected value="-1">{{ $t('form-fields.lesson-frequency.title') }}</option>
              <option value="0">{{ $t('form-fields.lesson-frequency.every-week') }}</option>
              <option value="1">{{ $t('form-fields.lesson-frequency.every-odd-week') }}</option>
              <option value="2">{{ $t('form-fields.lesson-frequency.every-even-week') }}</option>
            </select>
            <span v-if="getWeekNumber(new Date(this.firstDateOfWeek)) % 2 === 0" class="muted-text">{{ $t('note.week-is-even') }}</span>
            <span v-else class="muted-text">{{ $t('note.week-is-odd') }}</span>
          </div>
        </div>
        <div class="modal-footer flex-nowrap p-0">
          <button type="button" class="btn btn-lg btn-link fs-6 text-decoration-none col-6 m-0 rounded-0" data-bs-dismiss="modal"><strong>{{ $t('buttons.cancel') }}</strong></button>
          <button :disabled="selectedSubject === '-1'
                  || selectedDayOfWeek === '-1'
                  || selectedLessonFreq === '-1'
                  || selectedLessonIndex === '-1'
                  || selectedSubject === '-1'
                  || selectedTeacher === '-1'
                  || fromDate === ''
                  || toDate === ''"
                  @click="createLesson(this.institution.id, this.selectedGroup.id, selectedLessonFreq, selectedTeacher, selectedSubGroup, selectedLessonIndex, selectedSubject, selectedDayOfWeek, fromDate, toDate)"
                  type="button" class="btn btn-lg btn-link fs-6 text-decoration-none col-6 m-0 rounded-0" style="font-weight: 500;"  data-bs-dismiss="modal">{{ $t('buttons.create') }}</button>
        </div>
      </div>
    </div>
  </div>

  <div v-if="this.error !== null" class="error-alert" style="margin-bottom: 1rem">{{ this.error }}</div>
  <div v-else-if="this.scheduleError !== null" class="error-alert" style="margin-bottom: 1rem">{{ this.scheduleError }}</div>
  <div v-else-if="selectedGroup !== null && lessonSchedules[selectedGroup.id] !== undefined && lessonSchedules[selectedGroup.id] !== null && lessonSchedules[selectedGroup.id].error !== null">{{ lessonSchedules[selectedGroup.id].error }}</div>
  <ul v-else-if="selectedGroup !== null && lessonSchedules[selectedGroup.id] !== undefined && lessonSchedules[selectedGroup.id] !== null && lessonSchedules[selectedGroup.id].validationError !== undefined && lessonSchedules[selectedGroup.id].validationError !== null" class="error-alert validation-alert">
    <li v-for="problem in lessonSchedules[selectedGroup.id].validationError">
      {{ problem.key }}:
      <ul>
        <li v-for="error in problem.errors">{{ error }}</li>
      </ul>
    </li>
  </ul>
  <div class="schedule-container">
    <div class="schedule-nav-container">
      <div class="schedule-nav">
        <div class="control-buttons">
          <div class="simplified-button">
            <div class="ico ico-small">
              <ArrowIcon @click="addDays(-7)" style="transform: rotateY(180deg)" />
            </div>
          </div>
          <div class="simplified-button">
            <div class="ico ico-small">
              <ArrowIcon @click="addDays(7)" />
            </div>
          </div>
        </div>

        <span class="date-control">
          <span>
            <span v-if="firstDateOfWeek.getMonth() !== lastDateOfWeek.getMonth()">
              {{ firstDateOfWeek.getDate() }}, {{ $t(`months.full.${firstDateOfWeek.getMonth()}`) }}
              <span v-if="firstDateOfWeek.getFullYear() !== lastDateOfWeek.getFullYear()"> {{ firstDateOfWeek.getFullYear() }}</span>
            </span>
            <span v-else>{{ firstDateOfWeek.getDate() }}</span>
          </span>
          <span style="margin-left: 0.1rem; margin-right: 0.1rem"> — </span>
          <span>{{ lastDateOfWeek.getDate() }}, {{ $t(`months.full.${lastDateOfWeek.getMonth()}`) }} {{ lastDateOfWeek.getFullYear() }}</span>
        </span>

        <div v-if="this.firstDateOfWeek.getTime() > this.currentDate.getTime() || this.lastDateOfWeek.getTime() < this.currentDate.getTime()" @click="resetFirstAndLastDaysOfWeek" class="link reset-button">
          {{ $t('reset') }}
        </div>
      </div>

      <div class="end-controls">
        <div class="dropdown groups-dropdown">
          <div class="d-block text-decoration-none dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
            <span v-if="selectedGroup !== null">{{ selectedGroup.name }}</span>
            <div v-else-if="this.loading === true" class="spinner"></div>
          </div>
          <ul class="dropdown-menu text-small">
            <li v-if="this.loading === true">
              <div class="spinner"></div>
            </li>
            <li v-else-if="this.groups !== null">
              <span v-for="group in this.groups" @click="selectGroup(group)" class="dropdown-item">{{ group.name }}</span>
            </li>
          </ul>
        </div>

        <RouterLink :to="Translation.i18nRoute({ name: 'institution teacher lessons', params: { id: institution.id } })" v-if="isTeacher" class="button teachers-schedule-button">{{ $t('lessons-schedule.show-teachers-schedule') }}</RouterLink>
      </div>
    </div>

    <div v-if="selectedGroup !== null" class="schedule">
      <div v-if="scheduleLoading === true || (lessonSchedules[selectedGroup.id] !== undefined && lessonSchedules[selectedGroup.id] !== null && lessonSchedules[selectedGroup.id].loading === true)" class="centered-container">
        <div class="spinner"></div>
      </div>
      <div v-else-if="lessonSchedules[selectedGroup.id] === null || lessonSchedules[selectedGroup.id] === undefined" class="centered-container">
        <RouterLink :to="Translation.i18nRoute({ name: 'create institution lesson schedule', params: { id: institution.id, groupId: selectedGroup.id } } )" v-if="isAdminOrOwner === true" class="simplified-button">
          <AddIcon class="ico" />
        </RouterLink>
        <div v-else class="text-card">{{ $t('lessons-schedule.view.no-data') }}</div>
      </div>
      <div v-else class="schedule-columns-container">
        <div v-if="lessonSchedules[selectedGroup.id] !== null && lessonSchedules[selectedGroup.id].items !== undefined && lessonSchedules[selectedGroup.id].items !== null" class="time-column">
          <div v-for="index in getLastIndex(lessonSchedules[selectedGroup.id].items)" class="time" :style="`margin-bottom: calc((${getMaxLessonCountByIndex(lessonSchedules[selectedGroup.id].items, index)} - 1) * var(--lesson-height)`">{{ index }}</div>
        </div>
        <div class="calendar-days">
          <div v-for="dayOfWeek in this.currentWeek" class="day-column" :class="{ 'selected': dayOfWeek.date.getTime() === currentDate.getTime() }">
            <div class="day">
              <span class="day-number">{{ dayOfWeek.date.getDate() }}</span>
              <span class="day-name">{{ $t(`days.full.${dayOfWeek.name}`) }}</span>
            </div>

            <div v-if="lessonSchedules[selectedGroup.id].items !== undefined && lessonSchedules[selectedGroup.id].items !== null" style="position: relative">
              <div v-for="lesson in lessonSchedules[selectedGroup.id].items.filter(e => new Date(e.date).getDate() === dayOfWeek.date.getDate())" class="lesson-container" :style="`top: calc((${getLessonSubIndex(lessonSchedules[selectedGroup.id].items, lesson.id)} - 1) * var(--lesson-height));`">
                <div @click="selectLesson(lesson)" class="lesson" :style="`--lesson-color: ${this.stringToColor(lesson.subject.name, 70, 50)}; --lesson-color-alpha: ${this.stringToColor(lesson.subject.name, 70, 50, 0.2)};`">
                  <div class="lesson-meta-info">
                    <span class="lesson-index">{{ lesson.lessonIndex }}</span>
                    <span v-if="itemsForLessonsSchedule !== null" class="lesson-time">{{ getTime(dayOfWeek.index, lesson.lessonIndex) }}</span>
                  </div>

                  <div class="lesson-info">
                    <span class="lesson-name">{{ lesson.subject.name }}</span>
                    <span class="lesson-teacher">{{ $t('form-fields.teacher') }}: $id {{ lesson.teacherId }}</span>
                    <span v-if="lesson.subGroup !== null" class="lesson-sub-group">{{ lesson.subGroup.name }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-if="selectedGroup !== null" class="modal modal-alert" tabindex="-1" role="dialog" id="lessonInfoModal">
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content rounded-4 shadow">
        <div class="modal-body p-5">
          <h2 class="fw-bold mb-0">{{ $t('lesson.information') }}</h2>

          <ul class="d-grid gap-4 my-5 list-unstyled">
            <li class="d-flex gap-4">
              <div>
                <h5 class="mb-0">{{ $t('lesson.topic') }}</h5>
                <span v-if="lessonTopic !== null && lessonTopic !== ''">{{ lessonTopic }}</span>
                <span v-else class="muted-text">{{ $t('lessons-schedule.view.no-data') }}</span>
              </div>
            </li>
            <li class="d-flex gap-4">
              <div>
                <h5 class="mb-0">{{ $t('lesson.homework-description') }}</h5>
                <span v-if="lessonHomework !== null && lessonHomework !== ''">{{ lessonHomework }}</span>
                <span v-else class="muted-text">{{ $t('lessons-schedule.view.no-data') }}</span>
              </div>
            </li>
          </ul>

          <button v-if="isAdminOrOwner" @click="deleteLesson(institution.id, selectedGroup.id, selectedLesson.id)" type="button" class="button button-large mt-5 w-100" style="font-weight: 500; border-color: var(--danger-color); background-color: var(--danger-color)" data-bs-dismiss="modal">{{ $t('buttons.delete') }}</button>
          <button v-else type="button" class="button button-large mt-5 w-100" data-bs-dismiss="modal">{{ $t('buttons.thanks') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.add-button-container {
  position: absolute;
  right: 0;
  bottom: 0;
  padding: 2rem 2.5rem;
}

.end-controls {
  display: flex;
  flex-direction: row;
}

.teachers-schedule-button {
  margin-left: 0.5rem;
}

.reset-button {
  cursor: pointer;
  margin-left: 0.5rem;
}

.disabled {
  color: var(--muted-color);
}

.modal-body div {
  margin-top: 0.5rem;
}

.from-to-dates {
  display: flex;
  flex-direction: row;
}

.from-to-dates div {
  display: grid;
}

.from-to-dates div:first-child {
  margin-right: 1rem;
}


.centered-container {
  padding: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
}


.schedule-container {
  min-height: 100%;
  height: 100%;
  display: block;
}

.schedule-nav-container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.schedule-nav {
  display: flex;
  flex-direction: row;
  align-content: center;
  align-items: center;
}

.control-buttons {
  display: flex;
  flex-direction: row;
  padding: 0 0.5rem;
}

.groups-dropdown {
  min-width: 7.5rem;
  display: flex;
  justify-content: center;
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
}

.groups-dropdown .dropdown-toggle {
  padding: 0.5rem 1rem;
}

.date-control {
  font-weight: bolder;
  font-size: 15pt;
}

.schedule {
  padding-top: 1rem;
  padding-bottom: 1rem;
  height: 100%;
}

.calendar-days {
  width: 100%;
  min-height: 100%;
  height: var(--days-row-height);
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  border-radius: 0.5rem;
}

.day-column {
  position: relative;
  min-width: 8rem;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.day-column:first-child .day {
  border-top-left-radius: 0.5rem;
  border-bottom-left-radius: 0.5rem;
}

.day-column:last-child .day {
  border-top-right-radius: 0.5rem;
  border-bottom-right-radius: 0.5rem;
}

.day {
  background-color: rgba(0,0,0,0.05);
  padding: 1rem 0.5rem;
  display: flex;
  flex-direction: column;
  align-content: center;
  text-align: center;
  justify-content: center;
}

.day-column.selected .day {
  background-color: rgba(0,0,0,0.15);
}

.day-name {
  font-size: 11pt;
  font-weight: normal;
  color: var(--muted-color)
}

.day-number {
  font-size: 20pt;
  font-weight: bold;
}

.schedule-columns-container {
  display: flex;
  flex-direction: row;
  min-height: 100%;
  max-width: 100%;
  overflow-y: auto;
  padding-bottom: 5rem;
}

.time-column {
  margin-top: var(--days-row-height);
  min-width: 6rem;
}

.time {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-content: center;
  height: var(--lesson-height);
  font-size: 20pt;
  font-weight: bolder;
}

.lesson-container {
  position: absolute;
  height: var(--lesson-height);
  width: 100%;
  padding: 0.25rem;
}

/*noinspection CssUnresolvedCustomProperty*/
.lesson {
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 0.5rem;
  width: 100%;
  height: 100%;
  border: 1px solid var(--lesson-color);
  border-left: 5px solid var(--lesson-color);
  background-color: var(--lesson-color-alpha);
  border-radius: 0.25rem 0.5rem 0.5rem 0.25rem;
}

.lesson-meta-info {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
}

.lesson-meta-info .lesson-time {
  color: var(--muted-color);
  font-size: 9pt;
}

/*noinspection CssUnresolvedCustomProperty*/
.lesson-meta-info .lesson-index {
  background-color: var(--lesson-color-alpha);
  color: var(--text-color);
  border-radius: 50%;
  width: 1.75rem;
  height: 1.75rem;
  display: flex;
  flex-wrap: wrap;
  align-content: center;
  justify-content: center;
}

.lesson-info {
  display: flex;
  flex-direction: column;
}

.lesson-info .lesson-name {
  font-weight: lighter;
  font-size: 14pt;
}

.lesson-info .lesson-teacher {
  color: var(--muted-color);
}

.lesson-info .lesson-sub-group {
  color: var(--muted-color);
  font-size: 10pt;
}

@media (max-width: 641px) {
  .schedule-nav-container {
    flex-direction: column;
  }

  .schedule-nav {
    justify-content: space-between;
    margin-bottom: 1rem;
  }

  .control-buttons {
    padding: 0;
  }

  .end-controls {
    flex-direction: column;
  }

  .teachers-schedule-button {
    margin-top: 1rem;
    margin-left: 0;
  }
}
</style>
