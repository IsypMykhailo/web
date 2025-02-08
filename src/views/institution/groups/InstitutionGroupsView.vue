<script>
import InstitutionLayout from "../../../layouts/InstitutionLayout.vue";
import {useCurrentInstitutionStore} from "../../../stores/current-institution";
import {storeToRefs} from "pinia/dist/pinia";
import UsersList from "../../../components/UsersList.vue";
import {useGroupsStore} from "../../../stores/groups";
import Translation from "../../../i18n/translation";
import AddIcon from "../../../components/icons/AddIcon.vue";
import DeleteIcon from "../../../components/icons/DeleteIcon.vue";
import EditIcon from "../../../components/icons/EditIcon.vue";
import {useGroupStudentsStore} from "../../../stores/groups-students";
export default {
  emits: ['showRemoveStudentModal', 'showAddStudentModal'],
  components: {EditIcon, DeleteIcon, AddIcon, UsersList, InstitutionLayout },
  setup() {
    const currentInstitutionStore = useCurrentInstitutionStore()
    const groupsStore = useGroupsStore()
    const groupStudentsStore = useGroupStudentsStore()

    const { institution } = storeToRefs(currentInstitutionStore)

    const { groupStudents, groupStudentsLoadingInGroupId, groupStudentsError, removingGroupStudentId, addingStudentInGroupId, } = storeToRefs(groupStudentsStore)
    const { loadGroupStudents, removeGroupStudent, addGroupStudent } = groupStudentsStore

    const { groups, loading, error, removingGroupId } = storeToRefs(groupsStore)
    const { addGroup, removeGroup } = groupsStore

    return { institution, groups, loading, error, removingGroupId, addGroup, removeGroup,
      loadGroupStudents, removeGroupStudent, addGroupStudent, groupStudents, groupStudentsLoadingInGroupId, groupStudentsError, removingGroupStudentId, addingStudentInGroupId,
      Translation }
  },
  data() {
    return {
      selectedGroup: null,
      studentToDelete: null,
      studentToAdd: null
    }
  },
  computed: {
    isOwnerOrAdmin() { return this.institution.role === 0 || this.institution.role === 1 },
  },
  mounted() {
    if (this.institution.role !== 0 && this.institution.role !== 1 && this.institution.role !== 2) {
      this.$router.push({ name: 'dashboard', params: { locale: Translation.currentLocale } })
    }

    const groupsStore = useGroupsStore()
    groupsStore.loadGroups(this.institution.id)
  },
  methods: {
    selectGroup(group) {
      this.selectedGroup = group
      this.loadGroupStudents(this.institution.id, group.id)
    },
    showRemoveStudentModal(userId) {
      this.studentToDelete = userId
      const removeStudentModal = new bootstrap.Modal(document.getElementById('removeStudentModal'))
      removeStudentModal.show()
    },
    showAddStudentModal() {
      const addStudentModal = new bootstrap.Modal(document.getElementById('addStudentModal'))
      addStudentModal.show()
    },
  }
}
</script>

<template>
  <div v-if="this.error" class="error-alert">{{ this.error }}</div>
  <div class="tab">
    <ul class="groups-list">
      <li v-if="this.loading === true" class="group-list-item group-list-item-disabled"><div class="spinner"></div></li>
      <li v-else-if="this.groups !== null && this.groups.length === 0" class="group-list-item group-list-item-disabled">{{ $t('group.view.no-groups') }}</li>
      <li v-else-if="this.groups !== null"
          @click="selectGroup(group)"
          v-for="group in this.groups"
          class="group-list-item"
          :class="{ 'group-list-item-active': this.selectedGroup !== null && group.id === this.selectedGroup.id }">
        <div v-if="removingGroupId === group.id" class="spinner"></div>
        <span v-if="removingGroupId !== group.id">{{ group.name }}</span>
        <div v-if="this.selectedGroup !== null && group.id === this.selectedGroup.id && isOwnerOrAdmin && removingGroupId !== group.id" class="control-panel">
          <RouterLink :to="Translation.i18nRoute({ name: 'edit institution group', params: { id: institution.id, groupId: selectedGroup.id } })" class="simplified-button">
            <div class="ico ico-small">
              <EditIcon />
            </div>
          </RouterLink>

          <div data-bs-toggle="modal" data-bs-target="#deleteGroupModal" class="simplified-button">
            <div class="ico ico-small">
              <DeleteIcon />
            </div>
          </div>
        </div>
      </li>
      <li v-if="isOwnerOrAdmin" class="group-list-item group-list-item-disabled">
        <RouterLink :to="Translation.i18nRoute({ name: 'create institution group', params: { id: $route.params.id } })" class="simplified-button">
          <AddIcon class="ico" />
        </RouterLink>
      </li>
    </ul>

    <div v-if="selectedGroup === null" class="centered-container">
      <div class="text-card">{{ $t('group.view.select') }}</div>
    </div>
    <div v-else class="group-tab">
      <div v-if="isOwnerOrAdmin" class="default-form settings-sections-container">
        <h2 class="form-title">{{ $t('form-fields.head-teacher') }}</h2>

        <div class="form-section">
          <span class="username">$id: {{ selectedGroup.headTeacherId }}</span>
        </div>
      </div>

      <div class="default-form settings-sections-container">
        <h2 class="form-title">{{ $t('form-fields.students') }}</h2>

        <div class="form-section">
          <UsersList :on-add-button-click="showAddStudentModal"
                     :on-delete-button-click="showRemoveStudentModal"
                     :users="groupStudents"
                     :is-loading="selectedGroup.id === groupStudentsLoadingInGroupId"
                     :error="groupStudentsError"
                     :is-adding-new-user="addingStudentInGroupId === selectedGroup.id"
                     :removing-user-id="removingGroupStudentId" />
        </div>
      </div>

      <div class="default-form settings-sections-container">
        <h2 class="form-title">{{ $t('form-fields.sub-groups') }}</h2>

        <div class="form-section">
          <RouterLink :to="Translation.i18nRoute({ name: 'institution sub groups', params: { id: institution.id, groupId: selectedGroup.id } })" class="button">{{ $t('form-fields.sub-groups') }}</RouterLink>
        </div>
      </div>
    </div>
  </div>

  <div v-if="isOwnerOrAdmin" class="modal modal-alert" tabindex="-1" role="dialog" id="deleteGroupModal" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content rounded-3 shadow">
        <div class="modal-body p-4 text-center">
          <h5 class="mb-0">{{ $t('group.view.delete-modal.title') }}</h5>
          <p style="font-size: 11pt" class="mb-0">{{ $t('modal.default-warning') }}</p>
        </div>
        <div class="modal-footer flex-nowrap p-0">
          <button type="button" class="btn btn-lg btn-link fs-6 text-decoration-none col-6 m-0 rounded-0" data-bs-dismiss="modal"><strong>{{ $t('buttons.cancel') }}</strong></button>
          <button @click="() => { removeGroup(this.institution.id, this.selectedGroup.id); this.selectedGroup = null }" type="button" class="btn btn-lg btn-link fs-6 text-decoration-none col-6 m-0 rounded-0" style="font-weight: 500; color: var(--danger-color)"  data-bs-dismiss="modal">{{ $t('buttons.delete') }}</button>
        </div>
      </div>
    </div>
  </div>

  <div class="modal modal-alert" tabindex="-1" role="dialog" id="removeStudentModal" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content rounded-3 shadow">
        <div class="modal-body p-4 text-center">
          <h5 class="mb-0">{{ $t('group.view.remove-student-modal.title') }}</h5>
          <p style="font-size: 11pt" class="mb-0">{{ $t('modal.default-warning') }}</p>
        </div>
        <div class="modal-footer flex-nowrap p-0">
          <button type="button" class="btn btn-lg btn-link fs-6 text-decoration-none col-6 m-0 rounded-0" data-bs-dismiss="modal"><strong>{{ $t('buttons.cancel') }}</strong></button>
          <button @click="removeGroupStudent(institution.id, selectedGroup.id, studentToDelete)" type="button" class="btn btn-lg btn-link fs-6 text-decoration-none col-6 m-0 rounded-0" style="font-weight: 500; color: var(--danger-color)"  data-bs-dismiss="modal">{{ $t('buttons.remove') }}</button>
        </div>
      </div>
    </div>
  </div>

  <div class="modal modal-alert" tabindex="-1" role="dialog" id="addStudentModal" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content rounded-3 shadow">
        <div class="modal-body p-4 text-center">
          <h5 class="mb-0">{{ $t('group.view.add-student-modal.title') }}</h5>
          <p style="font-size: 11pt" class="mb-0">{{ $t('group.view.add-student-modal.hint') }}</p>
          <input v-model="studentToAdd" style="margin-top: 1rem" type="text" class="form-input">
        </div>
        <div class="modal-footer flex-nowrap p-0">
          <button type="button" class="btn btn-lg btn-link fs-6 text-decoration-none col-6 m-0 rounded-0" data-bs-dismiss="modal"><strong>{{ $t('buttons.cancel') }}</strong></button>
          <button :disabled="studentToAdd === null || studentToAdd === ''"
                  @click="addGroupStudent(institution.id, selectedGroup.id, studentToAdd)"
                  type="button" class="btn btn-lg btn-link fs-6 text-decoration-none col-6 m-0 rounded-0"
                  style="font-weight: 500;"  data-bs-dismiss="modal">{{ $t('buttons.add') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
  flex-direction: row;
  justify-content: flex-start;
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
  font-size: medium;
  font-weight: normal;
  border-radius: 1.75rem;
  background: rgba(0, 0, 0, 0.1);
  padding: 0.5rem 1rem;
}

.settings-sections-container {
  margin-bottom: 3rem;
}

.group-tab {
  padding: 1.5rem;
}
</style>
