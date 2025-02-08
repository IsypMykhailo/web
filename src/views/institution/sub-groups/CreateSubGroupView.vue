<script>
import InstitutionLayout from "../../../layouts/InstitutionLayout.vue";
import {useCurrentInstitutionStore} from "../../../stores/current-institution";
import {storeToRefs} from "pinia/dist/pinia";
import Translation from "../../../i18n/translation";
import {useSubGroupsStore} from "../../../stores/sub-groups";
export default {
  components: { InstitutionLayout },
  setup() {
    const currentInstitutionStore = useCurrentInstitutionStore()
    const subGroupsStore = useSubGroupsStore()

    const { institution } = storeToRefs(currentInstitutionStore)
    const { creatingLoading, creatingError, creatingValidationFailure } = storeToRefs(subGroupsStore)
    const { createSubGroup } = subGroupsStore

    return { institution, creatingLoading, creatingError, creatingValidationFailure, createSubGroup, Translation }
  },
  data() {
    return {
      subGroupName: ''
    }
  },
  computed: {
    isOwnerOrAdmin() { return this.institution.role === 0 || this.institution.role === 1 }
  },
  mounted() {
    if (this.institution.role !== 0 && this.institution.role !== 1 && this.institution.role !== 2) {
      this.$router.push({ name: 'dashboard', params: { locale: Translation.currentLocale } })
    }
  }
}
</script>

<template>
  <form class="default-form">
    <RouterLink :to="Translation.i18nRoute({ name: 'institution sub groups', params: { id: $route.params.id, groupId: $route.params.groupId } })" class="link">{{ $t('sub-group.go-back') }}</RouterLink>

    <h2 class="form-title">{{ $t('sub-group.create-view.title') }}</h2>
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
      <input v-model="this.subGroupName" class="form-input" type="text"/>
      <span class="muted-text">{{ $t('form-fields.name-hint') }}</span>
    </div>
    <button v-if="this.creatingLoading !== true" @click="this.createSubGroup(this.institution.id, $route.params.groupId, this.subGroupName)" type="button" class="button">{{ $t('buttons.create') }}</button>
    <div v-else class="spinner"></div>
  </form>
</template>

<style scoped>
.error-alert {
  margin-bottom: 1rem;
}
</style>