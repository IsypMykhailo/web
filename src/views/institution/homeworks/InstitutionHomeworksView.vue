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
import CompletedIcon from "../../../components/icons/CompletedIcon.vue";
import MissingIcon from "../../../components/icons/MissingIcon.vue";
import PendingIcon from "../../../components/icons/PendingIcon.vue";
import EditIcon from "../../../components/icons/EditIcon.vue";
import {useJournalsStore} from "../../../stores/journals";
import {useHomeworkItemsStore} from "../../../stores/homework-items";
import {watchEffect, getCurrentInstance} from "vue";

export default {
  components: {EditIcon, DeleteIcon, AddIcon, UsersList, InstitutionLayout, CompletedIcon, PendingIcon, MissingIcon},
  setup() {
    const currentInstitutionStore = useCurrentInstitutionStore()
    const homeworksStore = useHomeworksStore()
    const homeworkItemsStore = useHomeworkItemsStore()
    const groupsStore = useGroupsStore()
    const journals = useJournalsStore()

    const {institution} = storeToRefs(currentInstitutionStore)

    const {groups, loading, error} = storeToRefs(groupsStore)
    const {homeworks, homeworksLoading, homeworksError} = storeToRefs(homeworksStore)
    const {loadedHomeworkItem, myHomeworkItemLoading} = storeToRefs(homeworkItemsStore)
    const {teachingGroups, teachingGroupsLoading, teachingGroupsError} = storeToRefs(journals)

    return {
      institution,
      loadedHomeworkItem,
      myHomeworkItemLoading,
      homeworks,
      homeworksLoading,
      homeworksError,
      loading,
      error,
      groups,
      teachingGroups, teachingGroupsLoading, teachingGroupsError,
      Translation
    }
  },
  data() {
    return {
      selectedHomework: null,
      studentToDelete: null,
      studentToAdd: null,
      currentDateTime: null,
      filters: [],
      selectedFilter: null,
      homeworksLoaded: [],
      fullyLoaded: false
    }
  },
  computed: {
    isTeacher() {
      return this.institution.role === 2
    },
    isStudent() {
      return this.institution.role === 3
    },
    filteredHomeworks() {
      if (!this.selectedFilter)
        return null

      return this.homeworksLoaded.filter(e => e.group.id === this.selectedFilter.id)
    }
  },
  mounted() {
    if (this.institution.role !== 2 && this.institution.role !== 3) {
      this.$router.push({name: 'dashboard', params: {locale: Translation.currentLocale}})
    }

    this.teachingGroups = null
    this.groups = null
    this.homeworksLoaded = null
    this.homeworks = null

    this.currentDateTime = new Date();
    this.loadGroups()
  },
  methods: {
    onGroupChoice(){
      this.loadHomeworks()
    },
    async loadGroups(){
      this.fullyLoaded = false

      if(this.isTeacher) {
        const journalsStore = useJournalsStore()
        journalsStore.loadTeachingGroups(this.institution.id)

        while (!this.teachingGroups || !Array.isArray(this.teachingGroups)) {
          // Wait for this.teachingGroups to be loaded
          await new Promise(resolve => setTimeout(resolve, 10));
        }

        if (this.teachingGroups.length > 0)
          this.selectedFilter = this.teachingGroups[0]
      }
      else if(this.isStudent) {
        const groupsStore = useGroupsStore();
        await groupsStore.loadGroups(this.institution.id);

        while (!this.groups || !Array.isArray(this.groups)) {
          // Wait for this.groups to be loaded
          await new Promise(resolve => setTimeout(resolve, 10));
        }

        if (this.groups.length > 0)
          this.selectedFilter = this.groups[0]
      }

      if (this.selectedFilter !== null)
        await this.loadHomeworks()

      this.fullyLoaded = true
    },
    async loadHomeworks() {
      this.fullyLoaded = false
      this.homeworksLoaded = []
      const homeworksStore = useHomeworksStore();
      await homeworksStore.loadHomeworks(this.institution.id, this.selectedFilter.id);

      while (!this.homeworks || !Array.isArray(this.homeworks)) {
        // Wait for this.homeworks to be loaded
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      for (let i = 0; i < this.homeworks.length; i++) {
        if (this.homeworks[i].groupId === this.selectedFilter.id) {
          this.homeworks[i].group = this.selectedFilter;

          if (this.isStudent) {
            this.homeworks[i].myHomeworkItem = null
            const homeworksStore = useHomeworksStore()
            homeworksStore.loadMyHomeworkItemInHomework(this.institution.id, this.homeworks[i].group.id, this.homeworks[i].id)
          }

          this.homeworksLoaded.push(this.homeworks[i]);
        }
      }

      this.fullyLoaded = true
    },
    isPending(homework) {
      const dateString = homework.dueDate
      const date = new Date(dateString)
      return this.currentDateTime < date
    },
    isMissed(homework) {
      const dateString = homework.dueDate
      const date = new Date(dateString)
      return this.currentDateTime >= date
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
  <div v-if="this.homeworksError" class="error-alert">{{ this.homeworksError }}</div>

  <div v-if="isTeacher" class="default-form settings-sections-container">
    <div class="form-section">
      <RouterLink :to="Translation.i18nRoute({ name: 'create institution homework', params: { id: institution.id } })"
                  class="button">{{ $t('homework.create-view.title') }}
      </RouterLink>
    </div>
    <div class="form-section">
      <strong class="form-input-title">{{ $t('form-fields.group') }}</strong>
      <select v-model="selectedFilter" @change="onGroupChoice" class="form-input">
        <option disabled>{{ $t('form-fields.group-select') }}</option>
        <option v-if="loading === true" disabled>{{ $t('loading') }}</option>
        <option v-else v-for="group in this.teachingGroups" :key="group.id" :value="group">
          <span v-if="group.parentGroup != null" :id="group.id">{{group.parentGroup.name}}: </span>{{ group.name }}
        </option>
      </select>
    </div>
  </div>

  <div v-if="isStudent" class="default-form settings-sections-container">
    <div class="form-section">
      <strong class="form-input-title">{{ $t('form-fields.group') }}</strong>
      <select v-model="selectedFilter" @change="onGroupChoice" class="form-input">
        <option disabled>{{ $t('form-fields.group-select') }}</option>
        <option v-if="loading === true" disabled>{{ $t('loading') }}</option>
        <option v-else v-for="group in this.groups" :key="group.id" :value="group">
          <span v-if="group.parentGroup != null" :id="group.id">{{group.parentGroup.name}}: </span>{{ group.name }}
        </option>
      </select>
    </div>
  </div>

  <div class="institutions-wrapper">
    <div class="institutions-column">
      <div v-if="!this.fullyLoaded" class="spinner"></div>
      <ul v-else class="institution-list">
        <li class="institution-item" v-for="homework in this.filteredHomeworks">
          <RouterLink class="homework-item" :to="Translation.i18nRoute({name: 'institution homework',
            params: {locale: Translation.currentLocale, id: this.institution.id, homeworkId: homework.id},
            query: {groupId: homework.groupId}})">
            <div class="homework-info">
              <div class="institution-item-title" v-if="this.fullyLoaded">
                <h5>{{ homework.title }}</h5>
              </div>

              <span class="muted-text description">{{ stripHtmlTags(homework.description) }}</span>
            </div>

            <div v-if="homework.myHomeworkItemLoading !== undefined && homework.myHomeworkItemLoading === true">
              <div class="spinner"></div>
            </div>
            <div v-else-if="isStudent && isPending(homework) && homework.myHomeworkItem === null"
                 class="text-card-buttons">
              <PendingIcon class="ico"/>
            </div>
            <div v-else-if="isStudent && isMissed(homework) && homework.myHomeworkItem === null" class="text-card-buttons">
              <MissingIcon class="ico"/>
            </div>
            <div v-else-if="isStudent && homework.myHomeworkItem !== null" class="text-card-buttons">
              <CompletedIcon class="ico"/>
            </div>
          </RouterLink>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.spinner {
  margin-top: 2rem;
}

.error-alert {
  border-radius: 0.75rem;
}

.homework-item {
  text-decoration: none;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  height: 100%;
  padding: 1rem;
}

.homework-info {
  display: flex;
  flex-direction: column;
}

.institutions-wrapper {
  width: 100%;
  display: flex;
  overflow-wrap: anywhere;
  align-items: flex-start;
  flex-flow: column;
}

.institutions-column {
  text-align: center;
  width: 100%;
}

.institution-item {
  border: 1px solid var(--border-color);
  background-color: var(--background-color);
  border-radius: 0.75rem;
  width: 100%;
  margin-bottom: var(--default-layout-margin);
}

.institution-item-title {
  display: inline-flex;
}

.filter label {
  font-size: 11pt;
}

@media (min-width: 641px) {
  .institutions-wrapper {
    flex-flow: row;
  }
}

.institution-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.description {
  text-align: start;
}
</style>
