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
import {useJournalsStore} from "../../../stores/journals";
export default {
  components: {EditIcon, DeleteIcon, AddIcon, UsersList, InstitutionLayout },
  setup() {
    const currentInstitutionStore = useCurrentInstitutionStore()
    const homeworksStore = useHomeworksStore()
    const homeworkItemsStore = useHomeworkItemsStore()
    const groupsStore = useGroupsStore()
    const journalsStore = useJournalsStore()

    const { institution } = storeToRefs(currentInstitutionStore)

    const { loadedHomework, editLoading, editError, editValidationFailure } = storeToRefs(homeworksStore)
    const { removeHomework, loadHomeworkById } = homeworksStore
    const {loadedGroup} = storeToRefs(groupsStore)
    const { loadedHomeworkItem, myHomeworkItemLoading } = storeToRefs(homeworkItemsStore)

    const { journalsByGroup, journalsByGroupLoading, journalsByGroupError } = storeToRefs(journalsStore)
    const { loadJournalsByGroup } = journalsStore

    return { institution, loadedHomeworkItem, myHomeworkItemLoading, removeHomework, loadHomeworkById, loadedHomework,
      editLoading, editError, editValidationFailure, loadedGroup, Translation,
      journalsByGroup, journalsByGroupLoading, journalsByGroupError, loadJournalsByGroup }
  },
  data() {
    return {
      options: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric'},
      readableDate: null,

      selectedJournalId: -1
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
  },
  watch: {
    loadedHomework: {
      handler: function(){
        if(this.loadedHomework != null) {
          const groupsStore = useGroupsStore()
          groupsStore.loadGroupById(this.institution.id, this.loadedHomework.groupId)
          const dateString = this.loadedHomework.dueDate;
          const date = new Date(dateString);
          this.readableDate = date.toLocaleString(this.$t('language'), this.options);

          const homeworkItemsStore = useHomeworkItemsStore()
          homeworkItemsStore.loadMyHomeworkItem(this.institution.id, this.loadedHomework.groupId, this.loadedHomework.id)
        }
      },
      deep: true
    },
  },
  methods: {
    openAttachHomeworkModal() {
      this.loadJournalsByGroup(this.institution.id, this.loadedHomework.groupId)

      const attachHomeworkModal = new bootstrap.Modal(document.getElementById('attachHomeworkModal'))
      attachHomeworkModal.show()
    },
    attachHomework() {
      const modal = new bootstrap.Modal(document.getElementById('attachHomeworkModal'))
      modal.hide()

      this.$router.push(this.Translation.i18nRoute({
        name: 'create institution journal column',
        params: { id: this.institution.id, journalId: this.selectedJournalId },
        query: { homeworkId: this.loadedHomework.id } }))
    },
  }
}
</script>

<template>
  <RouterLink :to="Translation.i18nRoute({ name: 'institution homeworks', params: { id: $route.params.id } })" class="link">{{ $t('homework.go-back') }}</RouterLink>
  <div v-if="this.editError" class="error-alert">{{ this.editError }}</div>
  <div class="ul-text-card">
  <div class="text-card">
    <div v-if="this.myHomeworkItemLoading === true" class="group-list-item group-list-item-disabled"><div class="spinner"></div></div>
    <div v-else-if="this.loadedGroup !== null && this.loadedHomework !== null" style="font-size: larger;">
      <span>{{this.loadedGroup.name}}</span>
    </div>
    <hr/>
    <div v-if="this.loadedGroup !== null && this.loadedHomework !== null">
      <strong>{{ $t('form-fields.title') }}</strong><br>
      <span>{{this.loadedHomework.title}}</span>
    </div>
    <hr/>
    <div v-if="this.loadedGroup !== null && this.loadedHomework !== null">
      <strong>{{ $t('form-fields.due-date') }}</strong><br>
      <span>{{this.readableDate}}</span>
    </div>
    <hr/>
    <div v-if="this.loadedGroup !== null && this.loadedHomework !== null">
      <strong>{{ $t('form-fields.description') }}</strong><br>
      <div v-html="this.loadedHomework.description"></div>
    </div>
    <hr/>
    <div v-if="this.loadedGroup !== null && this.loadedHomework !== null">
      <strong>{{ $t('homework.view.homework-path') }}</strong><br>
      <iframe v-for="path in this.loadedHomework.homeworkPath" :src="path" width="30" height="30"></iframe>
    </div>
    <div v-if="isTeacher && this.loadedGroup !== null && this.loadedHomework !== null" class="default-form settings-sections-container homework-items mb-3">
      <div class="form-section">
        <RouterLink :to="Translation.i18nRoute({ name: 'institution homeworkItems', params: { id: institution.id, homeworkId: this.loadedHomework.id }, query: {groupId: this.loadedHomework.groupId} })" class="button">{{ $t('homework-items.view') }}</RouterLink>
      </div>
    </div>
    <div v-if="isTeacher && this.loadedGroup !== null && this.loadedHomework !== null" class="default-form settings-sections-container homework-items" style="bottom: 6%">
      <div class="form-section">
        <button @click="openAttachHomeworkModal" type="button" class="button">{{ $t('buttons.attach-homework') }}</button>
      </div>
    </div>
    <div v-if="isStudent && this.loadedGroup !== null && this.loadedHomework !== null && this.loadedHomeworkItem != null" class="default-form settings-sections-container my-homework-item">
      <div class="form-section">
        <RouterLink :to="Translation.i18nRoute({ name: 'institution myHomeworkItem', params: { id: institution.id, homeworkId: this.$route.params.homeworkId }, query: {groupId: this.loadedHomework.groupId} })" class="button">{{ $t('homework-items.view-my') }}</RouterLink>
      </div>
    </div>
    <div v-if="isStudent && this.loadedGroup !== null && this.loadedHomework !== null && this.loadedHomeworkItem == null" class="default-form settings-sections-container homework-items">
      <div class="form-section">
        <RouterLink :to="Translation.i18nRoute({ name: 'create institution homeworkItem', params: { id: institution.id, homeworkId: this.$route.params.homeworkId }, query: {groupId: this.loadedHomework.groupId} })" class="button">{{ $t('homework-items.create') }}</RouterLink>
      </div>
    </div>
    <div class="control-panel text-card-buttons m-3" v-if="this.loadedHomework !== null  && this.loadedGroup !== null">
      <RouterLink v-if="isTeacher" :to="Translation.i18nRoute({ name: 'edit institution homework', params: { id: institution.id, homeworkId: this.loadedHomework.id }, query: {groupId: this.loadedHomework.groupId} })" class="simplified-button">
        <div class="ico ico-small">
          <EditIcon />
        </div>
      </RouterLink>
      <div v-if="isTeacher" data-bs-toggle="modal" data-bs-target="#deleteHomeworkModal" class="simplified-button">
        <div class="ico ico-small">
          <DeleteIcon />
        </div>
      </div>
    </div>
  </div>
  </div>

  <div v-if="isTeacher" class="modal modal-alert" tabindex="-1" role="dialog" id="deleteHomeworkModal" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content rounded-3 shadow">
        <div class="modal-body p-4 text-center">
          <h5 class="mb-0">{{ $t('homework.view.delete-modal.title') }}</h5>
          <p style="font-size: 11pt" class="mb-0">{{ $t('modal.default-warning') }}</p>
        </div>
        <div class="modal-footer flex-nowrap p-0">
          <button type="button" class="btn btn-lg btn-link fs-6 text-decoration-none col-6 m-0 rounded-0" data-bs-dismiss="modal"><strong>{{ $t('buttons.cancel') }}</strong></button>
          <button @click="() => { removeHomework(this.institution.id, this.loadedHomework.groupId, this.loadedHomework.id);  this.$router.push({
                            name: 'institution homeworks',
                            params: { locale: Translation.currentLocale, id: this.institution.id }
                        }) }" type="button" class="btn btn-lg btn-link fs-6 text-decoration-none col-6 m-0 rounded-0" style="font-weight: 500; color: var(--danger-color)"  data-bs-dismiss="modal">{{ $t('buttons.delete') }}</button>
        </div>
      </div>
    </div>
  </div>

  <div v-if="isTeacher && loadedHomework !== null" class="modal modal-alert" tabindex="-1" role="dialog" id="attachHomeworkModal" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content rounded-3 shadow">
        <div class="modal-body p-4 text-center">
          <h5 class="mb-0">{{ $t('homework.manage') }}</h5>
          <p style="font-size: 11pt" class="mb-0">{{ $t('homework.attach-homework-hint') }}</p>

          <select v-model="selectedJournalId" class="form-input">
            <option disabled selected>{{ $t('form-fields.journal') }}</option>
            <option v-if="journalsByGroupLoading === true" selected>{{ $t('form-fields.journal') }}</option>
            <option v-else-if="journalsByGroup !== null" v-for="journal in journalsByGroup" :value="journal.id">{{ journal.subject.name }}: {{ journal.name }}</option>
          </select>
        </div>
        <div class="modal-footer flex-nowrap p-0">
          <button type="button" class="btn btn-lg btn-link fs-6 text-decoration-none col-6 m-0 rounded-0" data-bs-dismiss="modal"><strong>{{ $t('buttons.cancel') }}</strong></button>
          <button :disabled="selectedJournalId === -1" @click="attachHomework" type="button" class="btn btn-lg btn-link fs-6 text-decoration-none col-6 m-0 rounded-0" style="font-weight: 500;" data-bs-dismiss="modal">{{ $t('buttons.attach-lesson') }}</button>
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
  hr{
    width: 100%;
    display: block;
    height: 1px;
    margin-top: 20px;
    margin-bottom: 20px;
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
    width: 80%;
    /*width: 50vw;*/
    display: flex;
    flex-direction: column;
    /*justify-content: center;*/
    /*align-items: center;*/
    /*height: 8vh;*/
    padding-left: 2rem;
    padding-top: 2rem;
    list-style: none;
    float: left;
    overflow: hidden;
  }
  .ul-text-card {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
  }

  .text-card-buttons {
    position: absolute;
    right: 0;
    top:0;
  }
  .homework-items {
    position: absolute;
    left: 5%;
    bottom:0;
  }
  .my-homework-item{
    position:absolute;
    right:5%;
    bottom:0;
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
    font-size: medium;
    font-weight: normal;
    border-radius: 1.75rem;
    background: rgba(0, 0, 0, 0.1);
    width: 90%;
    margin: 1rem auto;
    padding: 2rem;
    cursor: pointer;
    list-style: none;
    overflow: hidden;
  }

  .ul-text-card {
    width: 100%;
    display: flex;
    justify-content: center;
    height: 100%;
  }

  .text-card-buttons {
    position: absolute;
    right: 1rem;
    top: 1rem;
  }
  .homework-items {
    position: absolute;
    bottom:0;
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
