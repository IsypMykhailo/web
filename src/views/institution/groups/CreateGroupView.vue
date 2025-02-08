<script>
import InstitutionLayout from "../../../layouts/InstitutionLayout.vue";
import {useCurrentInstitutionStore} from "../../../stores/current-institution";
import {storeToRefs} from "pinia/dist/pinia";
import {useGroupsStore} from "../../../stores/groups";
import Translation from "../../../i18n/translation";
import {useTeachersStore} from "../../../stores/teachers";
export default {
  components: { InstitutionLayout },
  setup() {
    const currentInstitutionStore = useCurrentInstitutionStore()
    const groupsStore = useGroupsStore()
    const teachersStore = useTeachersStore()

    const { institution } = storeToRefs(currentInstitutionStore)
    const { creatingLoading, creatingError, creatingValidationFailure } = storeToRefs(groupsStore)
    const { addGroup } = groupsStore
    const { teachers, teachersLoading, teachersError } = storeToRefs(teachersStore)

    return { institution, creatingLoading, creatingError, creatingValidationFailure, teachers, teachersLoading, teachersError, addGroup, Translation }
  },
  data() {
    return {
      groupName: '',
      headTeacherId: ''
    }
  },
  computed: {
    isOwnerOrAdmin() { return this.institution.role === 0 || this.institution.role === 1 }
  },
  mounted() {
    if (this.institution.role !== 0 && this.institution.role !== 1) {
      this.$router.push({ name: 'dashboard', params: { locale: Translation.currentLocale } })
    }

    const teachersStore = useTeachersStore()
    teachersStore.loadTeachers(this.institution.id)
  }
}
</script>

<template>
  <form class="default-form">
    <RouterLink :to="Translation.i18nRoute({ name: 'institution groups', params: { id: $route.params.id } })" class="link">{{ $t('group.go-back') }}</RouterLink>

    <h2 class="form-title">{{ $t('group.create-view.title') }}</h2>
    <div v-if="this.creatingError !== null" class="error-alert">{{ this.creatingError }}</div>
    <div v-else-if="this.teachersError !== null" class="error-alert">{{ this.teachersError }}</div>
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
      <input v-model="this.groupName" class="form-input" type="text"/>
      <span class="muted-text">{{ $t('form-fields.name-hint') }}</span>
    </div>
    <div class="form-section">
      <strong class="form-input-title">{{ $t('form-fields.head-teacher') }}</strong>
      <select v-model="this.headTeacherId" class="form-input">
        <option disabled>{{ $t('form-fields.head-teacher-select') }}</option>
        <option v-if="teachersLoading === true" disabled>{{ $t('loading') }}</option>
        <option v-else v-for="teacher in this.teachers" :value="teacher.id">$id: {{ teacher.id }}</option>
      </select>
    </div>
    <button v-if="this.creatingLoading !== true" @click="this.addGroup(this.institution.id, this.groupName, this.headTeacherId)" type="button" class="button">{{ $t('buttons.create') }}</button>
    <div v-else class="spinner"></div>
  </form>
</template>

<style scoped>
.error-alert {
  margin-bottom: 1rem;
}
</style>