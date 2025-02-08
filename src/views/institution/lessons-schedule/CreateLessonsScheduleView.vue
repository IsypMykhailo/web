<script>
import InstitutionLayout from "../../../layouts/InstitutionLayout.vue";
import {useCurrentInstitutionStore} from "../../../stores/current-institution";
import {storeToRefs} from "pinia/dist/pinia";
import Translation from "../../../i18n/translation";
import {useLessonsSchedulesStore} from "../../../stores/lessons-schedules";
import {useBellSchedulesStore} from "../../../stores/bell-schedules";
import {useGroupsStore} from "../../../stores/groups";
export default {
  components: { InstitutionLayout },
  setup() {
    const currentInstitutionStore = useCurrentInstitutionStore()
    const lessonsSchedulesStore = useLessonsSchedulesStore()
    const bellSchedulesStore = useBellSchedulesStore()
    const groupsStore = useGroupsStore()

    const { institution } = storeToRefs(currentInstitutionStore)

    const { creatingLoading, creatingError, creatingValidationFailure } = storeToRefs(lessonsSchedulesStore)
    const { createLessonsSchedule } = lessonsSchedulesStore

    const { loadedGroup } = storeToRefs(groupsStore)
    const { loadGroupById } = groupsStore

    const { bellSchedules, loading, error } = storeToRefs(bellSchedulesStore)
    const { loadBellSchedules } = bellSchedulesStore

    return { institution, creatingLoading, creatingError, creatingValidationFailure, createLessonsSchedule,
      bellSchedules, loading, error, loadBellSchedules,
      loadedGroup, loadGroupById,
      Translation }
  },
  data() {
    return {
      lessonsScheduleName: '',
      bellScheduleId: 0
    }
  },
  mounted() {
    if (this.institution.role !== 0 && this.institution.role !== 1) {
      this.$router.push({ name: 'dashboard', params: { locale: Translation.currentLocale } })
    }

    this.loadGroupById(this.institution.id, this.$route.params.groupId)
    this.loadBellSchedules(this.institution.id)
  }
}
</script>

<template>
  <div v-if="loadedGroup === null" class="spinner"></div>
  <form v-else class="default-form">
    <RouterLink :to="Translation.i18nRoute({ name: 'institution lesson schedules', params: { id: $route.params.id } })" class="link">{{ $t('lessons-schedule.go-back') }}</RouterLink>

    <h2 class="form-title">{{ $t('lessons-schedule.create-view.title') }}</h2>
    <div v-if="this.creatingError !== null" class="error-alert">{{ this.creatingError }}</div>
    <ul v-if="this.creatingValidationFailure !== null" class="error-alert validation-alert">
      <li v-for="problem in creatingValidationFailure">
        {{ problem.key }}:
        <ul>
          <li v-for="error in problem.errors">{{ error }}</li>
        </ul>
      </li>

    </ul>
    <div class="form-section">
      <strong class="form-input-title">{{ $t('form-fields.name') }}</strong>
      <input v-model="this.lessonsScheduleName" class="form-input" type="text"/>
    </div>
    <div class="form-section">
      <strong class="form-input-title">{{ $t('form-fields.bell-schedule') }}</strong>
      <select v-model="this.bellScheduleId" class="form-input">
        <option disabled>{{ $t('form-fields.bell-schedule-select') }}</option>
        <option v-if="loading === true" disabled>{{ $t('loading') }}</option>
        <option v-else v-for="bellSchedule in this.bellSchedules" :value="bellSchedule.id">{{ bellSchedule.name }}</option>
      </select>
      <RouterLink :to="Translation.i18nRoute({ name: 'institution bell schedules', params: { id: institution.id } })" class="link">{{ $t('bell-schedule.go-to') }}</RouterLink>
    </div>
    <button v-if="this.creatingLoading !== true" @click="this.createLessonsSchedule(this.institution.id, this.$route.params.groupId, this.lessonsScheduleName, this.bellScheduleId)" type="button" class="button">{{ $t('buttons.create') }}</button>
    <div v-else class="spinner"></div>
  </form>
</template>

<style scoped>
.error-alert {
  margin-bottom: 1rem;
}
</style>