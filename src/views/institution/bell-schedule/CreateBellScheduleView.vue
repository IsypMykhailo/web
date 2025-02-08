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
    const { creatingLoading, creatingError, creatingValidationFailure } = storeToRefs(bellSchedulesStore)
    const { createBellSchedule } = bellSchedulesStore

    return { institution, creatingLoading, creatingError, creatingValidationFailure, createBellSchedule, Translation }
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
  }
}
</script>

<template>
  <form class="default-form">
    <RouterLink :to="Translation.i18nRoute({ name: 'institution bell schedules', params: { id: $route.params.id } })" class="link">{{ $t('bell-schedule.go-back') }}</RouterLink>

    <h2 class="form-title">{{ $t('bell-schedule.create-view.title') }}</h2>
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
      <input v-model="this.bellScheduleName" class="form-input" type="text"/>
    </div>
    <button v-if="this.creatingLoading !== true" @click="this.createBellSchedule(this.institution.id, this.bellScheduleName)" type="button" class="button">{{ $t('buttons.create') }}</button>
    <div v-else class="spinner"></div>
  </form>
</template>

<style scoped>
.error-alert {
  margin-bottom: 1rem;
}
</style>
