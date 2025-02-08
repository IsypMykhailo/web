<script>
import InstitutionLayout from "../../../layouts/InstitutionLayout.vue";
import {useCurrentInstitutionStore} from "../../../stores/current-institution";
import {storeToRefs} from "pinia/dist/pinia";
import UsersList from "../../../components/UsersList.vue";
import {useSubjectsStore} from "../../../stores/subjects";
import Translation from "../../../i18n/translation";
import AddIcon from "../../../components/icons/AddIcon.vue";
import DeleteIcon from "../../../components/icons/DeleteIcon.vue";
import EditIcon from "../../../components/icons/EditIcon.vue";
import {useTeachersStore} from "../../../stores/teachers";
export default {
  emits: ['showRemoveTeacherModal', 'showAddTeacherModal'],
  components: {EditIcon, DeleteIcon, AddIcon, UsersList, InstitutionLayout },
  setup() {
    const currentInstitutionStore = useCurrentInstitutionStore()
    const subjectsStore = useSubjectsStore()
    const teachersStore = useTeachersStore()

    const { institution } = storeToRefs(currentInstitutionStore)

    const { subjects, subjectsLoading, subjectsError, removingSubjectId, removingTeacherId, loadingTeachersSubjectId, addingNewTeacherLoading } = storeToRefs(subjectsStore)
    const { removeSubject, loadSubjectTeachers, addTeacherToSubject, removeTeacherFromSubject, loadSubjects } = subjectsStore

    const { teachers, teachersLoading, teachersError } = storeToRefs(teachersStore)
    const { loadTeachers } = teachersStore

    return { institution, subjects, subjectsLoading, subjectsError, removingSubjectId, removingTeacherId, addingNewTeacherLoading, loadingTeachersSubjectId, addTeacherToSubject, removeTeacherFromSubject, removeSubject, loadSubjectTeachers, loadSubjects,
      teachers, teachersLoading, teachersError, loadTeachers,
      Translation }
  },
  data() {
    return {
      selectedSubject: null,
      teacherIdToAdd: null,
      teacherIdToRemove: null
    }
  },
  computed: {
    isOwnerOrAdmin() { return this.institution.role === 0 || this.institution.role === 1}
  },
  mounted() {
    if (this.institution.role !== 0 && this.institution.role !== 1) {
      this.$router.push({ name: 'dashboard', params: { locale: Translation.currentLocale } })
    }

    this.loadSubjects(this.institution.id)
    this.loadTeachers(this.institution.id)
  },
  methods: {
    selectSubject(subject) {
      this.selectedSubject = subject
      this.loadSubjectTeachers(this.institution.id, subject.id)
    },
    showAddTeacherModal() {
      const addTeacherModal = new bootstrap.Modal(document.getElementById('addTeacherModal'))
      addTeacherModal.show()
    },
    showRemoveTeacherModal(userId) {
      this.teacherIdToRemove = userId
      const removeAdminModal = new bootstrap.Modal(document.getElementById('removeTeacherModal'))
      removeAdminModal.show()
    },
  }
}
</script>

<template>
  <div v-if="this.subjectsError" class="error-alert">{{ this.subjectsError }}</div>
  <div class="tab">
    <ul class="subjects-list">
      <li v-if="this.subjectsLoading === true" class="subject-list-item subject-list-item-disabled"><div class="spinner"></div></li>
      <li v-else-if="this.subjects !== null && this.subjects.length === 0" class="subject-list-item subject-list-item-disabled">{{ $t('subject.view.no-subjects') }}</li>
      <li v-else-if="this.subjects !== null"
          @click="selectSubject(subject)"
          v-for="subject in this.subjects"
          class="subject-list-item"
          :class="{ 'subject-list-item-active': this.selectedSubject !== null && subject.id === this.selectedSubject.id }">
        <div v-if="removingSubjectId === subject.id" class="spinner"></div>
        <span v-if="removingSubjectId !== subject.id">{{ subject.name }}</span>
        <div v-if="this.selectedSubject !== null && subject.id === this.selectedSubject.id && isOwnerOrAdmin && removingSubjectId !== subject.id" class="control-panel">
          <RouterLink :to="Translation.i18nRoute({ name: 'edit institution subject', params: { id: institution.id, subjectId: selectedSubject.id } })" class="simplified-button">
            <div id="edit-button" class="ico ico-small">
              <EditIcon />
            </div>
          </RouterLink>

          <div class="simplified-button">
            <div data-bs-toggle="modal" data-bs-target="#deleteSubjectModal" id="delete-button" class="ico ico-small">
              <DeleteIcon />
            </div>
          </div>
        </div>
      </li>
      <li v-if="isOwnerOrAdmin" class="subject-list-item subject-list-item-disabled">
        <RouterLink :to="Translation.i18nRoute({ name: 'create institution subject', params: { id: $route.params.id } })" class="simplified-button">
          <AddIcon class="ico" />
        </RouterLink>
      </li>
    </ul>

    <div v-if="selectedSubject === null" class="centered-container">
      <div class="text-card">{{ $t('subject.view.select') }}</div>
    </div>
    <div v-else-if="selectedSubject.id === loadingTeachersSubjectId" class="spinner m-3"></div>
    <div v-else-if="selectedSubject.teachers !== undefined" class="">

      <div class="default-form settings-sections-container m-3">
        <h2 class="form-title">{{ $t('form-fields.teachers') }}</h2>

        <div v-if="isOwnerOrAdmin" class="form-section">
          <UsersList :on-add-button-click="showAddTeacherModal" :on-delete-button-click="showRemoveTeacherModal" :removing-user-id="removingTeacherId" :is-adding-new-user="addingNewTeacherLoading" :error="subjectsError" :is-loading="loadingTeachersSubjectId" :users="selectedSubject.teachers"/>
        </div>
      </div>
    </div>
  </div>

  <div v-if="isOwnerOrAdmin" class="modal modal-alert" tabindex="-1" role="dialog" id="removeTeacherModal" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content rounded-3 shadow">
        <div class="modal-body p-4 text-center">
          <h5 class="mb-0">{{ $t('subject.view.remove-teacher-modal.title') }}</h5>
          <p style="font-size: 11pt" class="mb-0">{{ $t('modal.default-warning') }}</p>
        </div>
        <div class="modal-footer flex-nowrap p-0">
          <button type="button" class="btn btn-lg btn-link fs-6 text-decoration-none col-6 m-0 rounded-0" data-bs-dismiss="modal"><strong>{{ $t('buttons.cancel') }}</strong></button>
          <button @click="this.removeTeacherFromSubject(this.institution.id, selectedSubject.id, this.teacherIdToRemove)" type="button" class="btn btn-lg btn-link fs-6 text-decoration-none col-6 m-0 rounded-0" style="font-weight: 500; color: var(--danger-color)"  data-bs-dismiss="modal">{{ $t('buttons.remove') }}</button>
        </div>
      </div>
    </div>
  </div>

  <div v-if="isOwnerOrAdmin" class="modal modal-alert" tabindex="-1" role="dialog" id="addTeacherModal" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content rounded-3 shadow">
        <div class="modal-body p-4 text-center">
          <h5 class="mb-0">{{ $t('subject.view.add-teacher-modal.title') }}</h5>
          <p style="font-size: 11pt" class="mb-0">{{ $t('subject.view.add-teacher-modal.hint') }}</p>
          <select v-model="this.teacherIdToAdd" class="form-input" style="margin-top: 1rem;">
            <option disabled>{{ $t('form-fields.head-teacher-select') }}</option>
            <option v-if="teachersLoading === true" disabled>{{ $t('loading') }}</option>
            <option v-else v-for="teacher in this.teachers" :value="teacher.id">$id: {{ teacher.id }}</option>
          </select>
        </div>
        <div class="modal-footer flex-nowrap p-0">
          <button type="button" class="btn btn-lg btn-link fs-6 text-decoration-none col-6 m-0 rounded-0" data-bs-dismiss="modal"><strong>{{ $t('buttons.cancel') }}</strong></button>
          <button :disabled="teacherIdToAdd === null || teacherIdToAdd === ''" @click="this.addTeacherToSubject(this.institution.id, selectedSubject.id, this.teacherIdToAdd)" type="button" class="btn btn-lg btn-link fs-6 text-decoration-none col-6 m-0 rounded-0" style="font-weight: 500;"  data-bs-dismiss="modal">{{ $t('buttons.add') }}</button>
        </div>
      </div>
    </div>
  </div>

  <div v-if="isOwnerOrAdmin" class="modal modal-alert" tabindex="-1" role="dialog" id="deleteSubjectModal" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content rounded-3 shadow">
        <div class="modal-body p-4 text-center">
          <h5 class="mb-0">{{ $t('subject.view.delete-subject-modal.title') }}</h5>
          <p style="font-size: 11pt" class="mb-0">{{ $t('modal.default-warning') }}</p>
        </div>
        <div class="modal-footer flex-nowrap p-0">
          <button type="button" class="btn btn-lg btn-link fs-6 text-decoration-none col-6 m-0 rounded-0" data-bs-dismiss="modal"><strong>{{ $t('buttons.cancel') }}</strong></button>
          <button @click="removeSubject(this.institution.id, this.selectedSubject.id)" type="button" class="btn btn-lg btn-link fs-6 text-decoration-none col-6 m-0 rounded-0" style="font-weight: 500; color: var(--danger-color)"  data-bs-dismiss="modal">{{ $t('buttons.delete') }}</button>
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

.subjects-list {
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

.subjects-list .subject-list-item:first-child {
  border-top-left-radius: 1rem;
}

.subjects-list .subject-list-item.subject-list-item-disabled:hover,
.subjects-list .subject-list-item.subject-list-item-disabled:focus {
  background: none;
  cursor: auto;
}

.subjects-list .subject-list-item {
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

.subjects-list .subject-list-item:hover, .subjects-list .subject-list-item:focus {
  background-color: rgba(0, 0, 0, 0.1);
}

.subjects-list .subject-list-item.subject-list-item-active {
  background-color: rgba(0, 0, 0, 0.1);
}

.subjects-list .subject-list-item:last-child {
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
</style>
