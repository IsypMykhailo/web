<script>
import InstitutionLayout from "../../../layouts/InstitutionLayout.vue";
import {useCurrentInstitutionStore} from "../../../stores/current-institution";
import {storeToRefs} from "pinia/dist/pinia";
import Translation from "../../../i18n/translation";
import {useSubjectsStore} from "../../../stores/subjects";

export default {
  components: { InstitutionLayout },
  setup() {
    const currentInstitutionStore = useCurrentInstitutionStore()
    const subjectsStore = useSubjectsStore()

    const { institution } = storeToRefs(currentInstitutionStore)
    const { editLoading, editError, editValidationFailure, loadedSubject } = storeToRefs(subjectsStore)
    const { loadSubjectById, editSubject } = subjectsStore

    return { institution, editLoading, editError, editValidationFailure, loadedSubject, loadSubjectById, editSubject,
      Translation }
  },
  data() {
    return {
      subjectName: '',
    }
  },
  computed: {
    isOwnerOrAdmin() { return this.institution.role === 0 || this.institution.role === 1 }
  },
  mounted() {
    if (this.institution.role !== 0 && this.institution.role !== 1) {
      this.$router.push({ name: 'dashboard', params: { locale: Translation.currentLocale } })
    }

    this.loadSubjectById(this.institution.id, this.$route.params.subjectId)
  },
  watch: {
    loadedSubject() {
      if (this.loadedSubject !== null) {
        this.subjectName = this.loadedSubject.name
      }
    }
  }
}
</script>

<template>
  <form class="default-form">
    <RouterLink :to="Translation.i18nRoute({ name: 'institution subjects', params: { id: $route.params.id } })" class="link">{{ $t('subject.go-back') }}</RouterLink>

    <h2 class="form-title">{{ $t('subject.edit-view.title') }}</h2>
    <div v-if="this.editError !== null" class="error-alert">{{ this.editError }}</div>
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
      <input v-model="this.subjectName" class="form-input" type="text"/>
      <span class="muted-text">{{ $t('form-fields.name-hint') }}</span>
    </div>

    <button v-if="this.editLoading !== true" @click="this.editSubject(this.institution.id, this.loadedSubject.id, this.subjectName)" type="button" class="button">{{ $t('buttons.edit') }}</button>
    <div v-else class="spinner"></div>
  </form>
</template>

<style scoped>
.error-alert {
  margin-bottom: 1rem;
}
</style>
