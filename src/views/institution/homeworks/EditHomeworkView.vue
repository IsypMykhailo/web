<script>
import InstitutionLayout from "../../../layouts/InstitutionLayout.vue";
import {useCurrentInstitutionStore} from "../../../stores/current-institution";
import {storeToRefs} from "pinia/dist/pinia";
import Translation from "../../../i18n/translation";
import {useGroupsStore} from "../../../stores/groups";
import {useHomeworksStore} from "../../../stores/homeworks";

export default {
  components: { InstitutionLayout },
  setup() {
    const currentInstitutionStore = useCurrentInstitutionStore()
    const groupStore = useGroupsStore()
    const homeworksStore = useHomeworksStore()

    const { institution } = storeToRefs(currentInstitutionStore)
    const { editLoading, editError, editValidationFailure, loadedHomework } = storeToRefs(homeworksStore)
    const { loadHomeworkById, editHomework } = homeworksStore

    const { groups, loading, error } = storeToRefs(groupStore)
    const { loadGroups } = groupStore

    return { institution, editLoading, editError, editValidationFailure, loadedHomework, loadHomeworkById, editHomework,
      groups, loading, error, loadGroups,
      Translation }
  },
  data() {
    return {
      groupId: '',
      title: '',
      homeworkPath: [],
      description: '',
      dueDate: null
    }
  },
  computed: {
    isTeacher() { return this.institution.role === 2 }
  },
  mounted() {
    if (this.institution.role !== 2) {
      this.$router.push({ name: 'dashboard', params: { locale: Translation.currentLocale } })
    }

    this.loadHomeworkById(this.institution.id, this.$route.query.groupId, this.$route.params.homeworkId)
    this.loadGroups(this.institution.id)
  },
  watch: {
    loadedHomework: {
      handler: function() {
        if (this.loadedHomework !== null) {
          this.groupId = this.loadedHomework.groupId
          this.title = this.loadedHomework.title
          this.homeworkPath = this.loadedHomework.homeworkPath
          this.description = this.loadedHomework.description
          this.dueDate = this.loadedHomework.dueDate
          console.log(this.loadedHomework)
        }
      }
    }
  }
}
</script>

<template>
  <form class="default-form">
    <RouterLink :to="Translation.i18nRoute({ name: 'institution homeworks', params: { id: $route.params.id } })" class="link">{{ $t('homework.go-back') }}</RouterLink>

    <h2 class="form-title">{{ $t('homework.edit-view.title') }}</h2>
    <div v-if="this.editError !== null" class="error-alert">{{ this.editError }}</div>
    <div v-else-if="this.error !== null" class="error-alert">{{ this.error }}</div>
    <ul v-if="this.editValidationFailure !== null" class="error-alert validation-alert">
      <li v-for="problem in editValidationFailure">
        {{ problem.key }}:
        <ul>
          <li v-for="error in problem.errors">{{ error }}</li>
        </ul>
      </li>

    </ul>
    <div v-if="this.loadedHomework !== null" class="form-section">
      <strong class="form-input-title">{{ $t('form-fields.title') }}</strong>
      <input v-model="this.title" class="form-input" type="text"/>
      <!--<span class="muted-text">{{ $t('form-fields.name-hint') }}</span>-->
    </div>
    <!--<div class="form-section">
      <strong class="form-input-title">{{ $t('form-fields.file') }}</strong>
      <input v-on:change="handleFileUpload" class="form-input form-control" type="file"/>
    </div>-->
    <div v-if="this.loadedHomework !== null" class="form-section">
      <strong class="form-input-title">{{$t('form-fields.description')}}</strong>
      <textarea v-model="this.description" class="form-input"/>
    </div>
    <div v-if="this.groups !== null && this.loadedHomework !== null" class="form-section">
      <strong class="form-input-title">{{ $t('form-fields.group') }}</strong>
      <select v-model="this.groupId" class="form-input">
        <option disabled>{{ $t('form-fields.group-select') }}</option>
        <option v-if="loading === true" disabled>{{ $t('loading') }}</option>
        <option v-else v-for="group in this.groups" :value="group.id">{{ group.name }}</option>
      </select>
    </div>
    <div v-if="this.loadedHomework !== null" class="form-section">
      <strong class="form-input-title">{{$t('form-fields.due-date')}}</strong>
      <input v-model="this.dueDate" class="form-input" type="datetime-local"/>
    </div>
    <button v-if="this.editLoading !== true" @click="this.editHomework(this.institution.id, this.groupId, this.loadedHomework.id, this.title, this.homeworkPath, this.description, this.dueDate)" type="button" class="button">{{ $t('buttons.edit') }}</button>
    <div v-else class="spinner"></div>
  </form>
</template>

<style scoped>
.error-alert {
  margin-bottom: 1rem;
}
</style>
