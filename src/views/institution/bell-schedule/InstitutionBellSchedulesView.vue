<script>
import InstitutionLayout from "../../../layouts/InstitutionLayout.vue";
import {useCurrentInstitutionStore} from "../../../stores/current-institution";
import {storeToRefs} from "pinia/dist/pinia";
import {useBellSchedulesStore} from "../../../stores/bell-schedules";
import Translation from "../../../i18n/translation";
import AddIcon from "../../../components/icons/AddIcon.vue";
import DeleteIcon from "../../../components/icons/DeleteIcon.vue";
import EditIcon from "../../../components/icons/EditIcon.vue";
export default {
  components: {EditIcon, DeleteIcon, AddIcon, InstitutionLayout },
  setup() {
    const currentInstitutionStore = useCurrentInstitutionStore()
    const bellSchedulesStore = useBellSchedulesStore()

    const { institution } = storeToRefs(currentInstitutionStore)
    const { bellSchedules, loading, error, deletingBellScheduleId, loadingItemsBellScheduleId, creatingBellScheduleItemValidationFailure, creatingBellScheduleItemValidationFailureBellScheduleId, deletingBellScheduleItemId } = storeToRefs(bellSchedulesStore)
    const { deleteBellSchedule, loadBellScheduleItems, createBellScheduleItem, deleteBellScheduleItem } = bellSchedulesStore

    return { institution, bellSchedules, loading, error, deletingBellScheduleId, loadingItemsBellScheduleId, creatingBellScheduleItemValidationFailure, creatingBellScheduleItemValidationFailureBellScheduleId, deletingBellScheduleItemId, deleteBellSchedule, createBellScheduleItem, loadBellScheduleItems, deleteBellScheduleItem, Translation }
  },
  data() {
    return {
      selectedBellSchedule: null,
      selectedBellScheduleItem: null,
      lessonIndex: null,
      lessonStartTime: null,
      lessonEndTime: null,
      days: [],
      daysOfWeek: [
          { index: 1, name: 'monday' },
          { index: 2, name: 'tuesday' },
          { index: 3, name: 'wednesday' },
          { index: 4, name: 'thursday' },
          { index: 5, name: 'friday' },
          { index: 6, name: 'saturday' },
          { index: 0, name: 'sunday' },
      ]
    }
  },
  computed: {
    isOwnerOrAdmin() { return this.institution.role === 0 || this.institution.role === 1 },
    getItemsByDayOfWeek() {
      return (day) => {
        if (this.selectedBellSchedule === null) return []
        return this.selectedBellSchedule.items.filter(e => e.dayOfWeek === day).sort((a, b) => a.lessonIndex - b.lessonIndex);
      }
    },
  },
  mounted() {
    const bellSchedulesStore = useBellSchedulesStore()
    bellSchedulesStore.loadBellSchedules(this.institution.id)
  },
  methods: {
    selectBellSchedule(bellSchedule) {
      this.selectedBellSchedule = bellSchedule
      this.loadBellScheduleItems(this.institution.id, bellSchedule.id)
    },
    selectBellScheduleItem(bellScheduleItem) {
      this.selectedBellScheduleItem = bellScheduleItem
      const deleteBellScheduleItemModal = new bootstrap.Modal(document.getElementById('deleteBellScheduleItemModal'))
      deleteBellScheduleItemModal.show()
    }
  }
}
</script>

<template>
  <div v-if="this.error" class="error-alert">{{ this.error }}</div>
  <div class="tab">
    <ul class="tabs-list">
      <li v-if="this.loading === true" class="tabs-list-item tabs-list-item-disabled"><div class="spinner"></div></li>
      <li v-else-if="this.bellSchedules !== null && this.bellSchedules.length === 0" class="tabs-list-item tabs-list-item-disabled">{{ $t('bell-schedule.view.no-bell-schedules') }}</li>
      <li v-else-if="this.bellSchedules !== null"
          @click="selectBellSchedule(bellSchedule)"
          v-for="bellSchedule in this.bellSchedules"
          class="tabs-list-item"
          :class="{ 'tabs-list-item-active': this.selectedBellSchedule !== null && bellSchedule.id === this.selectedBellSchedule.id }">
        <div v-if="deletingBellScheduleId === bellSchedule.id" class="spinner"></div>
        <span v-if="deletingBellScheduleId !== bellSchedule.id">{{ bellSchedule.name }}</span>
        <div v-if="this.selectedBellSchedule !== null && bellSchedule.id === this.selectedBellSchedule.id && isOwnerOrAdmin && deletingBellScheduleId !== bellSchedule.id" class="control-panel">
          <RouterLink :to="Translation.i18nRoute({ name: 'edit institution bell schedule', params: { bellScheduleId: this.selectedBellSchedule.id } })" class="simplified-button">
            <div class="ico ico-small">
              <EditIcon />
            </div>
          </RouterLink>

          <div class="simplified-button" data-bs-toggle="modal" data-bs-target="#deleteBellScheduleModal">
            <div class="ico ico-small">
              <DeleteIcon />
            </div>
          </div>
        </div>
      </li>
      <li v-if="isOwnerOrAdmin" class="tabs-list-item tabs-list-item-disabled">
        <RouterLink :to="Translation.i18nRoute({ name: 'create institution bell schedule', params: { id: $route.params.id } })" class="simplified-button">
          <AddIcon class="ico" />
        </RouterLink>
      </li>
    </ul>

    <ul v-if="selectedBellSchedule !== null && selectedBellSchedule.id === creatingBellScheduleItemValidationFailureBellScheduleId && creatingBellScheduleItemValidationFailure !== null" class="error-alert validation-alert">
      <li v-for="problem in creatingBellScheduleItemValidationFailure">
        {{ problem.key }}:
        <ul>
          <li v-for="error in problem.errors">{{ error }}</li>
        </ul>
      </li>
    </ul>

    <div v-if="selectedBellSchedule === null" class="centered-container">
      <div class="text-card">{{ $t('bell-schedule.view.select') }}</div>
    </div>
    <div v-else-if="selectedBellSchedule.id === loadingItemsBellScheduleId" class="centered-container">
      <div class="spinner"></div>
    </div>
    <div v-else-if="selectedBellSchedule.items !== undefined" class="bell-schedule-items">
      <div v-for="dayOfWeek in this.daysOfWeek" class="bell-schedule-day">
        <span class="bell-schedule-day-title">{{ $t(`days.short.${dayOfWeek.name}`) }}</span>

        <div class="bell-schedule-day-items">
          <div v-for="item in getItemsByDayOfWeek(dayOfWeek.index)" class="bell-schedule-day-item">
            <strong class="lesson-index">{{ item.lessonIndex }}.</strong>
            <span class="lesson-time">{{ item.lessonStartTime.replace(new RegExp(':00' + "*$"),'') }} - {{ item.lessonEndTime.replace(new RegExp(':00' + "*$"),'') }}</span>

            <div v-if="deletingBellScheduleItemId === item.id" class="spinner"></div>
            <div v-else-if="isOwnerOrAdmin" @click="selectBellScheduleItem(item)" class="simplified-button">
              <div class="ico ico-small">
                <DeleteIcon />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="isOwnerOrAdmin && selectedBellSchedule !== null && selectedBellSchedule.items !== undefined" class="center-screen">
      <div data-bs-toggle="modal" data-bs-target="#addBellScheduleItemModal"  class="simplified-button add-new-line-button">
        <AddIcon class="ico" />
      </div>
    </div>
  </div>

  <div v-if="isOwnerOrAdmin" class="modal modal-alert" tabindex="-1" role="dialog" id="deleteBellScheduleModal" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content rounded-3 shadow">
        <div class="modal-body p-4 text-center">
          <h5 class="mb-0">{{ $t('bell-schedule.view.delete-modal.title') }}</h5>
          <p style="font-size: 11pt" class="mb-0">{{ $t('modal.default-warning') }}</p>
        </div>
        <div class="modal-footer flex-nowrap p-0">
          <button type="button" class="btn btn-lg btn-link fs-6 text-decoration-none col-6 m-0 rounded-0" data-bs-dismiss="modal"><strong>{{ $t('buttons.cancel') }}</strong></button>
          <button @click="() => { this.deleteBellSchedule(this.institution.id, this.selectedBellSchedule.id); this.selectedBellSchedule = null }" type="button" class="btn btn-lg btn-link fs-6 text-decoration-none col-6 m-0 rounded-0" style="font-weight: 500; color: var(--danger-color)"  data-bs-dismiss="modal">{{ $t('buttons.delete') }}</button>
        </div>
      </div>
    </div>
  </div>

  <div v-if="isOwnerOrAdmin" class="modal modal-alert" tabindex="-1" role="dialog" id="deleteBellScheduleItemModal" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content rounded-3 shadow">
        <div class="modal-body p-4 text-center">
          <h5 class="mb-0">{{ $t('bell-schedule.view.delete-item-modal.title') }}</h5>
          <p style="font-size: 11pt" class="mb-0">{{ $t('modal.default-warning') }}</p>
        </div>
        <div class="modal-footer flex-nowrap p-0">
          <button type="button" class="btn btn-lg btn-link fs-6 text-decoration-none col-6 m-0 rounded-0" data-bs-dismiss="modal"><strong>{{ $t('buttons.cancel') }}</strong></button>
          <button @click="deleteBellScheduleItem(this.institution.id, this.selectedBellSchedule.id, this.selectedBellScheduleItem.id)" type="button" class="btn btn-lg btn-link fs-6 text-decoration-none col-6 m-0 rounded-0" style="font-weight: 500; color: var(--danger-color)"  data-bs-dismiss="modal">{{ $t('buttons.delete') }}</button>
        </div>
      </div>
    </div>
  </div>

  <div v-if="isOwnerOrAdmin" class="modal modal-alert" tabindex="-1" role="dialog" id="addBellScheduleItemModal" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content rounded-3 shadow">
        <div class="modal-body p-4 text-center">
          <h5 class="mb-0">{{ $t('bell-schedule.view.create-item-modal.title') }}</h5>
          <p style="font-size: 11pt" class="mb-0">{{ $t('bell-schedule.view.create-item-modal.hint') }}</p>

          <select v-model="lessonIndex" style="margin-top: 1rem" class="form-input">
            <option disabled selected>{{ $t('form-fields.lesson-number') }}</option>
            <option v-for="lessonNumber in 99">{{ lessonNumber }}</option>
          </select>

          <div class="time-input">
            <input v-model="lessonStartTime" type="time" style="margin-right: 0.5rem" class="form-input" :placeholder="$t('form-fields.lesson-start-time')">
            <input v-model="lessonEndTime" type="time" style="margin-left: 0.5rem" class="form-input" :placeholder="$t('form-fields.lesson-end-time')">
          </div>

          <div class="days-checkboxes">
            <div v-for="dayOfWeek in daysOfWeek" class="form-check form-switch">
              <input class="form-check-input" type="checkbox" v-model="days" :value="dayOfWeek.index" :id="dayOfWeek.name + 'Check'">
              <label class="form-check-label" :for="dayOfWeek.name + 'Check'">
                {{ $t(`days.full.${dayOfWeek.name}`) }}
              </label>
            </div>
          </div>
        </div>
        <div class="modal-footer flex-nowrap p-0">
          <button type="button" class="btn btn-lg btn-link fs-6 text-decoration-none col-6 m-0 rounded-0" data-bs-dismiss="modal"><strong>{{ $t('buttons.cancel') }}</strong></button>
          <button :disabled="days.length === 0 || lessonStartTime === null || lessonEndTime === null || lessonIndex === null" @click="createBellScheduleItem(institution.id, selectedBellSchedule.id, lessonIndex, lessonStartTime, lessonEndTime, days)" type="button" class="btn btn-lg btn-link fs-6 text-decoration-none col-6 m-0 rounded-0" style="font-weight: 500;"  data-bs-dismiss="modal">{{ $t('buttons.add') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.error-alert {
  margin-bottom: 1rem;
}

.validation-alert {
  margin: 1rem;
}

.tab {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100%;
  border: 1px solid var(--border-color);
  border-radius: 1rem;
}

.tabs-list {
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

.tabs-list .tabs-list-item:first-child {
  border-top-left-radius: 1rem;
}

.tabs-list .tabs-list-item.tabs-list-item-disabled:hover,
.tabs-list .tabs-list-item.tabs-list-item-disabled:focus {
  background: none;
  cursor: auto;
}

.tabs-list .tabs-list-item {
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

.tabs-list .tabs-list-item:hover, .tabs-list .tabs-list-item:focus {
  background-color: rgba(0, 0, 0, 0.1);
}

.tabs-list .tabs-list-item.tabs-list-item-active {
  background-color: rgba(0, 0, 0, 0.1);
}

.tabs-list .tabs-list-item:last-child {
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

.add-new-line-button {
  margin-bottom: 1rem;
}

.bell-schedule-items {
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 0.5rem;
}

.bell-schedule-day {
  width: 100%;
  padding: 0.5rem;
}

/*.bell-schedule-day:nth-child(odd), .bell-schedule-day:nth-child(odd) .bell-schedule-day-item {
  color: var(--border-color);
}

.bell-schedule-day:nth-child(odd) .bell-schedule-day-title {
  border-color: var(--muted-color);
}*/

.bell-schedule-day .bell-schedule-day-title {
  width: 100%;
  display: block;
  text-align: right;
  margin-bottom: 0.5rem;
  border-bottom: 3px solid var(--text-color);
  font-size: large;
  font-weight: bold;
}

.bell-schedule-day-items .bell-schedule-day-item {
  display: inline-flex!important;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0.25rem;
  color: var(--text-color);
  margin-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-color);
}

.bell-schedule-day-items .bell-schedule-day-item .simplified-button {
  cursor: pointer;
}

.bell-schedule-day-items .bell-schedule-day-item .lesson-index {
  font-size: 13pt;
  margin-right: 0.5rem;
}

@media (min-width:641px) {
  .bell-schedule-items {
    flex-direction: row;
  }
}

@media (max-width: 1100px) {
  .bell-schedule-day-items .bell-schedule-day-item {
    flex-direction: column;
    text-align: center;
  }
}

@media (max-width: 641px) {
  .bell-schedule-day-items .bell-schedule-day-item {
    flex-direction: row;
  }
}

.time-input, .days-checkboxes {
  display: flex;
  flex-direction: row;
  margin-top: 1rem;
}

.days-checkboxes {
  flex-direction: column;
  flex-wrap: wrap;
  align-content: flex-start;
  align-items: flex-start;
}

.days-checkboxes div:last-child {
  margin-right: 0;
}

.days-checkboxes div {
  margin-right: 1rem;
}
</style>
