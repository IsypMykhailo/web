<script>
import InstitutionLayout from "../../layouts/InstitutionLayout.vue";
import {useCurrentInstitutionStore} from "@/stores/current-institution";
import {storeToRefs} from "pinia/dist/pinia";
import UsersIcon from "../../components/icons/UsersIcon.vue";
import {useStatisticsStore} from "@/stores/statistics";
import {useGradesStore} from "@/stores/grades";
import Translation from "../../i18n/translation";
import SeeMoreIcon from "../../components/icons/SeeMoreIcon.vue";
import LineChart from "@/components/charts/AttendanceLineChart.vue";
export default {
  components: {LineChart, SeeMoreIcon, UsersIcon, InstitutionLayout },
  setup() {
    const currentInstitutionStore = useCurrentInstitutionStore()
    const statsStore = useStatisticsStore()
    const gradesStore = useGradesStore()

    const { institution } = storeToRefs(currentInstitutionStore)

    const { adminsCount, teachersCount, studentsCount, personnelCountLoading, personnelCountError,
        totalCount, doneCount, pendingCount, missingCount, homeworksCountLoading, homeworksCountError,
        attendanceStatistics, attendanceStatisticsLoading, attendanceStatisticsError,
        lessonsCount, lessonsCountLoading, lessonsCountError } = storeToRefs(statsStore)
    const { loadPersonnelStatistics, loadHomeworksStatistics, loadAttendanceStatistics, loadLessonsCount } = statsStore

    const { lastStudentGrades, lastStudentGradesLoading, lastStudentGradesError } = storeToRefs(gradesStore)
    const { loadLastStudentGrades } = gradesStore

    return { institution, Translation,
        adminsCount, teachersCount, studentsCount, personnelCountLoading, personnelCountError, loadPersonnelStatistics,
        totalCount, doneCount, pendingCount, missingCount, homeworksCountLoading, homeworksCountError, loadHomeworksStatistics,
        lastStudentGrades, lastStudentGradesLoading, lastStudentGradesError, loadLastStudentGrades,
        attendanceStatistics, attendanceStatisticsLoading, attendanceStatisticsError, loadAttendanceStatistics,
        lessonsCount, lessonsCountLoading, lessonsCountError, loadLessonsCount
    }
  },
  data() {
    return {
        currentDate: new Date()
    }
  },
  computed: {
    isStudent() { return this.institution.role === 3 },
    isTeacher() { return this.institution.role === 2},
    isOwnerOrAdmin() { return this.institution.role === 0 || this.institution.role === 1 },
  },
  created() {
    setInterval(() => { this.currentDate = new Date()} , 500)
  },
  mounted() {
    if (this.isOwnerOrAdmin === true) {
      this.loadPersonnelStatistics(this.institution.id)
    }
    if (this.isStudent === true || this.isTeacher === true) {
      this.loadLessonsCount(this.institution.id)
    }
    if (this.isStudent === true) {
      this.loadLastStudentGrades(this.institution.id)
      this.loadHomeworksStatistics(this.institution.id)
    }

    this.loadAttendanceStatistics(this.institution.id)
  }
}
</script>

<template>
  <h1 class="welcome-title">{{ $t('welcomeToInstitution', {name: institution.name}) }}</h1>
  <span class="muted-text"></span>

  <div class="blocks">
    <div class="blocks-row">
      <div class="block stat-block profile-block">
        <div class="profile-info">
          <div class="pfp" :style="`background-image: url('https://github.com/tyulyukov.png')`">
            <div class="status-indicator"></div>
          </div>
          <div class="user-info">
            <span class="username">tyulyukov</span>
            <span v-if="institution.role === 0" class="role">{{ $t('user-roles.owner') }}</span>
            <span v-else-if="institution.role === 1" class="role">{{ $t('user-roles.admin') }}</span>
            <span v-else-if="institution.role === 2" class="role">{{ $t('user-roles.teacher') }}</span>
            <span v-else-if="institution.role === 3" class="role">{{ $t('user-roles.student') }}</span>
          </div>
        </div>
      </div>

      <div v-if="isOwnerOrAdmin && adminsCount !== null" class="stat-block count-block">
        <div class="count-ico">
          <UsersIcon class="ico ico-large"/>
        </div>
        <div class="count-container">
          <span class="count-title">{{ $t('settings.admins')}}</span>
          <span class="count">{{ adminsCount }}</span>
        </div>
      </div>

      <div v-if="isOwnerOrAdmin && teachersCount !== null" class="stat-block count-block">
        <div class="count-ico ">
          <UsersIcon class="ico ico-large"/>
        </div>
        <div class="count-container">
          <span class="count-title">{{ $t('form-fields.teachers') }}</span>
          <span class="count">{{ teachersCount }}</span>
        </div>
      </div>

      <div v-if="isOwnerOrAdmin && studentsCount !== null" class="stat-block count-block">
        <div class="count-ico">
          <UsersIcon class="ico ico-large"/>
        </div>
        <div class="count-container">
          <span class="count-title">{{ $t('form-fields.students') }}</span>
          <span class="count">{{ studentsCount }}</span>
        </div>
      </div>

      <div v-if="isStudent || isTeacher" class="stat-block date-block">
        <div class="today-date-container">
          <h4 class="today-date-time">{{ currentDate.toLocaleString(this.$t('language'), { hour: 'numeric', minute: 'numeric'}) }}</h4>
          <span class="today-date">{{ currentDate.toLocaleString(this.$t('language'), { year: 'numeric', month: 'long', day: 'numeric'}) }}</span>
        </div>

        <div class="today-lessons">
          <div v-if="lessonsCountLoading === true" class="spinner"></div>
          <span v-else-if="lessonsCount !== null && lessonsCount === 0" class="">{{ $t('lessons.no-lessons') }}</span>
            <span v-else-if="lessonsCount !== null" class="">{{ $t('lessons.today-you-have') }}: <span style="font-weight: 600">{{ lessonsCount }}</span></span>
          <span v-else class="muted-text">{{ $t('lessons-schedule.view.no-data') }}</span>
        </div>
      </div>
    </div>

    <div class="blocks-row">
      <div v-if="isStudent" class="large-block">
        <div class="block-nav">
          <span class="block-title">{{ $t('grades.last-grades') }}</span>

          <RouterLink :to="Translation.i18nRoute({ name: 'institution grades', params: { id: institution.id } })" class="simplified-button">
            <SeeMoreIcon class="ico"/>
          </RouterLink>
        </div>

        <div v-if="lastStudentGradesLoading === true" class="spinner"></div>
        <table v-else-if="lastStudentGrades !== null" class="grades-table">
          <tr>
            <th>{{ $t('form-fields.subject') }}</th>
            <th>{{ $t('form-fields.grade') }}</th>
          </tr>
          <tr v-for="gradeKvp in lastStudentGrades">
            <td>{{ gradeKvp.key.name }}</td>
            <td class="grade" :class="`grade-${gradeKvp.value.points}`">{{ gradeKvp.value.points }}</td>
          </tr>
        </table>
      </div>

      <div v-if="isStudent" class="large-block">
        <div class="block-nav">
          <span class="block-title">{{ $t('nav.institution-homeworks') }}</span>

          <RouterLink :to="Translation.i18nRoute({ name: 'institution homeworks', params: { id: institution.id } })" class="simplified-button">
            <SeeMoreIcon class="ico"/>
          </RouterLink>
        </div>

        <div v-if="homeworksCountLoading === true" class="homeworks-count-container">
          <div class="spinner"></div>
        </div>

        <div v-else class="homeworks-count-container">
          <div class="homework-count-row">
            <div v-if="totalCount !== null" class="homework-count">
              <span class="homework-count-title">{{ $t('homework-status.total') }}</span>
              <span class="homework-count-number total">{{ totalCount }}</span>
            </div>

            <div v-if="doneCount !== null" class="homework-count">
              <span class="homework-count-title">{{ $t('homework-status.done') }}</span>
              <span class="homework-count-number done">{{ doneCount }}</span>
            </div>
          </div>

          <div class="homework-count-row">
            <div v-if="pendingCount !== null" class="homework-count">
              <span class="homework-count-title">{{ $t('homework-status.pending') }}</span>
              <span class="homework-count-number pending">{{ pendingCount }}</span>
            </div>

            <div v-if="missingCount !== null" class="homework-count">
              <span class="homework-count-title">{{ $t('homework-status.missing') }}</span>
              <span class="homework-count-number missing">{{ missingCount }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="large-block chart-block">
        <div class="block-nav">
          <span class="block-title">{{ $t('form-fields.attendance') }}</span>
        </div>

        <div v-if="attendanceStatisticsLoading === true" class="spinner"></div>
        <div v-else-if="attendanceStatistics !== null" class="attendance-chart" >
            <LineChart :chart-props="attendanceStatistics"/>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.welcome-title {
  font-size: 35pt;
  font-weight: bold;
}

.blocks {
  display: flex;
  flex-direction: column;
}

.blocks-row {
  display: flex;
  flex-direction: row;
}

.blocks-row > div {
  margin-right: 1rem;
  margin-bottom: 1rem;
  background-color: var(--background-color);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
  border-radius: 1rem;
  width: 100%;
  padding: 1rem;
}

.blocks-row > div:last-child {
  margin-right: 0;
}

.stat-block {
  min-height: 80px;
}

.count-block, .date-block {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.large-block {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.block-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 2.5rem;
  margin-bottom: 1rem;
  padding-bottom: 0.25rem;
  border-bottom: 1px solid var(--border-color);
}

.block-title {
  font-weight: bold;
  font-size: 15pt;
}

.count-container {
  display: flex;
  flex-direction: column;
}

.count-title {
  font-weight: bold;
}

.count-ico {
  background-color: rgba(0,0,0,0.1);
  border-radius: 0.5rem;
  padding: 0.25rem;
  margin-right: 0.5rem;
}

.profile-block {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.profile-info {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.pfp {
  position: relative;
  background-position: center;
  background-size: contain;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
}

.status-indicator {
  display: block;
  z-index: 999;
  width: 1rem;
  height: 1rem;
  margin-left: auto;
  border: 2px solid var(--background-second-color);
  border-radius: 50%;
  background-color: var(--button-background-color);
}

.user-info {
  display: flex;
  flex-direction: column;
  margin-left: 0.5rem;
}

.username {
  font-size: 14pt;
}

.role {
  color: var(--muted-color);
  font-size: 10pt;
}

.chart-block {
    max-width: 50%
}

.attendance-chart {
    max-height: 22rem;
    display: flex
}

@media (max-width:641px) {
  .welcome-title {
    font-size: 25pt;
  }

  .blocks-row {
    flex-direction: column;
  }

  .chart-block {
    max-width: 100%
  }
}

.today-date-container {
  width: 40%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.today-date-container .today-date-time {
  font-weight: 600;
  font-size: 30px;
  line-height: 10px;
}

.today-date-container .today-date {
  font-weight: 400;
  font-size: 13px;
  line-height: 15px;
  margin-top: 0.25rem;
}

.today-lessons {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-content: center;
}


.homeworks-count-container {
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
}

.homeworks-count-container .homework-count-row {
  display: flex;
  justify-content: center;
}

.homework-count {
  cursor: context-menu;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 8rem;
  width: 8rem;
  margin: 0.5rem;
  background-color: rgba(0,0,0,0.1);
  border-radius: 1rem;
  padding: 1rem;
  transform: none;
  transition: transform .15s ease-in-out;
}

.homework-count:hover {
  transform: scale(110%);
}

.homework-count-title {
  color: var(--muted-color);
  font-size: 12pt;
  font-weight: normal;
}

.homework-count-number {
  font-size: 23pt;
  font-weight: bold;
  text-align: right;
  line-height: 0.8;
  border-left-style: solid;
  border-left-width: 4px;
}

.homework-count-number.total {
  color: var(--button-background-color);
  border-left-color: var(--button-background-color);
}

.homework-count-number.done {
  color: #11b200;
  border-left-color: #11b200;
}

.homework-count-number.pending {
  color: #f4c000;
  border-left-color: #f4c000;
}

.homework-count-number.missing {
  color: #f00;
  border-left-color: #f00;
}




table tr th,
table tr td {
  text-align: center;
  min-width: 3rem;
}

table tr:nth-child(even) td {
  background-color: rgba(0,0,0,0.1);
}
</style>
