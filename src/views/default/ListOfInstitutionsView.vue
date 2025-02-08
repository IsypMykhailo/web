<script>
import DefaultLayout from '../../layouts/DefaultLayout.vue'
import {useInstitutionsStore} from "../../stores/institutions";
import Translation from "../../i18n/translation";
import {storeToRefs} from "pinia";
import InstitutionIcon from "../../components/icons/InstitutionIcon.vue";
export default {
  components: {InstitutionIcon, DefaultLayout},
  setup() {
    const institutionsStore = useInstitutionsStore()

    const { loading, error, institutions } = storeToRefs(institutionsStore)
    //const { loadInstitutions } = institutionsStore

    return { loading, error, institutions, Translation }
  },
  data() {
    return {
      filters: []
    }
  },
  computed: {
    filteredInstitutions() {
      if (this.filters.length === 0)
        return this.institutions

      return this.institutions.filter(e => this.filters.includes(e.role.toString()))
    }
  },
  mounted() {
    const institutionsStore = useInstitutionsStore()

    institutionsStore.loadInstitutions()
  },
  beforeRouteLeave(from, to, next) {
    const institutionStore = useInstitutionsStore()
    const { clearErrors } = institutionStore
    clearErrors()
    next()
  },
}
</script>

<template>
  <DefaultLayout>
    <div class="container">
      <div class="institutions-wrapper">
        <div class="filters-column">

          <div class="filters-container">
            <span class="filter-title">{{ $t('filter-titles.institution-role') }}</span>
            <div class="filters">
              <div class="filter form-check form-switch">
                <input v-model="filters" value="0" class="form-check-input" type="checkbox" role="switch" id="ownerSwitch">
                <label class="form-check-label" for="ownerSwitch">{{ $t('user-roles.owner') }}</label>
              </div>
              <div class="filter form-check form-switch">
                <input v-model="filters" value="1" class="form-check-input" type="checkbox" role="switch" id="adminSwitch">
                <label class="form-check-label" for="adminSwitch">{{ $t('user-roles.admin') }}</label>
              </div>
              <div class="filter form-check form-switch">
                <input v-model="filters" value="2" class="form-check-input" type="checkbox" role="switch" id="teacherSwitch">
                <label class="form-check-label" for="teacherSwitch">{{ $t('user-roles.teacher') }}</label>
              </div>
              <div class="filter form-check form-switch">
                <input v-model="filters" value="3" class="form-check-input" type="checkbox" role="switch" id="studentSwitch">
                <label class="form-check-label" for="studentSwitch">{{ $t('user-roles.student') }}</label>
              </div>
            </div>
          </div>

          <div class="filters-container">
            <span class="filter-title">{{$t('filter-titles.sort-by')}}</span>
            <div class="filters">
              ...
            </div>
          </div>

          <RouterLink :to="Translation.i18nRoute({ name: 'create institution' })" class="button create-institution-button">
            {{ $t('institution.create') }}
          </RouterLink>

        </div>

        <div class="institutions-column">
          <div v-if="this.loading === true" class="spinner"></div>
          <div v-else-if="this.error !== null" class="error-alert">{{this.error}}</div>
          <ul v-else-if="this.institutions != null" class="institution-list">
            <li v-for="institution in this.filteredInstitutions" class="institution-item">
              <RouterLink class="text-decoration-none" :to="Translation.i18nRoute({ name: 'dashboard', params: { id: institution.id} })">
                <div class="institution-item-title">
                  <InstitutionIcon />
                  <h3>{{ institution.name }}</h3>
                </div>
                <span v-if="institution.description != null && institution.description !== ''" class="muted-text description"><strong>{{ $t('institution.description') }}:</strong> {{ institution.description }}</span>
              </RouterLink>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>

<style scoped>
.spinner {
  margin-top: 2rem;
}

.error-alert {
  border-radius: 0.75rem;
}


.create-institution-button {
  display: flex;
  align-items: center;
  justify-content: center;
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

.filters-column {
  padding: 1rem;
}

.filters-column, .institution-item {
  /*border: 1px solid var(--border-color);*/
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
  background-color: var(--background-color);
  border-radius: 0.75rem;
  width: 100%;
  margin-bottom: var(--default-layout-margin);
}

.institution-item-title {
  display: inline-flex;
}

.filters-container {
  padding-bottom: 0.75rem;
}

.filter-title {
  font-weight: 600;
  font-size: large;
  margin-bottom: 2rem;
}

.filters {
  padding-left: 0.5rem;
}

.filter label {
  font-size: 11pt;
}

@media (min-width:641px)  {
  .institutions-wrapper {
    flex-flow: row;
  }

  .filters-column {
    margin-right: var(--default-layout-margin);
    min-width: 12rem;
    width: 23vw;
    max-width: 26.5rem;
  }
}

.institution-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.institution-item {
  display: flex;
  text-decoration: none!important;
}

.institution-item svg {
  fill: var(--text-color);
  width: 2rem;
  height: 2rem;
  margin-right: 1rem;
}

.institution-item a {
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 1rem;
}

.description {
  text-align: start;
}
</style>