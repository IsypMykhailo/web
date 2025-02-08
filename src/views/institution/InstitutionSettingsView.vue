<script>
import InstitutionLayout from "../../layouts/InstitutionLayout.vue";
import {useCurrentInstitutionStore} from "../../stores/current-institution";
import {storeToRefs} from "pinia/dist/pinia";
import UsersList from "../../components/UsersList.vue";
import {useRouter} from "vue-router/dist/vue-router";
import Translation from "../../i18n/translation";
import {useAdminsStore} from "../../stores/admins";
import {useTeachersStore} from "../../stores/teachers";
export default {
  emits: ['showRemoveAdminModal', 'showAddAdminModal', 'showRemoveTeacherModal', 'showAddTeacherModal'],
  components: {UsersList, InstitutionLayout },
  data() {
    return {
      institutionName: null,
      institutionDescription: null,
      adminIdToRemove: null,
      adminIdToAdd: null,
      teacherIdToRemove: null,
      teacherIdToAdd: null
    }
  },
  computed: {
    isOwner() { return this.institution.role === 0 }
  },
  setup() {
    const currentInstitutionStore = useCurrentInstitutionStore()
    const adminsStore = useAdminsStore()
    const teachersStore = useTeachersStore()

    const { institution, updatingLoading, updatingError, updatingValidationFailure, deletingLoading, deletingError } = storeToRefs(currentInstitutionStore)
    const { updateInfo, deleteInstitution } = currentInstitutionStore
    const { admins, adminsLoading, adminsError, removingAdminId, addingNewAdminLoading } = storeToRefs(adminsStore)
    const { teachers, teachersLoading, teachersError, removingTeacherId, addingNewTeacherLoading, removingTeacherIsHeadTeacher } = storeToRefs(teachersStore)
    const { addAdmin, removeAdmin } = adminsStore
    const { addTeacher, removeTeacher } = teachersStore
    const router = useRouter()

    return { institution, updatingLoading, updatingError, updatingValidationFailure, deletingLoading, deletingError, deleteInstitution, updateInfo, router, admins, adminsLoading, adminsError, removingAdminId, addingNewAdminLoading, teachers, teachersLoading, teachersError, removingTeacherId, addingNewTeacherLoading, removingTeacherIsHeadTeacher, addAdmin, removeAdmin, addTeacher, removeTeacher }
  },
  beforeRouteLeave(from, to, next) {
    const currentInstitutionStore = useCurrentInstitutionStore()
    const { clearErrors } = currentInstitutionStore
    clearErrors()
    next()
  },
  mounted() {
    if (this.institution.role !== 0 && this.institution.role !== 1) {
      this.$router.push({ name: 'dashboard', params: { locale: Translation.currentLocale } })
    }

    const adminsStore = useAdminsStore()
    const teachersStore = useTeachersStore()

    const { loadAdmins } = adminsStore
    const { loadTeachers } = teachersStore

    loadAdmins(this.institution.id)
    loadTeachers(this.institution.id)
  },
  methods: {
    showRemoveAdminModal(userId) {
      this.adminIdToRemove = userId
      const removeAdminModal = new bootstrap.Modal(document.getElementById('removeAdminModal'))
      removeAdminModal.show()
    },
    showAddAdminModal() {
      const removeAdminModal = new bootstrap.Modal(document.getElementById('addAdminModal'))
      removeAdminModal.show()
    },
    showRemoveTeacherModal(userId) {
      this.teacherIdToRemove = userId
      const removeAdminModal = new bootstrap.Modal(document.getElementById('removeTeacherModal'))
      removeAdminModal.show()
    },
    showAddTeacherModal() {
      const removeAdminModal = new bootstrap.Modal(document.getElementById('addTeacherModal'))
      removeAdminModal.show()
    },
  }
}
</script>

<template>
  <form class="default-form settings-sections-container">
    <h2 class="form-title">{{ $t('settings.information') }}</h2>
    <div v-if="this.updatingError !== null" class="error-alert">{{ this.updatingError }}</div>
    <ul v-if="this.updatingValidationFailure !== null" class="error-alert validation-alert">
      <li v-for="problem in updatingValidationFailure">
        {{ problem.key }}:
        <ul>
          <li v-for="error in problem.errors">{{ error }}</li>
        </ul>
      </li>
    </ul>
    <div class="form-section">
      <strong class="form-input-title">{{ $t('form-fields.name') }}</strong>
      <input :value="institutionName === null ? this.institution.name : institutionName" @input="institutionName = $event.target.value" class="form-input" type="text"/>
<!--        <span class="muted-text"></span>-->
    </div>
    <div class="form-section">
      <span class="form-input-title">{{ $t('institution.description') }}</span>
      <textarea :value="institutionDescription === null ? this.institution.description : institutionDescription" @input="institutionDescription = $event.target.value" class="form-input"></textarea>
    </div>
    <button v-if="this.updatingLoading !== true" @click="this.updateInfo(institutionName === null ? this.institution.name : institutionName, institutionDescription === null ? this.institution.description : institutionDescription)" type="button" class="button">{{ $t('buttons.save') }}</button>
    <div v-else class="spinner"></div>
  </form>

  <div class="default-form settings-sections-container">
    <h2 class="form-title">{{ $t('settings.personnel') }}</h2>
    <div v-if="isOwner" class="form-section">
      <strong class="form-input-title">{{ $t('settings.admins') }}</strong>
      <UsersList :on-add-button-click="showAddAdminModal" :on-delete-button-click="showRemoveAdminModal" :removing-user-id="removingAdminId" :is-adding-new-user="addingNewAdminLoading" :error="adminsError" :is-loading="adminsLoading" :users="admins"/>
    </div>

    <div class="form-section">
      <strong class="form-input-title">{{ $t('form-fields.teachers') }}</strong>
      <div v-if="this.removingTeacherIsHeadTeacher === true" class="error-alert" style="margin-top: 1rem; margin-bottom: 1rem">{{ $t('settings.view.can-not-remove-teacher-error') }}</div>
      <UsersList :on-add-button-click="showAddTeacherModal" :on-delete-button-click="showRemoveTeacherModal" :removing-user-id="removingTeacherId" :is-adding-new-user="addingNewTeacherLoading" :error="teachersError" :is-loading="teachersLoading" :users="teachers"/>
    </div>
  </div>

  <div v-if="isOwner" class="default-form settings-sections-container">
    <h2 class="form-title">{{ $t('settings.danger-zone') }}</h2>
    <div class="form-section">
      <button type="button" class="button delete-button">{{ $t('buttons.transfer') }}</button>
      <p class="muted-text">{{ $t('settings.transfer-hint') }}</p>
    </div>
    <div class="form-section">
      <div v-if="this.deletingError !== null" class="error-alert">{{ this.deletingError }}</div>
      <button v-if="deletingLoading === false" data-bs-toggle="modal" data-bs-target="#deleteInstitutionModal" type="button" class="button delete-button">{{ $t('buttons.delete') }}</button>
      <div v-else class="spinner"></div>
      <p class="muted-text">{{ $t('settings.delete-hint') }}</p>
    </div>
  </div>

  <div v-if="isOwner" class="modal modal-alert" tabindex="-1" role="dialog" id="deleteInstitutionModal" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content rounded-3 shadow">
        <div class="modal-body p-4 text-center">
          <h5 class="mb-0">{{ $t('settings.delete-modal.title') }}</h5>
          <p style="font-size: 11pt" class="mb-0">{{ $t('modal.default-warning') }}</p>
        </div>
        <div class="modal-footer flex-nowrap p-0">
          <button type="button" class="btn btn-lg btn-link fs-6 text-decoration-none col-6 m-0 rounded-0" data-bs-dismiss="modal"><strong>{{ $t('buttons.cancel') }}</strong></button>
          <button @click="deleteInstitution" type="button" class="btn btn-lg btn-link fs-6 text-decoration-none col-6 m-0 rounded-0" style="font-weight: 500; color: var(--danger-color)"  data-bs-dismiss="modal">{{ $t('buttons.delete') }}</button>
        </div>
      </div>
    </div>
  </div>

  <div v-if="isOwner" class="modal modal-alert" tabindex="-1" role="dialog" id="removeAdminModal" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content rounded-3 shadow">
        <div class="modal-body p-4 text-center">
          <h5 class="mb-0">{{ $t('settings.remove-admin-modal.title') }}</h5>
          <p style="font-size: 11pt" class="mb-0">{{ $t('modal.default-warning') }}</p>
        </div>
        <div class="modal-footer flex-nowrap p-0">
          <button type="button" class="btn btn-lg btn-link fs-6 text-decoration-none col-6 m-0 rounded-0" data-bs-dismiss="modal"><strong>{{ $t('buttons.cancel') }}</strong></button>
          <button @click="this.removeAdmin(this.institution.id, this.adminIdToRemove)" type="button" class="btn btn-lg btn-link fs-6 text-decoration-none col-6 m-0 rounded-0" style="font-weight: 500; color: var(--danger-color)"  data-bs-dismiss="modal">{{ $t('buttons.remove') }}</button>
        </div>
      </div>
    </div>
  </div>

  <div v-if="isOwner" class="modal modal-alert" tabindex="-1" role="dialog" id="addAdminModal" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content rounded-3 shadow">
        <div class="modal-body p-4 text-center">
          <h5 class="mb-0">{{ $t('settings.add-admin-modal.title') }}</h5>
          <p style="font-size: 11pt" class="mb-0">{{ $t('settings.add-admin-modal.hint') }}</p>
          <input v-model="adminIdToAdd" style="margin-top: 1rem" type="text" class="form-input">
        </div>
        <div class="modal-footer flex-nowrap p-0">
          <button type="button" class="btn btn-lg btn-link fs-6 text-decoration-none col-6 m-0 rounded-0" data-bs-dismiss="modal"><strong>{{ $t('buttons.cancel') }}</strong></button>
          <button :disabled="adminIdToAdd === null || adminIdToAdd === ''" @click="this.addAdmin(this.institution.id, this.adminIdToAdd)" type="button" class="btn btn-lg btn-link fs-6 text-decoration-none col-6 m-0 rounded-0" style="font-weight: 500;"  data-bs-dismiss="modal">{{ $t('buttons.add') }}</button>
        </div>
      </div>
    </div>
  </div>

  <div class="modal modal-alert" tabindex="-1" role="dialog" id="removeTeacherModal" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content rounded-3 shadow">
        <div class="modal-body p-4 text-center">
          <h5 class="mb-0">{{ $t('settings.remove-teacher-modal.title') }}</h5>
          <p style="font-size: 11pt" class="mb-0">{{ $t('modal.default-warning') }}</p>
        </div>
        <div class="modal-footer flex-nowrap p-0">
          <button type="button" class="btn btn-lg btn-link fs-6 text-decoration-none col-6 m-0 rounded-0" data-bs-dismiss="modal"><strong>{{ $t('buttons.cancel') }}</strong></button>
          <button @click="this.removeTeacher(this.institution.id, this.teacherIdToRemove)" type="button" class="btn btn-lg btn-link fs-6 text-decoration-none col-6 m-0 rounded-0" style="font-weight: 500; color: var(--danger-color)"  data-bs-dismiss="modal">{{ $t('buttons.remove') }}</button>
        </div>
      </div>
    </div>
  </div>

  <div class="modal modal-alert" tabindex="-1" role="dialog" id="addTeacherModal" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content rounded-3 shadow">
        <div class="modal-body p-4 text-center">
          <h5 class="mb-0">{{ $t('settings.add-teacher-modal.title') }}</h5>
          <p style="font-size: 11pt" class="mb-0">{{ $t('settings.add-teacher-modal.hint') }}</p>
          <input v-model="teacherIdToAdd" style="margin-top: 1rem" type="text" class="form-input">
        </div>
        <div class="modal-footer flex-nowrap p-0">
          <button type="button" class="btn btn-lg btn-link fs-6 text-decoration-none col-6 m-0 rounded-0" data-bs-dismiss="modal"><strong>{{ $t('buttons.cancel') }}</strong></button>
          <button :disabled="teacherIdToAdd === null || teacherIdToAdd === ''" @click="this.addTeacher(this.institution.id, this.teacherIdToAdd)" type="button" class="btn btn-lg btn-link fs-6 text-decoration-none col-6 m-0 rounded-0" style="font-weight: 500;"  data-bs-dismiss="modal">{{ $t('buttons.add') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.delete-button {
  background-color: var(--danger-color);
  border: 1px solid var(--danger-color);
}

.delete-button:hover, .delete-button:focus {
  background-color: var(--secondary-danger-color);
}

.validation-alert {
  display: flex;
  flex-direction: column;
  text-align: start;
}

.settings-sections-container {
  margin-bottom: 3rem;
}
</style>
