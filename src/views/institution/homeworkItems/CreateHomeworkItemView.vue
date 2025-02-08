<script>
import InstitutionLayout from "../../../layouts/InstitutionLayout.vue";
import {useCurrentInstitutionStore} from "../../../stores/current-institution";
import {storeToRefs} from "pinia/dist/pinia";
import {useHomeworksStore} from "../../../stores/homeworks";
import Translation from "../../../i18n/translation";
import {useGroupsStore} from "../../../stores/groups";
import {useHomeworkItemsStore} from "../../../stores/homework-items";
import Editor from '@tinymce/tinymce-vue'

export default {
  components: { InstitutionLayout, 'editor':Editor },
  setup() {
    const currentInstitutionStore = useCurrentInstitutionStore()
    const groupsStore = useGroupsStore()
    const homeworksStore = useHomeworksStore()
    const homeworkItemsStore = useHomeworkItemsStore()

    const { institution } = storeToRefs(currentInstitutionStore)
    const { creatingLoading, creatingError, creatingValidationFailure } = storeToRefs(homeworkItemsStore)
    const { addHomeworkItem } = homeworkItemsStore
    //const { groups, loading, error } = storeToRefs(groupsStore)

    return { institution, creatingLoading, creatingError, creatingValidationFailure, addHomeworkItem, Translation }
  },
  data() {
    return {
      completedHomework: [],
      homeworkComment: ''
    }
  },
  computed: {
    isTeacher() { return this.institution.role === 2 },
    isStudent() {return this.institution.role === 3}

  },
  mounted() {
    if (this.institution.role !== 3) {
      this.$router.push({ name: 'dashboard', params: { locale: Translation.currentLocale } })
    }

  },
  methods: {
    /*handleFileUpload(event){
      const file = event.target.files[0];
      this.completedHomework = file;
    }*/
  }
}
</script>

<template>
  <form class="default-form" enctype="multipart/form-data">
    <RouterLink :to="Translation.i18nRoute({ name: 'institution homework', params: { id: $route.params.id } })" class="link">{{ $t('homework.go-back') }}</RouterLink>

    <h2 class="form-title">{{ $t('homework-items.create-view') }}</h2>
    <div v-if="this.creatingError !== null" class="error-alert">{{ this.creatingError }}</div>
    <ul v-if="this.creatingValidationFailure !== null" class="error-alert validation-alert">
      <li v-for="problem in creatingValidationFailure">
        {{ problem.key }}:
        <ul>
          <li v-for="error in problem.errors">{{ error }}</li>
        </ul>
      </li>

    </ul>
    <!--<div class="form-section">
      <strong class="form-input-title">{{ $t('form-fields.file') }}</strong>
      <input v-on:change="handleFileUpload" class="form-input form-control" type="file"/>
    </div>-->
    <div class="form-section">
      <strong class="form-input-title">{{ $t('form-fields.comment') }}</strong>
      <editor :init="{height:500}" v-model="this.homeworkComment" class="form-input" type="text"/>
      <!--<span class="muted-text">{{ $t('form-fields.name-hint') }}</span>-->
    </div>
    <button v-if="this.creatingLoading !== true" @click="this.addHomeworkItem(this.institution.id, this.$route.query.groupId, this.$route.params.homeworkId, this.completedHomework, this.homeworkComment)" type="button" class="button">{{ $t('buttons.create') }}</button>
    <div v-else class="spinner"></div>
  </form>
</template>

<style scoped>
.error-alert {
  margin-bottom: 1rem;
}
</style>