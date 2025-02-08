<script>
import InstitutionLayout from "../../../layouts/InstitutionLayout.vue";
import {useCurrentInstitutionStore} from "../../../stores/current-institution";
import {storeToRefs} from "pinia/dist/pinia";
import {useHomeworksStore} from "../../../stores/homeworks";
import Translation from "../../../i18n/translation";
import {useGroupsStore} from "../../../stores/groups";
import {useHomeworkItemsStore} from "../../../stores/homework-items";

export default {
  components: { InstitutionLayout },
  setup() {
    const currentInstitutionStore = useCurrentInstitutionStore()
    const groupsStore = useGroupsStore()
    const homeworksStore = useHomeworksStore()
    const homeworkItemsStore = useHomeworkItemsStore()

    const { institution } = storeToRefs(currentInstitutionStore)
    const { editLoading, editError, editValidationFailure, loadedHomeworkItem } = storeToRefs(homeworkItemsStore)
    const { editHomeworkItem, loadHomeworkItemById } = homeworkItemsStore
    //const { groups, loading, error } = storeToRefs(groupsStore)

    return { institution, editLoading, loadHomeworkItemById, editError, loadedHomeworkItem, editValidationFailure, editHomeworkItem, Translation }
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
    if (this.institution.role !== 2) {
      this.$router.push({ name: 'dashboard', params: { locale: Translation.currentLocale } })
    }
  this.loadHomeworkItemById(this.institution.id, this.$route.query.groupId, this.$route.params.homeworkId, this.$route.params.homeworkItemId)
  },
  methods: {
    /*handleFileUpload(event){
      const file = event.target.files[0];
      this.completedHomework = file;
    }*/
  },
  watch: {
    loadedHomeworkItem: {
      handler: function() {
        if(this.loadedHomeworkItem !== null) {
          this.completedHomework = this.loadedHomeworkItem.completedHomework
          this.homeworkComment = this.loadedHomeworkItem.comment
        }
      }
    }
  }
}
</script>

<template>
  <form class="default-form" enctype="multipart/form-data">
    <RouterLink :to="Translation.i18nRoute({ name: 'institution homework', params: { id: $route.params.id }, query: {groupId: this.$route.query.groupId} })" class="link">{{ $t('homework.go-back') }}</RouterLink>

    <h2 class="form-title">{{ $t('homework-items.edit-view') }}</h2>
    <div v-if="this.editError !== null" class="error-alert">{{ this.editError }}</div>
    <ul v-if="this.editValidationFailure !== null" class="error-alert validation-alert">
      <li v-for="problem in editValidationFailure">
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
      <input v-model="this.homeworkComment" class="form-input" type="text"/>
      <!--<span class="muted-text">{{ $t('form-fields.name-hint') }}</span>-->
    </div>
    <button v-if="this.editLoading !== true" @click="this.editHomeworkItem(this.institution.id, this.$route.query.groupId, this.$route.params.homeworkId, this.loadedHomeworkItem.id, this.completedHomework, this.homeworkComment)" type="button" class="button">{{ $t('buttons.create') }}</button>
    <div v-else class="spinner"></div>
  </form>
</template>

<style scoped>
.error-alert {
  margin-bottom: 1rem;
}
</style>