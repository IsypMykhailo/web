<script>
import {useCurrentInstitutionStore} from "../../../stores/current-institution";
import {storeToRefs} from "pinia/dist/pinia";
import Translation from "../../../i18n/translation";
import ArrowIcon from "../../../components/icons/ArrowIcon.vue";
import AddIcon from "../../../components/icons/AddIcon.vue";
import {useBellSchedulesStore} from "../../../stores/bell-schedules";
import {useSubjectsStore} from "../../../stores/subjects";
import {getDateString, getWeekNumber} from "../../../utils/date-helper";
import {stringToColor} from "../../../utils/color-helper";
import {useTeacherLessonsStore} from "../../../stores/teacher-lessons";
import {useJournalsStore} from "../../../stores/journals";

export default {
  components: {AddIcon, ArrowIcon},
  setup() {
    const currentInstitutionStore = useCurrentInstitutionStore()
    const bellSchedulesStore = useBellSchedulesStore()
    const subjectsStore = useSubjectsStore()
    const teacherLessonsStore = useTeacherLessonsStore()
    const journalsStore = useJournalsStore()

    const { institution } = storeToRefs(currentInstitutionStore)

    const { lessons, lessonsLoading, lessonsError, updatingValidationFailure } = storeToRefs(teacherLessonsStore)
    const { loadLessons, updateLessonInfo } = teacherLessonsStore

    const { journalsByGroupAndSubject, journalsByGroupAndSubjectLoading, journalsByGroupAndSubjectError } = storeToRefs(journalsStore)
    const { loadJournalsByGroupAndSubject } = journalsStore

    const { itemsForLessonsSchedule, getTime } = storeToRefs(bellSchedulesStore)

    const { subjects } = storeToRefs(subjectsStore)
    const { loadSubjects, loadSubjectTeachers } = subjectsStore

    return { institution,
      lessons, lessonsLoading, lessonsError, updatingValidationFailure, loadLessons, updateLessonInfo,
      getTime, itemsForLessonsSchedule,
      subjects, loadSubjects, loadSubjectTeachers,
      journalsByGroupAndSubject, journalsByGroupAndSubjectLoading, journalsByGroupAndSubjectError, loadJournalsByGroupAndSubject,
      Translation, getWeekNumber, stringToColor }
  },
  data() {
    return {
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

      selectedLesson: null,
      lessonTopic: '',
      lessonHomework: '',

      selectedJournalId: -1
    }
  },
  mounted() {
    if (this.institution.role !== 2) {
      this.$router.push({ name: 'dashboard', params: { locale: Translation.currentLocale } })
    }

    this.currentDate.setHours(0,0,0,0)

    this.resetFirstAndLastDaysOfWeek()
  },
  computed: {
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
    selectLesson(lesson) {
      this.selectedLesson = lesson
      this.lessonHomework = lesson.homeworkDescription
      this.lessonTopic = lesson.theme
      const lessonInfoModal = new bootstrap.Modal(document.getElementById('lessonInfoModal'))
      lessonInfoModal.show()
    },
    openAttachLessonModal() {
      this.loadJournalsByGroupAndSubject(this.institution.id, this.selectedLesson.group.id, this.selectedLesson.subject.id)

      const attachLessonModal = new bootstrap.Modal(document.getElementById('attachLessonModal'))
      attachLessonModal.show()
    },
    addDays(days) {
      this.firstDateOfWeek = new Date(this.firstDateOfWeek.setDate(this.firstDateOfWeek.getDate() + days))
      this.lastDateOfWeek = new Date(this.lastDateOfWeek.setDate(this.lastDateOfWeek.getDate() + days))

      this.loadLessons(this.institution.id, this.firstDateOfWeek, this.lastDateOfWeek)

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

      this.loadLessons(this.institution.id, this.firstDateOfWeek, this.lastDateOfWeek)

      this.fromDate = getDateString(new Date(this.firstDateOfWeek))
      this.toDate = getDateString(new Date(this.lastDateOfWeek))
    },
    attachLesson() {
      const modal = new bootstrap.Modal(document.getElementById('attachLessonModal'))
      modal.hide()

      this.$router.push(this.Translation.i18nRoute({
        name: 'create institution journal column',
        params: { id: this.institution.id, journalId: this.selectedJournalId },
        query: { lessonId: this.selectedLesson.id } }))
    },
    openAttendance() {
      this.$router.push(this.Translation.i18nRoute({
        name: 'institution lesson attendance',
        params: { id: this.institution.id, lessonId: this.selectedLesson.id } }))
    }
  }
}
</script>

<template>
  <div v-if="this.lessonsError !== null" class="error-alert" style="margin-bottom: 1rem">{{ this.lessonsError }}</div>
  <div v-else-if="this.journalsByGroupAndSubjectError !== null" class="error-alert" style="margin-bottom: 1rem">{{ this.journalsByGroupAndSubjectError }}</div>
  <ul v-else-if="this.updatingValidationFailure" class="error-alert validation-alert">
    <li v-for="problem in updatingValidationFailure">
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
        <RouterLink :to="Translation.i18nRoute({ name: 'institution lesson schedules', params: { id: institution.id } })" class="button teachers-schedule-button">{{ $t('lessons-schedule.show-default-schedule') }}</RouterLink>
      </div>
    </div>

    <div class="schedule">
      <div v-if="lessonsLoading === true" class="centered-container">
        <div class="spinner"></div>
      </div>
      <div v-else-if="lessons === null" class="centered-container">
        <div class="text-card">{{ $t('lessons-schedule.view.no-data') }}</div>
      </div>
      <div v-else class="schedule-columns-container">
        <div class="time-column">
          <div v-for="index in getLastIndex(lessons)" class="time" :style="`margin-bottom: calc((${getMaxLessonCountByIndex(lessons, index)} - 1) * var(--lesson-height)`">{{ index }}</div>
        </div>
        <div class="calendar-days">
          <div v-for="dayOfWeek in this.currentWeek" class="day-column" :class="{ 'selected': dayOfWeek.date.getTime() === currentDate.getTime() }">
            <div class="day">
              <span class="day-number">{{ dayOfWeek.date.getDate() }}</span>
              <span class="day-name">{{ $t(`days.full.${dayOfWeek.name}`) }}</span>
            </div>

            <div style="position: relative">
              <div v-for="lesson in lessons.filter(e => new Date(e.date).getDate() === dayOfWeek.date.getDate())" class="lesson-container" :style="`top: calc((${getLessonSubIndex(lessons, lesson.id)} - 1) * var(--lesson-height));`">
                <div @click="selectLesson(lesson)" class="lesson">
                  <div class="lesson-meta-info">
                    <span class="lesson-index">{{ lesson.lessonIndex }}</span>
                    <span v-if="itemsForLessonsSchedule !== null" class="lesson-time">{{ getTime(dayOfWeek.index, lesson.lessonIndex) }}</span>
                  </div>

                  <div class="lesson-info">
                    <span class="lesson-name">{{ lesson.subject.name }}</span>
                    <span class="lesson-group">{{ lesson.group.name }}</span>
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

  <div class="modal modal-alert" tabindex="-1" role="dialog" id="lessonInfoModal">
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content rounded-4 shadow">
        <div class="modal-body p-5">
          <h2 class="fw-bold mb-0">{{ $t('lesson.manage-lesson') }}</h2>

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

          <button data-bs-toggle="modal" data-bs-target="#editLessonInfoModal" type="button" class="button mt-5 w-100">{{ $t('buttons.edit') }}</button>
          <button @click="openAttachLessonModal" type="button" class="button mt-2 w-100" data-bs-dismiss="modal">{{ $t('buttons.attach-lesson') }}</button>
          <button @click="openAttendance" type="button" class="button mt-2 w-100" data-bs-dismiss="modal">{{ $t('buttons.check-attendance') }}</button>
          <button type="button" class="button mt-2 w-100" data-bs-dismiss="modal">{{ $t('buttons.close') }}</button>
        </div>
      </div>
    </div>
  </div>

  <div class="modal modal-alert" tabindex="-1" role="dialog" id="editLessonInfoModal" aria-hidden="true">
    <div v-if="selectedLesson !== null" class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content rounded-3 shadow">
        <div class="modal-body p-4 text-center">
          <h5 class="mb-0">{{ $t('lesson.manage-lesson') }}</h5>
          <p style="font-size: 11pt" class="mb-0">{{ $t('lesson.information-hint') }}</p>

          <input v-model="lessonTopic" type="text" class="form-input" :placeholder="$t('lesson.topic')" />
          <input v-model="lessonHomework" type="text" class="form-input" :placeholder="$t('lesson.homework-description')" />
        </div>
        <div class="modal-footer flex-nowrap p-0">
          <button type="button" class="btn btn-lg btn-link fs-6 text-decoration-none col-6 m-0 rounded-0" data-bs-dismiss="modal"><strong>{{ $t('buttons.cancel') }}</strong></button>
          <button type="button" class="btn btn-lg btn-link fs-6 text-decoration-none col-6 m-0 rounded-0" style="font-weight: 500;" @click="updateLessonInfo(institution.id, selectedLesson.group.id, selectedLesson.id, lessonTopic, lessonHomework)" data-bs-dismiss="modal">{{ $t('buttons.edit') }}</button>
        </div>
      </div>
    </div>
  </div>

  <div v-if="selectedLesson !== null" class="modal modal-alert" tabindex="-1" role="dialog" id="attachLessonModal" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content rounded-3 shadow">
        <div class="modal-body p-4 text-center">
          <h5 class="mb-0">{{ $t('lesson.manage-lesson') }}</h5>
          <p style="font-size: 11pt" class="mb-0">{{ $t('lesson.attach-lesson-hint') }}</p>

          <select v-model="selectedJournalId" class="form-input">
            <option disabled selected>{{ $t('form-fields.journal') }}</option>
            <option v-if="journalsByGroupAndSubjectLoading === true" selected>{{ $t('form-fields.journal') }}</option>
            <option v-else-if="journalsByGroupAndSubject !== null" v-for="journal in journalsByGroupAndSubject" :value="journal.id">{{ journal.name }}</option>
          </select>
        </div>
        <div class="modal-footer flex-nowrap p-0">
          <button type="button" class="btn btn-lg btn-link fs-6 text-decoration-none col-6 m-0 rounded-0" data-bs-dismiss="modal"><strong>{{ $t('buttons.cancel') }}</strong></button>
          <button :disabled="selectedJournalId === -1" @click="attachLesson" type="button" class="btn btn-lg btn-link fs-6 text-decoration-none col-6 m-0 rounded-0" style="font-weight: 500;" data-bs-dismiss="modal">{{ $t('buttons.attach-lesson') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
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

.modal-body .form-input {
  margin-top: 0.5rem;
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

.lesson {
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 0.5rem;
  width: 100%;
  height: 100%;
  border: 1px solid rgba(13, 110, 253, 0.5);
  border-left: 5px solid var(--button-background-color);
  background-color: rgba(13, 110, 253, 0.1);
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

.lesson-meta-info .lesson-index {
  background-color: var(--button-background-color);
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

.lesson-info .lesson-group {
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
