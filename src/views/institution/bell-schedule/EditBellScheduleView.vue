<script>
import InstitutionLayout from "../../../layouts/InstitutionLayout.vue";
import {useCurrentInstitutionStore} from "../../../stores/current-institution";
import {storeToRefs} from "pinia/dist/pinia";
import {useBellSchedulesStore} from "../../../stores/bell-schedules";
import Translation from "../../../i18n/translation";
export default {
  components: { InstitutionLayout },
  setup() {
    const currentInstitutionStore = useCurrentInstitutionStore()
    const bellSchedulesStore = useBellSchedulesStore()

    const { institution } = storeToRefs(currentInstitutionStore)
    const { editLoading, editError, editValidationFailure, loadedBellSchedule } = storeToRefs(bellSchedulesStore)
    const { loadBellScheduleById, editBellSchedule } = bellSchedulesStore

    return { institution, editLoading, editError, editValidationFailure, loadedBellSchedule, loadBellScheduleById, editBellSchedule, Translation }
  },
  data() {
    return {
      'bellScheduleName': ''
    }
  },
  computed: {
    isOwnerOrAdmin() { return this.institution.role === 0 || this.institution.role === 1 }
  },
  mounted() {
    if (this.institution.role !== 0 && this.institution.role !== 1) {
      this.$router.push({ name: 'dashboard', params: { locale: Translation.currentLocale } })
    }

    const bellSchedulesStore = useBellSchedulesStore()
    bellSchedulesStore.loadBellScheduleById(this.institution.id, this.$route.params.bellScheduleId)
  },
  watch: {
    loadedBellSchedule() {
      if (this.loadedBellSchedule !== null)
        this.bellScheduleName = this.loadedBellSchedule.name
    }
  }
}
</script>

<template>
  <form class="default-form">
    <RouterLink :to="Translation.i18nRoute({ name: 'institution bell schedules', params: { id: $route.params.id } })" class="link">{{ $t('bell-schedule.go-back') }}</RouterLink>

    <h2 class="form-title">{{ $t('bell-schedule.edit-view.title') }}</h2>
    <div v-if="this.editError !== null" class="error-alert">{{ this.editError }}</div>
    <ul v-if="this.editValidationFailure !== null" class="error-alert validation-alert">
      <li v-for="problem in editValidationFailure">
        {{ problem.key }}:
        <ul>
          <li v-for="error in problem.errors">{{ error }}</li>
        </ul>
      </li>
    </ul>
    <div v-if="this.loadedBellSchedule === null" class="spinner"></div>
    <div v-else class="form-section">
      <strong class="form-input-title">{{ $t('form-fields.name') }}</strong>
      <input v-model="this.bellScheduleName" class="form-input" type="text"/>
<!--      <span class="muted-text">Name must be unique</span>-->
    </div>
    <button v-if="this.editLoading !== true" @click="this.editBellSchedule(this.institution.id, this.loadedBellSchedule.id, this.bellScheduleName)" type="button" class="button">{{ $t('buttons.edit') }}</button>
    <div v-else class="spinner"></div>
  </form>
</template>

<style scoped>
.error-alert {
  margin-bottom: 1rem;
}
</style>
