<script>
import InstitutionLayout from "../../../layouts/InstitutionLayout.vue";
import {useCurrentInstitutionStore} from "../../../stores/current-institution";
import {storeToRefs} from "pinia/dist/pinia";
import UsersList from "../../../components/UsersList.vue";
import Translation from "../../../i18n/translation";
import {useSubGroupsStore} from "../../../stores/sub-groups";
import AddIcon from "../../../components/icons/AddIcon.vue";
import DeleteIcon from "../../../components/icons/DeleteIcon.vue";
import EditIcon from "../../../components/icons/EditIcon.vue";
import {useSubGroupStudentsStore} from "../../../stores/sub-groups-students";
import {useGroupStudentsStore} from "../../../stores/groups-students";

export default {
  emits: ['showRemoveStudentModal', 'showAddStudentModal'],
  components: {EditIcon, DeleteIcon, AddIcon, UsersList, InstitutionLayout },
  setup() {
    const currentInstitutionStore = useCurrentInstitutionStore()
    const subGroupsStore = useSubGroupsStore()
    const subGroupStudentsStore = useSubGroupStudentsStore()
    const groupStudentsStore = useGroupStudentsStore()

    const { institution } = storeToRefs(currentInstitutionStore)

    const { subGroups, loading, error, deletingSubGroupId } = storeToRefs(subGroupsStore)
    const { deleteSubGroup } = subGroupsStore

    const { groupStudents, groupStudentsError, groupStudentsLoadingInGroupId } = storeToRefs(groupStudentsStore)
    const { loadGroupStudents } = groupStudentsStore

    const { subGroupStudents, subGroupStudentsLoadingInSubGroupId, subGroupStudentsError, removingSubGroupStudentId, addingStudentInSubGroupId, studentIsNotAGroupStudent } = storeToRefs(subGroupStudentsStore)
    const { loadSubGroupStudents, addSubGroupStudent, removeSubGroupStudent } = subGroupStudentsStore

    return { institution, subGroups, loading, error, deletingSubGroupId, deleteSubGroup,
      subGroupStudents, subGroupStudentsLoadingInSubGroupId, subGroupStudentsError, removingSubGroupStudentId, addingStudentInSubGroupId, studentIsNotAGroupStudent, loadSubGroupStudents, addSubGroupStudent, removeSubGroupStudent,
      groupStudents, groupStudentsError, groupStudentsLoadingInGroupId, loadGroupStudents,
      Translation }
  },
  data() {
    return {
      selectedSubGroup: null,
      studentToDelete: null,
      studentToAdd: null,
    }
  },
  mounted() {
    if (this.institution.role !== 0 && this.institution.role !== 1 && this.institution.role !== 2) {
      this.$router.push({ name: 'dashboard', params: { locale: Translation.currentLocale } })
    }

    const subGroupsStore = useSubGroupsStore()
    subGroupsStore.loadSubGroups(this.institution.id, this.$route.params.groupId)
  },
  methods: {
    selectSubGroup(subGroup) {
      this.selectedSubGroup = subGroup
      this.loadSubGroupStudents(this.institution.id, this.$route.params.groupId, subGroup.id)
      this.loadGroupStudents(this.institution.id, this.$route.params.groupId)
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
  <RouterLink :to="Translation.i18nRoute({ name: 'institution groups', params: { id: $route.params.id } })" class="link">{{ $t('group.go-back') }}</RouterLink>

  <div v-if="this.error" class="error-alert">{{ this.error }}</div>
  <div v-else-if="this.groupStudentsError" class="error-alert">{{ this.groupStudentsError }}</div>
  <div class="tab">
    <ul class="groups-list">
      <li v-if="this.loading === true" class="group-list-item group-list-item-disabled"><div class="spinner"></div></li>
      <li v-else-if="this.subGroups !== null && this.subGroups.length === 0" class="group-list-item group-list-item-disabled">{{ $t('sub-group.view.no-sub-groups') }}</li>
      <li v-else-if="this.subGroups !== null"
          @click="selectSubGroup(subGroup)"
          v-for="subGroup in this.subGroups"
          class="group-list-item"
          :class="{ 'group-list-item-active': this.selectedSubGroup !== null && subGroup.id === this.selectedSubGroup.id }">
        <div v-if="deletingSubGroupId === subGroup.id" class="spinner"></div>
        <span v-if="deletingSubGroupId !== subGroup.id">{{ subGroup.name }}</span>
        <div v-if="this.selectedSubGroup !== null && subGroup.id === this.selectedSubGroup.id && deletingSubGroupId !== subGroup.id" class="control-panel">
          <RouterLink :to="Translation.i18nRoute({ name: 'edit institution sub group', params: { id: institution.id, groupId: $route.params.groupId, subGroupId: selectedSubGroup.id } })" class="simplified-button">
            <div class="ico ico-small">
              <EditIcon />
            </div>
          </RouterLink>

          <div data-bs-toggle="modal" data-bs-target="#deleteSubGroupModal" class="simplified-button">
            <div class="ico ico-small">
              <DeleteIcon />
            </div>
          </div>
        </div>
      </li>
      <li class="group-list-item group-list-item-disabled">
        <RouterLink :to="Translation.i18nRoute({ name: 'create institution sub group', params: { id: $route.params.id, groupId: $route.params.groupId } })" class="simplified-button">
          <AddIcon class="ico" />
        </RouterLink>
      </li>
    </ul>

    <div v-if="selectedSubGroup === null" class="centered-container">
      <div class="text-card">{{ $t('sub-group.view.select') }}</div>
    </div>
    <div v-else class="sub-group-tab">
      <div class="default-form settings-sections-container">
        <h2 class="form-title">{{ $t('form-fields.students') }}</h2>

        <div class="form-section">
          <div v-if="studentIsNotAGroupStudent === true" class="error-alert validation-alert" style="margin-bottom: 1rem;">
            {{ $t('sub-group.view.not-a-groups-student-error') }}
          </div>
          <UsersList :on-add-button-click="showAddStudentModal"
                     :on-delete-button-click="showRemoveStudentModal"
                     :users="subGroupStudents"
                     :is-loading="selectedSubGroup.id === subGroupStudentsLoadingInSubGroupId"
                     :error="subGroupStudentsError"
                     :is-adding-new-user="addingStudentInSubGroupId === selectedSubGroup.id"
                     :removing-user-id="removingSubGroupStudentId" />
        </div>
      </div>
    </div>
  </div>

  <div class="modal modal-alert" tabindex="-1" role="dialog" id="deleteSubGroupModal" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content rounded-3 shadow">
        <div class="modal-body p-4 text-center">
          <h5 class="mb-0">{{ $t('sub-group.view.delete-sub-group-modal.title') }}</h5>
          <p style="font-size: 11pt" class="mb-0">{{ $t('modal.default-warning') }}</p>
        </div>
        <div class="modal-footer flex-nowrap p-0">
          <button type="button" class="btn btn-lg btn-link fs-6 text-decoration-none col-6 m-0 rounded-0" data-bs-dismiss="modal"><strong>{{ $t('buttons.cancel') }}</strong></button>
          <button @click="() => { this.deleteSubGroup(this.institution.id, $route.params.groupId, selectedSubGroup.id); this.selectedSubGroup = null }" type="button" class="btn btn-lg btn-link fs-6 text-decoration-none col-6 m-0 rounded-0" style="font-weight: 500; color: var(--danger-color)"  data-bs-dismiss="modal">{{ $t('buttons.delete') }}</button>
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
          <button @click="removeSubGroupStudent(institution.id, this.$route.params.groupId, selectedSubGroup.id, studentToDelete)" type="button" class="btn btn-lg btn-link fs-6 text-decoration-none col-6 m-0 rounded-0" style="font-weight: 500; color: var(--danger-color)"  data-bs-dismiss="modal">{{ $t('buttons.remove') }}</button>
        </div>
      </div>
    </div>
  </div>

  <div class="modal modal-alert" tabindex="-1" role="dialog" id="addStudentModal" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content rounded-3 shadow">
        <div class="modal-body p-4 text-center">
          <h5 class="mb-0">{{ $t('group.view.add-student-modal.title') }}</h5>
          <p style="font-size: 11pt" class="mb-0">{{ $t('sub-group.view.add-student-modal.select') }}</p>
          <select v-model="studentToAdd" style="margin-top: 1rem" class="form-input">
            <option disabled>{{ $t('sub-group.view.add-student-modal.select') }}</option>
            <option v-if="groupStudentsLoadingInGroupId === $route.params.groupId" disabled>{{ $t('loading') }}</option>
            <option v-else v-for="groupStudent in groupStudents" :value="groupStudent.id">$id: {{ groupStudent.id }}</option>
          </select>
        </div>
        <div class="modal-footer flex-nowrap p-0">
          <button type="button" class="btn btn-lg btn-link fs-6 text-decoration-none col-6 m-0 rounded-0" data-bs-dismiss="modal"><strong>{{ $t('buttons.cancel') }}</strong></button>
          <button :disabled="studentToAdd === null || studentToAdd === ''"
                  @click="addSubGroupStudent(institution.id, this.$route.params.groupId, selectedSubGroup.id, studentToAdd)"
                  type="button" class="btn btn-lg btn-link fs-6 text-decoration-none col-6 m-0 rounded-0"
                  style="font-weight: 500;"  data-bs-dismiss="modal">{{ $t('buttons.add') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.error-alert {
  margin-top: 1rem;
}

.tab {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100%;
  border: 1px solid var(--border-color);
  border-radius: 1rem;
  margin-top: 1rem
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

.sub-group-tab {
  padding: 1.5rem;
}
</style>
