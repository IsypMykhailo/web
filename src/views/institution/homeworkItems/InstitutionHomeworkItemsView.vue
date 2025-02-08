<script>
import InstitutionLayout from "../../../layouts/InstitutionLayout.vue";
import {useCurrentInstitutionStore} from "../../../stores/current-institution";
import {storeToRefs} from "pinia/dist/pinia";
import UsersList from "../../../components/UsersList.vue";
import {useHomeworksStore} from "../../../stores/homeworks";
import {useGroupsStore} from "../../../stores/groups";
import Translation from "../../../i18n/translation";
import AddIcon from "../../../components/icons/AddIcon.vue";
import DeleteIcon from "../../../components/icons/DeleteIcon.vue";
import EditIcon from "../../../components/icons/EditIcon.vue";
import {useHomeworkItemsStore} from "../../../stores/homework-items";
import {useGroupStudentsStore} from "../../../stores/groups-students";

export default {
  components: {EditIcon, DeleteIcon, AddIcon, UsersList, InstitutionLayout },
  setup() {
    const currentInstitutionStore = useCurrentInstitutionStore()
    const homeworksStore = useHomeworksStore()
    const homeworkItemsStore = useHomeworkItemsStore()
    const groupsStore = useGroupsStore()
    const groupStudentsStore = useGroupStudentsStore()

    const { institution } = storeToRefs(currentInstitutionStore)

    const { loadedHomework, editLoading, editError, editValidationFailure } = storeToRefs(homeworksStore)
    const { removeHomework, loadHomeworkById } = homeworksStore
    const {loadedGroup} = storeToRefs(groupsStore)
    const {homeworkItems, loading, error, removingHomeworkItemId} = storeToRefs(homeworkItemsStore)
    const {removeHomeworkItem, editHomeworkItem} = homeworkItemsStore
    const { groupStudents, groupStudentsLoadingInGroupId, groupStudentsError, removingGroupStudentId, addingStudentInGroupId} = storeToRefs(homeworkItemsStore)

    return { institution, removeHomework, loadHomeworkById, loadedHomework, editLoading, editError, editValidationFailure, loadedGroup,
      homeworkItems, loading, error, removingHomeworkItemId, removeHomeworkItem, editHomeworkItem,
      groupStudents, groupStudentsLoadingInGroupId, groupStudentsError, removingGroupStudentId, addingStudentInGroupId, Translation }
  },
  data() {
    return {
      options: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric'},
      readableDate: null,
      selectedHomework: null
    }
  },
  computed: {
    isTeacher() { return this.institution.role === 2 },
    isStudent() { return this.institution.role === 3 }
  },
  mounted() {
    if (this.institution.role !== 2 && this.institution.role !== 3) {
      this.$router.push({ name: 'dashboard', params: { locale: Translation.currentLocale } })
    }
    this.loadHomeworkById(this.institution.id, this.$route.query.groupId, this.$route.params.homeworkId);
    const homeworkItemsStore = useHomeworkItemsStore()
    homeworkItemsStore.loadHomeworkItems(this.institution.id, this.$route.query.groupId, this.$route.params.homeworkId)

    /*const homeworksStore = useHomeworksStore()
    homeworksStore.loadHomeworkById()*/
  },
  watch: {
    loadedHomework: {
      handler: function(){
        if(this.loadedHomework != null) {
          const groupsStore = useGroupsStore()
          groupsStore.loadGroupById(this.institution.id, this.loadedHomework.groupId)
        }
      },
      deep: true
    },
    loadedGroup: {
      handler: function(){
        if(this.loadedGroup != null) {
          const groupStudentsStore = useGroupStudentsStore()
          groupStudentsStore.loadGroupStudents(this.institution.id, this.loadedGroup.id)
        }
      },
      deep: true
    }
    /*loadedGroup: {
      handler: function(){
        this.groups.forEach(group => {
          this.homeworks.find((o,i) => {
            if(o.groupId === group.id)
              this.homeworks[i].group = group
          })
        })
      }
    }*/
  },
  methods: {
    selectHomework(homework) {
      this.selectedHomework = homework
    },
    openHomeworkItem(homeworkItem){
      const homeworkItemsStore = useHomeworkItemsStore()
      homeworkItemsStore.loadHomeworkItemById(this.institution.id, this.loadedHomework.groupId, this.loadedHomework.id, homeworkItem.id)
      this.$router.push({name: 'institution homeworkItem',
        params: {locale: Translation.currentLocale, id: this.institution.id, homeworkId: this.loadedHomework.id, studentId: homeworkItem.studentId},
        query: {groupId: this.loadedHomework.groupId}
      })
    },
    stripHtmlTags(string) {
      const div = document.createElement("div");
      div.innerHTML = string;
      return div.textContent || div.innerText || "";
    }
  }
}
</script>

<template>
  <RouterLink :to="Translation.i18nRoute({ name: 'institution homework', params: { id: $route.params.id }, query: {groupId: this.$route.query.groupId} })" class="link">{{ $t('homework-items.go-back') }}</RouterLink>
  <div v-if="this.error" class="error-alert">{{ this.error }}</div>
  <ul class="groups-list">
    <li v-if="this.editLoading === true || this.loading === true" class="group-list-item group-list-item-disabled"><div class="spinner"></div></li>
    <li class="text-card m-3" v-if="this.loadedHomework !== null && this.loadedGroup !== null && this.homeworkItems !== null"
        v-for="homeworkItem in this.homeworkItems" @click="openHomeworkItem(homeworkItem)">
      <div v-if="removingHomeworkItemId === homeworkItem.id" class="spinner"></div>
      <div class="group-name"><span v-if="removingHomeworkItemId !== homeworkItem.id">$id: {{homeworkItem.studentId}}</span></div>
      <span v-if="removingHomeworkItemId !== homeworkItem.id">{{ stripHtmlTags(homeworkItem.comment) }}</span>
      <!--<div v-if="this.selectedHomework !== null && homeworkItem.id === this.selectedHomework.id && removingHomeworkItemId !== homeworkItem.id" class="control-panel text-card-buttons m-3">
        <RouterLink v-if="isStudent" :to="Translation.i18nRoute({ name: 'edit institution homeworkItem', params: { id: institution.id, homeworkId: this.loadedHomework.id, homeworkItemId: homeworkItem.id }, query: {groupId: this.loadedHomework.groupId} })" class="simplified-button">
          <div class="ico ico-small">
            <EditIcon />
          </div>
        </RouterLink>
        <div v-if="isTeacher || isStudent" data-bs-toggle="modal" data-bs-target="#deleteHomeworkModal" class="simplified-button">
          <div class="ico ico-small">
            <DeleteIcon />
          </div>
        </div>
        <button class="button" @click="openHomeworkItem(homeworkItem)">{{ $t('homework.view.open') }}</button>
      </div>-->
    </li>
  </ul>

  <div v-if="isTeacher || isStudent" class="modal modal-alert" tabindex="-1" role="dialog" id="deleteHomeworkModal" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content rounded-3 shadow">
        <div class="modal-body p-4 text-center">
          <h5 class="mb-0">{{ $t('homework.view.delete-modal.title') }}</h5>
          <p style="font-size: 11pt" class="mb-0">{{ $t('modal.default-warning') }}</p>
        </div>
        <div class="modal-footer flex-nowrap p-0">
          <button type="button" class="btn btn-lg btn-link fs-6 text-decoration-none col-6 m-0 rounded-0" data-bs-dismiss="modal"><strong>{{ $t('buttons.cancel') }}</strong></button>
          <button @click="() => { removeHomeworkItem(this.institution.id, this.loadedHomework.groupId, this.loadedHomework.id, this.selectedHomework.id); this.selectedHomework = null }" type="button" class="btn btn-lg btn-link fs-6 text-decoration-none col-6 m-0 rounded-0" style="font-weight: 500; color: var(--danger-color)"  data-bs-dismiss="modal">{{ $t('buttons.delete') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@media(min-width: 768px) {
  .error-alert {
    margin-bottom: 1rem;
  }

  .tab {
    display: flex;
    flex-direction: column;
    width: 100%;
    min-height: 100%;
    border: 1px solid var(--border-color);
    border-radius: 1rem;
  }

  .groups-list {
    width: 100%;
    overflow-x: auto;
    overflow-y: hidden;
    list-style: none;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin: 0 !important;
    padding: 0 !important;
    border-bottom: 1px solid var(--border-color);
  }

  .groups-list .group-list-item:first-child {
    border-top-left-radius: 1rem;
  }

  .groups-list .group-list-item.group-list-item-disabled:hover,
  .groups-list .group-list-item.group-list-item-disabled:focus {
    background: none;
    cursor: auto;
  }

  .groups-list .group-list-item {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 3rem;
    min-width: fit-content;
    cursor: pointer;
    list-style: none;
    float: left;
    padding: 0.35rem 1rem;
    margin: 0;
    border-right: 1px solid var(--border-color);
    transition: background-color .15s ease-in-out;
  }

  .groups-list .group-list-item:hover, .groups-list .group-list-item:focus {
    background-color: rgba(0, 0, 0, 0.1);
  }

  .groups-list .group-list-item.group-list-item-active {
    background-color: rgba(0, 0, 0, 0.1);
  }

  .groups-list .group-list-item:last-child {
    border-right: none;
  }

  .control-panel {
    display: flex;
    flex-direction: row;
    align-content: center;
    justify-content: space-between;
  }

  .control-panel .simplified-button:first-child {
    margin-left: 0.35rem;
  }

  .control-panel .simplified-button {
    display: flex;
  }

  .centered-container {
    margin: auto;
  }

  .text-card {
    position: relative;
    /*font-size: medium;*/
    font-size: medium;
    font-weight: normal;
    border-radius: 1.75rem;
    background: rgba(0, 0, 0, 0.1);
    width: 50vw;
    height: 4em;
    /*width: 50vw;*/
    display: flex;
    /*justify-content: center;*/
    align-items: center;
    /*height: 8vh;*/
    /*padding-left: 2rem;*/
    padding: 0;
    cursor: pointer;
    list-style: none;
    float: left;
    overflow: hidden;
  }

  .text-card-buttons {
    position: absolute;
    right: 0;
  }

  .group-name {
    background-color: var(--background-group-name-color);
    color: var(--group-name-text-color);
    height: 100%;
    font-weight: bold;
    font-size: larger;
    width: 5rem;
    margin-right: 2em;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .settings-sections-container {
    margin-bottom: 3rem;
  }

  .group-tab {
    padding: 1.5rem;
  }
}
@media(max-width: 768px) {
  .error-alert {
    margin-bottom: 1rem;
  }

  .tab {
    display: flex;
    flex-direction: column;
    width: 100%;
    min-height: 100%;
    border: 1px solid var(--border-color);
    border-radius: 1rem;
  }

  .groups-list {
    width: 100%;
    overflow-x: auto;
    overflow-y: hidden;
    list-style: none;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin: 0!important;
    padding: 0!important;
    border-bottom: 1px solid var(--border-color);
  }

  .groups-list .group-list-item:first-child {
    border-top-left-radius: 1rem;
  }

  .groups-list .group-list-item.group-list-item-disabled:hover,
  .groups-list .group-list-item.group-list-item-disabled:focus {
    background: none;
    cursor: auto;
  }

  .groups-list .group-list-item {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 2.5rem;
    min-width: fit-content;
    cursor: pointer;
    list-style: none;
    float: left;
    padding: 0.35rem 0.5rem;
    margin: 0;
    border-right: 1px solid var(--border-color);
    transition: background-color .15s ease-in-out;
  }

  .groups-list .group-list-item:hover, .groups-list .group-list-item:focus {
    background-color: rgba(0, 0, 0, 0.1);
  }

  .groups-list .group-list-item.group-list-item-active {
    background-color: rgba(0, 0, 0, 0.1);
  }

  .groups-list .group-list-item:last-child {
    border-right: none;
  }

  .control-panel {
    display: flex;
    flex-direction: row;
    align-content: center;
    justify-content: space-between;
  }

  .control-panel .simplified-button:first-child {
    margin-left: 0.35rem;
  }

  .control-panel .simplified-button {
    display: flex;
  }

  .centered-container {
    margin: auto;
  }

  .text-card {
    position: relative;
    font-size: small;
    font-weight: normal;
    border-radius: 1.5rem;
    background: rgba(0, 0, 0, 0.1);
    width: 80vw;
    height: 3.5em;
    display: flex;
    align-items: center;
    padding:0;
    cursor: pointer;
    overflow: hidden;
  }
  .text-card-buttons {
    position: absolute;
    right: 0;
  }

  .group-name {
    background-color: var(--background-group-name-color);
    color: var(--group-name-text-color);
    height: 100%;
    font-weight: bold;
    font-size: small;
    width: 4rem;
    margin-right: 1em;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .settings-sections-container {
    margin-bottom: 2rem;
  }

  .group-tab {
    padding: 1rem;
  }

  .button {
    display: inline-block;
    padding: 0.15rem 0.55rem;
    font-size: 0.85rem;
    font-weight: 400;
    line-height: 1.5;
    color: var(--button-text-color);
    text-align: center;
    text-decoration: none;
    vertical-align: middle;
    cursor: pointer;
    -webkit-user-select: none;
    -moz-user-select: none;
    user-select: none;
    border: 1px solid var(--button-background-color);
    border-radius: 0.555rem;
    background-color: var(--button-background-color);
    transition: color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out;
  }

  .button:hover, .button:active {
    background-color: var(--button-active-background-color);
  }
}
</style>