<script>
import InstitutionLayout from "../../../layouts/InstitutionLayout.vue";
import {useCurrentInstitutionStore} from "../../../stores/current-institution";
import {storeToRefs} from "pinia/dist/pinia";
import {useHomeworksStore} from "../../../stores/homeworks";
import {useJournalsStore} from "../../../stores/journals";
import Translation from "../../../i18n/translation";
import {useGroupsStore} from "../../../stores/groups";
import Editor from '@tinymce/tinymce-vue'
export default {
  components: { InstitutionLayout, 'editor':Editor },
  setup() {
    const currentInstitutionStore = useCurrentInstitutionStore()
    const groupsStore = useGroupsStore()
    const homeworksStore = useHomeworksStore()
    const journals = useJournalsStore()

    const { institution } = storeToRefs(currentInstitutionStore)
    const { creatingLoading, creatingError, creatingValidationFailure } = storeToRefs(homeworksStore)
    const { addHomework } = homeworksStore
    const { groups, loading, error } = storeToRefs(groupsStore)
    const { teachingGroups, teachingGroupsLoading, teachingGroupsError } = storeToRefs(journals)

    return { institution, creatingLoading, creatingError, creatingValidationFailure, groups, loading, error, addHomework,
      teachingGroups, teachingGroupsLoading, teachingGroupsError, Translation }
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

    /*const groupsStore = useGroupsStore()
    groupsStore.loadGroups(this.institution.id)*/

    const journalsStore = useJournalsStore()
    journalsStore.loadTeachingGroups(this.institution.id)
  },
  methods: {
    /*handleFileUpload(event){
      const file = event.target.files[0];
      this.homeworkPath = file;
    }*/
  }
}
</script>

<template>
  <form class="default-form" enctype="multipart/form-data">
    <RouterLink :to="Translation.i18nRoute({ name: 'institution homeworks', params: { id: $route.params.id } })" class="link">{{ $t('homework.go-back') }}</RouterLink>

    <h2 class="form-title">{{ $t('homework.create-view.title') }}</h2>
    <div v-if="this.creatingError !== null" class="error-alert">{{ this.creatingError }}</div>
    <div v-else-if="this.error !== null" class="error-alert">{{ this.error }}</div>
    <ul v-if="this.creatingValidationFailure !== null" class="error-alert validation-alert">
      <li v-for="problem in creatingValidationFailure">
        {{ problem.key }}:
        <ul>
          <li v-for="error in problem.errors">{{ error }}</li>
        </ul>
      </li>

    </ul>
    <div class="form-section">
      <strong class="form-input-title">{{ $t('form-fields.title') }}</strong>
      <input v-model="this.title" class="form-input" type="text"/>
      <!--<span class="muted-text">{{ $t('form-fields.name-hint') }}</span>-->
    </div>
    <!--<div class="form-section">
      <strong class="form-input-title">{{ $t('form-fields.file') }}</strong>
      <input v-on:change="handleFileUpload" class="form-input form-control" type="file"/>
    </div>-->
    <div class="form-section">
      <strong class="form-input-title">{{ $t('form-fields.group') }}</strong>
      <select v-model="this.groupId" class="form-input">
        <option disabled>{{ $t('form-fields.group-select') }}</option>
        <option v-if="loading === true" disabled>{{ $t('loading') }}</option>
        <option v-else v-for="group in this.teachingGroups" :value="group.id"><span v-if="group.parentGroup != null">{{group.parentGroup.name}}: </span>{{ group.name }}</option>
      </select>
    </div>
    <div class="form-section">
      <strong class="form-input-title">{{$t('form-fields.due-date')}}</strong>
      <input v-model="this.dueDate" class="form-input" type="datetime-local"/>
    </div>
    <div class="form-section">
      <strong class="form-input-title">{{$t('form-fields.description')}}</strong>
      <editor api-key="no-api-key" :init="{height:500}" v-model="this.description" class="form-input"/>
    </div>
    <button v-if="this.creatingLoading !== true" @click="this.addHomework(this.institution.id, this.groupId, this.title, this.homeworkPath, this.description, this.dueDate)" type="button" class="button">{{ $t('buttons.create') }}</button>
    <div v-else class="spinner"></div>
  </form>
</template>

<style scoped>
.error-alert {
  margin-bottom: 1rem;
}
</style>