import { createRouter, createWebHistory, RouterView } from 'vue-router'
import HomeView from '../views/home/HomeView.vue'
import Translation from "../i18n/translation";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/:locale?',
      component: RouterView,
      beforeEnter: Translation.routeMiddleware,
      children: [
        {
          path: '',
          name: 'home',
          component: HomeView
        },
        {
          path: 'terms-and-conditions',
          name: 'terms and conditions',
          component: HomeView
        },
        {
          path: 'auth/sign-in',
          name: 'sign in',
          component: () => import('../views/auth/SignInView.vue')
        },
        {
          path: 'my-profile',
          name: 'my profile',
          component: () => import('../views/user/MyProfileView.vue')
        },
        {
          path: 'confirm-account',
          name: 'confirm account',
          component: () => import('../views/auth/EmailConfirmView.vue')
        },
        {
          path: 'auth/sign-up',
          name: 'sign up',
          component: () => import('../views/auth/SignUpView.vue')
        },
        {
          path: 'institutions/all',
          name: 'list of institutions',
          component: () => import('../views/default/ListOfInstitutionsView.vue')
        },
        {
          path: 'institutions/create',
          name: 'create institution',
          component: () => import('../views/institution/CreateInstitutionView.vue')
        },
        {
          path: 'institutions/:id',
          name: 'institution',
          component: () => import('../layouts/InstitutionLayout.vue'),
          children: [
            {
              path: '',
              name: 'dashboard',
              component: () => import('../views/institution/InstitutionDashboardView.vue')
            },
            {
              path: 'settings',
              name: 'institution settings',
              component: () => import('../views/institution/InstitutionSettingsView.vue')
            },
            {
              path: 'bell-schedules',
              name: 'institution bell schedules',
              component: () => import('../views/institution/bell-schedule/InstitutionBellSchedulesView.vue')
            },
            {
              path: 'bell-schedules/create',
              name: 'create institution bell schedule',
              component: () => import('../views/institution/bell-schedule/CreateBellScheduleView.vue')
            },
            {
              path: 'bell-schedules/:bellScheduleId/edit/',
              name: 'edit institution bell schedule',
              component: () => import('../views/institution/bell-schedule/EditBellScheduleView.vue')
            },
            {
              path: 'subjects',
              name: 'institution subjects',
              component: () => import('../views/institution/subjects/InstitutionSubjectsView.vue')
            },
            {
              path: 'subjects/create',
              name: 'create institution subject',
              component: () => import('../views/institution/subjects/CreateSubjectView.vue')
            },
            {
              path: 'subjects/:subjectId/edit',
              name: 'edit institution subject',
              component: () => import('../views/institution/subjects/EditSubjectView.vue')
            },
            {
              path: 'groups',
              name: 'institution groups',
              component: () => import('../views/institution/groups/InstitutionGroupsView.vue')
            },
            {
              path: 'groups/create',
              name: 'create institution group',
              component: () => import('../views/institution/groups/CreateGroupView.vue')
            },
            {
              path: 'groups/:groupId/edit/',
              name: 'edit institution group',
              component: () => import('../views/institution/groups/EditGroupView.vue')
            },
            {
              path: 'groups/:groupId/sub-groups',
              name: 'institution sub groups',
              component: () => import('../views/institution/sub-groups/InstitutionSubGroupsView.vue')
            },
            {
              path: 'groups/:groupId/sub-groups/:subGroupId/edit',
              name: 'edit institution sub group',
              component: () => import('../views/institution/sub-groups/EditSubGroupView.vue')
            },
            {
              path: 'groups/:groupId/sub-groups/create',
              name: 'create institution sub group',
              component: () => import('../views/institution/sub-groups/CreateSubGroupView.vue')
            },
            {
              path: 'journals',
              name: 'institution grades journals',
              component: () => import('../views/institution/grades/ListOfGradesJournalsView.vue')
            },
            {
              path: 'journals/create',
              name: 'create institution grades journal',
              component: () => import('../views/institution/grades/CreateGradesJournalView.vue')
            },
            {
              path: 'journals/:journalId/edit',
              name: 'edit institution grades journal',
              component: () => import('../views/institution/grades/EditGradesJournalView.vue')
            },
            {
              path: 'journals/:journalId',
              name: 'institution grades journal',
              component: () => import('../views/institution/grades/GradesJournalView.vue')
            },
            {
              path: 'journals/:journalId/columns/create',
              name: 'create institution journal column',
              component: () => import('../views/institution/grades/CreateJournalColumnView.vue')
            },
            {
              path: 'journals/:journalId/columns/:columnId/edit',
              name: 'edit institution journal column',
              component: () => import('../views/institution/grades/EditJournalColumnView.vue')
            },
            {
              path: 'grades',
              name: 'institution grades',
              component: () => import('../views/institution/grades/StudentGradesView.vue')
            },
            {
              path: 'homeworks',
              name: 'institution homeworks',
              component: () => import('../views/institution/homeworks/InstitutionHomeworksView.vue')
            },
            {
              path: 'homeworks/:homeworkId',
              name: 'institution homework',
              component: () => import('../views/institution/homeworks/InstitutionHomeworkView.vue')
            },
            {
              path: 'homeworks/create',
              name: 'create institution homework',
              component: () => import('../views/institution/homeworks/CreateHomeworkView.vue')
            },
            {
              path: 'homeworks/:homeworkId/edit',
              name: 'edit institution homework',
              component: () => import('../views/institution/homeworks/EditHomeworkView.vue')
            },
            {
              path: 'homeworks/:homeworkId/items',
              name: 'institution homeworkItems',
              component: () => import('../views/institution/homeworkItems/InstitutionHomeworkItemsView.vue')
            },
            {
              path: 'homeworks/:homeworkId/items/:studentId',
              name: 'institution homeworkItem',
              component: () => import('../views/institution/homeworkItems/InstitutionHomeworkItemView.vue')
            },
            {
              path: 'homeworks/:homeworkId/my-homework',
              name: 'institution myHomeworkItem',
              component: () => import('../views/institution/homeworkItems/InstitutionHomeworkItemView.vue')
            },
            {
              path: 'homeworks/:homeworkId/items/create',
              name: 'create institution homeworkItem',
              component: () => import('../views/institution/homeworkItems/CreateHomeworkItemView.vue')
            },
            {
              path: 'homeworks/:homeworkId/items/:homeworkItemId/edit',
              name: 'edit institution homeworkItem',
              component: () => import('../views/institution/homeworkItems/EditHomeworkItemView.vue')
            },
            {
              path: 'lesson-schedules',
              name: 'institution lesson schedules',
              component: () => import('../views/institution/lessons-schedule/InstitutionLessonsSchedulesView.vue')
            },
            {
              path: 'teacher-lessons',
              name: 'institution teacher lessons',
              component: () => import('../views/institution/lessons-schedule/InstitutionTeacherLessonsView.vue')
            },
            {
              path: 'groups/:groupId/lesson-schedules/create',
              name: 'create institution lesson schedule',
              component: () => import('../views/institution/lessons-schedule/CreateLessonsScheduleView.vue')
            },
            {
              path: 'lessons/:lessonId/attendance',
              name: 'institution lesson attendance',
              component: () => import('../views/institution/attendance/AttendanceView.vue')
            }
          ]
        },
        {
          path: ':pathMatch(.*)*',
          name: 'not found',
          component: () => import('../views/NotFoundView.vue')
        }
      ]
    }
  ]
})

export default router
