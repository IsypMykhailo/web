<script>
import DefaultLayout from '../../layouts/DefaultLayout.vue'
import Translation from "../../i18n/translation";
import {useInstitutionsStore} from "../../stores/institutions";
import {storeToRefs} from "pinia/dist/pinia";
export default {
  components: {DefaultLayout},
  setup() {
    const institutionsStore = useInstitutionsStore()

    const { creatingLoading, creatingError, creatingValidationFailure } = storeToRefs(institutionsStore)
    const { createInstitution } = institutionsStore

    return { creatingLoading, creatingError, creatingValidationFailure, createInstitution, Translation }
  },
  data() {
    return {
      institutionName: '',
      institutionDescription: ''
    }
  },
  beforeRouteLeave(from, to, next) {
    const institutionStore = useInstitutionsStore()
    const { clearErrors } = institutionStore
    clearErrors()
    next()
  },
}
</script>

<template>
  <DefaultLayout>
    <div class="container wrapper">
      <form class="default-form">
        <RouterLink :to="Translation.i18nRoute({ name: 'list of institutions' })" class="link">{{ $t('institution.go-back') }}</RouterLink>

        <h2 class="form-title">{{ $t('institution.create-view.title') }}</h2>
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
          <input v-model="this.institutionName" class="form-input" type="text"/>
        </div>
        <div class="form-section">
          <span class="form-input-title">{{ $t('institution.description') }}</span>
          <textarea v-model="this.institutionDescription" class="form-input"></textarea>
        </div>
        <button v-if="this.creatingLoading !== true" @click="this.createInstitution(this.institutionName, this.institutionDescription)" type="button" class="button">{{ $t('buttons.create') }}</button>
        <div v-else class="spinner"></div>
      </form>
    </div>
  </DefaultLayout>
</template>

<style scoped>
.wrapper {
  display: flex;
  justify-content: center;
}
</style>