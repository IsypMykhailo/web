<script>
import ProfileDropdown from "../components/controls/ProfileDropdown.vue";
import ThemeSwitcher from "../components/controls/ThemeSwitcher.vue";
import {useCurrentInstitutionStore} from "../stores/current-institution";
import Translation from "../i18n/translation";
import {storeToRefs} from "pinia/dist/pinia";
import LanguageSwitcher from "../components/controls/LanguageSwitcher.vue";
import InstitutionIcon from "../components/icons/InstitutionIcon.vue";
import createSocket from "../utils/socket";
import {useAuthStore} from "../stores/auth";
import {webSocketUrl} from "../configs/notification-service";
import {fromNow} from "../utils/date-helper";
import {useNotificationsStore} from "../stores/notifications";
import Logo from "../components/Logo.vue";

export default {
  components: {Logo, InstitutionIcon, LanguageSwitcher, ThemeSwitcher, ProfileDropdown},
  setup() {
    const currentInstitutionStore = useCurrentInstitutionStore()
    const notificationsStore = useNotificationsStore()

    const { loading, error, institution } = storeToRefs(currentInstitutionStore)
    const { notifications, notificationsLoading, notificationsError } = storeToRefs(notificationsStore)
    const { loadNotifications, addNotification } = notificationsStore

    return { loading, error, institution,
      Translation, fromNow, createSocket,
      notifications, notificationsLoading, notificationsError, loadNotifications, addNotification }
  },
  computed: {
    isOwnerOrAdmin() { return this.institution.role === 0 || this.institution.role === 1 },
    isOwnerOrAdminOrTeacher() { return this.institution.role === 0 || this.institution.role === 1 || this.institution.role === 2 },
    isTeacherOrStudent() { return this.institution.role === 2 || this.institution.role === 3 },
    isTeacher() { return this.institution.role === 2 },
    isStudent() { return this.institution.role === 3 },

    newNotificationsCount() {
      if (this.notifications === null)
        return 0

      let count = 0
      for (const notification of this.notifications) {
        if (notification.viewed === false)
          count++
      }
      return count
    }
  },
  data() {
    return {
      socket: null,
    }
  },
  mounted() {
    const currentInstitutionStore = useCurrentInstitutionStore()

    const { institution } = storeToRefs(currentInstitutionStore)

    if (institution === null || institution.value === null || institution.value.id.toString() !== this.$route.params.id) {
      currentInstitutionStore.loadInstitution(this.$route.params.id)

      if (this.socket !== null)
        this.socket.disconnect()

      const authStore = useAuthStore()
      this.socket = createSocket(webSocketUrl, authStore.jwt, this.$route.params.id)

      this.loadNotifications(this.$route.params.id)

      const addNotification = this.addNotification
      this.socket.on('new notification', function(notification) {
        addNotification(notification)
      })

      this.socket.connect();
    }
  },
  methods: {
    openSidebar() {
      document.getElementById('sidebar').style.width = '100vw';
      document.getElementById('sidebar').style.display = 'flex';
    },
    closeSidebar() {
      document.getElementById('sidebar').style.display = 'none';
    },
    viewNotification(notificationId) {
      if (this.socket !== null) {
        this.socket.emit('view notification', notificationId)

        for (const notification of this.notifications) {
          if (notification.id === notificationId) {
            notification.viewed = true
            break
          }
        }
      }
    },
    viewAllNotifications() {
      if (this.socket !== null) {
        this.socket.emit('view all notifications')

        for (const notification of this.notifications) {
          notification.viewed = true
        }
      }
    }
  }
}
</script>

<template>

  <div class="center-screen" :class="{'hidden': !this.loading}">
    <div class="spinner"></div>
  </div>

  <div v-if="this.error" class="center-screen">
    <div class="error-alert">{{ this.error }}</div>
  </div>

  <div v-else-if="this.institution !== null">
    <aside ref="sidebar" id="sidebar" class="flex-column flex-shrink-0">
      <div class="sidebar-title">
        <RouterLink :to="Translation.i18nRoute({ name: 'home' })" class="link-dark text-decoration-none">
<!--          <h1>{{ $t('gribble-name') }}</h1>-->
          <Logo class="logo" />
        </RouterLink>
      </div>

      <ul class="nav nav-pills flex-column p-3 mb-auto">
        <li class="nav-item">
          <RouterLink @click="closeSidebar" exact-active-class="active" :to="Translation.i18nRoute({ name: 'dashboard', params: { id: $route.params.id } })" class="nav-link">
            {{ $t('nav.institution-dashboard') }}
          </RouterLink>
        </li>
        <li class="nav-item">
          <RouterLink @click="closeSidebar" exact-active-class="active" :to="Translation.i18nRoute({ name: 'institution bell schedules', params: { id: $route.params.id } })" class="nav-link">
            {{ $t('nav.institution-bell-schedules') }}
          </RouterLink>
        </li>
        <li class="nav-item">
          <RouterLink @click="closeSidebar" exact-active-class="active" :to="Translation.i18nRoute({ name: 'institution lesson schedules', params: { id: $route.params.id } })" class="nav-link">
            {{ $t('nav.institution-lessons-schedules') }}
          </RouterLink>
        </li>
        <li v-if="isOwnerOrAdmin" class="nav-item">
          <RouterLink @click="closeSidebar" exact-active-class="active" :to="Translation.i18nRoute({ name: 'institution subjects', params: { id: $route.params.id } })" class="nav-link">
            {{ $t('nav.institution-subjects') }}
          </RouterLink>
        </li>
        <li v-if="isOwnerOrAdminOrTeacher" class="nav-item">
          <RouterLink @click="closeSidebar" exact-active-class="active" :to="Translation.i18nRoute({ name: 'institution groups', params: { id: $route.params.id } })" class="nav-link">
            {{ $t('nav.institution-groups') }}
          </RouterLink>
        </li>
        <li v-if="isTeacherOrStudent" class="nav-item">
          <RouterLink @click="closeSidebar" exact-active-class="active" :to="Translation.i18nRoute({ name: 'institution homeworks', params: { id: $route.params.id } })" class="nav-link">
            {{ $t('nav.institution-homeworks') }}
          </RouterLink>
        </li>
        <li v-if="isStudent" class="nav-item">
          <RouterLink @click="closeSidebar" exact-active-class="active" :to="Translation.i18nRoute({ name: 'institution grades', params: { id: $route.params.id } })" class="nav-link">
            {{ $t('nav.institution-grades') }}
          </RouterLink>
        </li>
        <li v-if="isOwnerOrAdminOrTeacher" class="nav-item">
          <RouterLink @click="closeSidebar" exact-active-class="active" :to="Translation.i18nRoute({ name: 'institution grades journals', params: { id: $route.params.id } })" class="nav-link">
            {{ $t('nav.institution-grades-journal') }}
          </RouterLink>
        </li>
        <li v-if="isOwnerOrAdmin" class="nav-item">
          <RouterLink @click="closeSidebar" exact-active-class="active" :to="Translation.i18nRoute({ name: 'institution settings', params: { id: $route.params.id } })" class="nav-link">
            {{ $t('nav.institution-settings') }}
          </RouterLink>
        </li>
      </ul>

      <ul class="nav nav-pills flex-row p-3 align-items-center mb-1 justify-content-evenly mobile-only">
        <li class="nav-item bottom-nav-item">
          <RouterLink :to="Translation.i18nRoute({ name: 'home' })" class="nav-link bottom-nav-link">
            <svg class="ico nav-ico" viewBox="0 0 1920 1920" xmlns="http://www.w3.org/2000/svg">
              <path d="M960.16 0 28 932.16l79 78.777 853.16-853.16 853.16 853.16 78.889-78.777L960.16 0Zm613.693 1027.34v781.078h-334.86v-557.913h-557.8v557.912H346.445V1027.34H234.751V1920h1450.684v-892.66h-111.582Zm-446.33 334.748v446.441H792.775v-446.441h334.748ZM960.127 692.604c61.593 0 111.582 49.989 111.582 111.582 0 61.594-49.989 111.583-111.582 111.583-61.594 0-111.583-49.99-111.583-111.583 0-61.593 49.99-111.582 111.583-111.582Zm223.165 111.582c0-123.075-100.09-223.165-223.165-223.165-123.076 0-223.165 100.09-223.165 223.165 0 123.076 100.09 223.165 223.165 223.165 123.075 0 223.165-100.09 223.165-223.165" fill-rule="evenodd"/>
            </svg>
            {{ $t('nav.home') }}
          </RouterLink>
        </li>
        <li class="nav-item bottom-nav-item">
          <RouterLink :to="Translation.i18nRoute({ name: 'list of institutions' })" class="nav-link bottom-nav-link">
            <InstitutionIcon class="ico nav-ico"/>
            {{ $t('nav.institutions') }}
          </RouterLink>
        </li>
      </ul>
    </aside>

    <div class="header-container">
      <header class="header">
        <ul class="nav">
          <li class="mobile-only">
            <span class="nav-link px-2">
              <svg id="button-open-menu" @click="openSidebar" class="mt-2 me-2 ico nav-icon nav-ico" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 17H20M4 12H20M4 7H20" stroke="var(--text-color)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
          </li>
          <li>
            <RouterLink class="nav-link link px-2" :to="Translation.i18nRoute({ name: 'home' })">
              <span>{{ $t('nav.home') }}</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink class="nav-link link px-2" :to="Translation.i18nRoute({ name: 'list of institutions' })">
              <span>{{ $t('nav.institutions') }}</span>
            </RouterLink>
          </li>
        </ul>

        <div class="dropdowns">
          <ThemeSwitcher class="px-2" />
          <LanguageSwitcher class="px-2" />

          <div class="dropdown px-2">
            <div class="simplified-button d-block text-decoration-none position-relative" data-bs-toggle="dropdown" aria-expanded="false">
              <svg class="ico nav-ico" viewBox="0 0 512 512" style="fill: none" xmlns="http://www.w3.org/2000/svg"><path d="M427.68,351.43C402,320,383.87,304,383.87,217.35,383.87,138,343.35,109.73,310,96c-4.43-1.82-8.6-6-9.95-10.55C294.2,65.54,277.8,48,256,48S217.79,65.55,212,85.47c-1.35,4.6-5.52,8.71-9.95,10.53-33.39,13.75-73.87,41.92-73.87,121.35C128.13,304,110,320,84.32,351.43,73.68,364.45,83,384,101.61,384H410.49C429,384,438.26,364.39,427.68,351.43Z" style="fill:none;stroke:var(--text-color);stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"/><path d="M320,384v16a64,64,0,0,1-128,0V384" style="fill:none;stroke:var(--text-color);stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"/></svg>
              <span v-if="newNotificationsCount !== 0" class="position-absolute top-0 start-100 translate-middle badge rounded-pill" style="background-color: var(--button-background-color)">
                {{ newNotificationsCount }}
              </span>
            </div>
            <div class="dropdown-menu notifications-dropdown">
              <div class="notifications-header">
                <h4>{{ $t('notifications.title') }}</h4>
                
                <button @click="viewAllNotifications" v-if="newNotificationsCount !== 0" type="button" class="button button-small">{{ $t('buttons.view-all') }}</button>
              </div>

              <div v-if="notificationsLoading === true" class="my-2 mx-3">
                <div class="spinner"></div>
              </div>
              <div v-else-if="notifications === null" class="my-2 mx-3 muted-text">{{ $t('lessons-schedule.view.no-data') }}</div>
              <div v-else-if="notifications.length === 0" class="my-2 mx-3">{{ $t('notifications.no-notification') }}</div>
              <div v-else style="max-height: 30rem; overflow-y: auto">
                <div v-for="notification in notifications">
                  <RouterLink v-if="notification.type === 'Grade'" :to="Translation.i18nRoute({ name: 'institution grades' })" class="notification-container">
                    <div class="notification">
                      <div class="pfp"></div>
                      <div class="notification-info">
                    <span class="notification-message">
                      <strong>$id {{ notification.state.teacherId }}</strong> {{ $t('notifications.grade.main-text') }} <strong>{{ notification.state.grade.points }}</strong>
                    </span>
                        <span class="notification-meta">
                      {{ fromNow(notification.createdAt) }} &#8226; {{ notification.state.subject.name }}
                    </span>
                      </div>
                      <div class="notification-not-viewed">
                        <div v-if="notification.viewed === false" class="notification-not-viewed-indicator"></div>
                      </div>
                    </div>
                  </RouterLink>
                </div>
              </div>
            </div>
          </div>

          <ProfileDropdown class="px-2"/>
        </div>
      </header>
    </div>

    <div class="content-wrapper">
      <div class="content">
        <RouterView />
      </div>
    </div>
  </div>

</template>

<style scoped>
#sidebar .nav-link {
  font-size: 15px;
  font-weight: 600;
}

.nav-item a.active {
  background-color: var(--button-background-color);
}

.nav-item a:not(.active) {
  color: var(--button-background-color);
}

.nav-item a:not(.active):hover {
  color: var(--button-active-background-color);
}

.center-screen {
  background-color: var(--background-second-color);
  border-bottom: 1px solid var(--border-color);
  position: fixed;
  z-index: 99999;
  top: 0;
  transition: all .35s ease-in-out;
}

.center-screen .error-alert {
  min-width: 50vw;
}

.center-screen:is(.hidden) {
  transform: translateY(-100vh);
}

.theme-switcher-container {
  display: flex;
  align-items: center;
}

.header-container {
  height: var(--offset);
  position: fixed;
  z-index: 998;
  display: flex;
  flex-wrap: nowrap;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  background-color: var(--background-color);
  border-bottom: 1px solid var(--border-color);
}

.header {
  --padding: 1rem;
  padding-left: var(--padding);
  padding-right: var(--padding);
  display: flex;
  flex-wrap: wrap;
  align-content: center;
  justify-content: space-between;
}

.sidebar-title {
  height: var(--offset);
  display: flex;
  flex-wrap: wrap;
  align-content: center;
  justify-content: center;
  border-bottom: 1px solid var(--border-color);
}

.dropdowns {
  display: flex;
  flex-wrap: wrap;
  align-content: center;
  justify-content: center;
  align-items: center;
}

.bottom-nav-link {
  color: var(--text-color)!important;
  margin: 0 auto;
}

.bottom-nav-item {
  display: inline-flex;
  flex-basis: min-content;
  text-align: center;
}

.nav-link span {
  display: none;
}

.link {
  display: none;
}

#button-open-menu {
  cursor: pointer;
}

/*noinspection CssInvalidPropertyValue*/
#sidebar {
  background-color: var(--background-color);
  position: fixed;
  z-index: 999;
  height: 100vh;
  max-height: -webkit-fill-available;
  display: none;
  border-right: 1px solid var(--border-color);
}

.content-wrapper {
  width: 100%;
  margin-top: var(--offset);
  margin-left: 0;
  position: absolute;
  height: calc(100% - var(--offset));
}

.content {
  padding: 1rem;
  overflow: auto;
  width: 100%;
  height: 100%;
}


.notifications-count-badge {
  position: relative;
  top: 0;
  right: 0;
  background-color: var(--button-background-color);
  border-radius: 50%;
  aspect-ratio: 1 / 1;
  font-size: 10pt;
  transform: translate(-50%,-50%)!important;
}

.notifications-dropdown {
  border-radius: 1rem;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
  width: 90vw;
}

.notifications-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-content: center;
  padding: 0.5rem 1rem;
  border-bottom: 1px solid var(--border-color);
}

.notification-container {
  display: block;
  text-decoration: none;
  color: var(--text-color);
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: background-color .15s;
}

.notification-container:hover {
  background-color: rgba(0,0,0,0.15);
}

.notification {
  display: flex;
  flex-direction: row;
}

.notification-info {
  display: flex;
  flex-direction: column;
  line-height: 1.25;
}

.notification-meta {
  color: var(--muted-color);
  font-size: 10pt;
}

.notification-not-viewed {
  margin-left: auto;
}

.notification-not-viewed-indicator {
  background-color: var(--button-background-color);
  border-radius: 50%;
  width: 0.65rem;
  height: 0.65rem;
  margin: 0.25rem;
}

.pfp {
  position: relative;
  background-position: center;
  background-size: contain;
  width: 2rem;
  height: 2rem;
  max-width: 2rem;
  max-height: 2rem;
  min-width: 2rem;
  min-height: 2rem;
  border-radius: 50%;
  border: 1px solid var(--border-color);
  margin-right: 0.5rem;
  margin-top: 0.15rem;
}

@media (min-width:641px)  {
  #sidebar {
    display: flex!important;
    width: var(--default-sidebar-width)!important;
  }

  #button-open-menu {
    display: none;
  }

  .content-wrapper {
    margin-left: var(--default-sidebar-width);
    width: calc(100% - var(--default-sidebar-width));
  }

  .header-container {
    padding-left: var(--default-sidebar-width)!important;
  }

  .nav-link span {
    display: initial;
  }

  .link {
    display: block;
  }

  .notifications-dropdown {
    width: 25rem;
  }
}
</style>