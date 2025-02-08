<script>
import InstitutionLayout from "../../../layouts/InstitutionLayout.vue";
import {useCurrentInstitutionStore} from "../../../stores/current-institution";
import {storeToRefs} from "pinia/dist/pinia";
import Translation from "../../../i18n/translation";
import {useGroupsStore} from "../../../stores/groups";
import {useTeachersStore} from "../../../stores/teachers";

export default {
  components: { InstitutionLayout },
  setup() {
    const currentInstitutionStore = useCurrentInstitutionStore()
    const groupStore = useGroupsStore()
    const teachersStore = useTeachersStore()

    const { institution } = storeToRefs(currentInstitutionStore)
    const { editLoading, editError, editValidationFailure, loadedGroup } = storeToRefs(groupStore)
    const { loadGroupById, editGroup } = groupStore

    const { teachers, teachersLoading, teachersError } = storeToRefs(teachersStore)
    const { loadTeachers } = teachersStore

    return { institution, editLoading, editError, editValidationFailure, loadedGroup, loadGroupById, editGroup,
      teachers, teachersLoading, teachersError, loadTeachers,
      Translation }
  },
  data() {
    return {
      groupName: '',
      headTeacherId: '',
    }
  },
  computed: {
    isOwnerOrAdmin() { return this.institution.role === 0 || this.institution.role === 1 }
  },
  mounted() {
    if (this.institution.role !== 0 && this.institution.role !== 1) {
      this.$router.push({ name: 'dashboard', params: { locale: Translation.currentLocale } })
    }

    this.loadGroupById(this.institution.id, this.$route.params.groupId)
    this.loadTeachers(this.institution.id)
  },
  watch: {
    loadedGroup() {
      if (this.loadedGroup !== null) {
        this.groupName = this.loadedGroup.name
        this.headTeacherId = this.loadedGroup.headTeacherId
      }
    }
  }
}
</script>

<template>
  <form class="default-form">
    <RouterLink :to="Translation.i18nRoute({ name: 'institution groups', params: { id: $route.params.id } })" class="link">{{ $t('group.go-back') }}</RouterLink>

    <h2 class="form-title">{{ $t('group.edit-view.title') }}</h2>
    <div v-if="this.editError !== null" class="error-alert">{{ this.editError }}</div>
    <div v-else-if="this.teachersError !== null" class="error-alert">{{ this.teachersError }}</div>
    <ul v-if="this.editValidationFailure !== null" class="error-alert validation-alert">
      <li v-for="problem in editValidationFailure">
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
    <button v-if="this.editLoading !== true" @click="this.editGroup(this.institution.id, this.loadedGroup.id, this.groupName, this.headTeacherId)" type="button" class="button">{{ $t('buttons.edit') }}</button>
    <div v-else class="spinner"></div>
  </form>
</template>

<style scoped>
.error-alert {
  margin-bottom: 1rem;
}
</style>
