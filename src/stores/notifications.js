import {defineStore} from "pinia";
import {combineUrl} from "../utils/url-helper";
import {schedulerServiceUrlV1} from "../configs/scheduler-service";
import {useAuthStore} from "./auth";
import i18n from "../i18n/index"
import {notificationServiceUrl} from "../configs/notification-service";

export const useNotificationsStore = defineStore('notifications', {
    state: () => ({
        notifications: null,
        notificationsLoading: false,
        notificationsError: null,
    }),
    actions: {
        loadNotifications(institutionId) {
            this.$reset()

            this.notificationsLoading = true

            fetch(combineUrl(notificationServiceUrl, `notifications/${institutionId}`), {
                method: 'GET',
                headers: {
                    'Authorization': useAuthStore().jwt,
                    'Content-Type': 'application/json'
                }
            })
                .then(res => {
                    this.notificationsLoading = false

                    if (res === null || res === undefined || res.status === 500)
                    {
                        this.notificationsError = i18n.global.t('errors.internal-error')
                    }
                    else if (res.status === 200) {
                        return res.json()
                    }
                    else if (res.status === 401) {
                        this.notificationsError = i18n.global.t('errors.no-authentication')
                    }
                    else if (res.status === 404) {
                        this.notificationsError = i18n.global.t('errors.not-found.institution')
                    }
                })
                .then(json => {
                    if (json === null || json === undefined)
                        return;

                    if (json.data === null) {
                        this.notificationsError = i18n.global.t('errors.internal-error')
                        return
                    }

                    this.notifications = json.data
                })
                .catch(() => {
                    this.notificationsLoading = false
                    this.notificationsError = i18n.global.t('errors.no-connection')
                })
        },
        addNotification(notification) {
            if (this.notifications !== null) {
                const existingNotification = this.notifications.find(e => e.id === notification.id)

                if (existingNotification !== undefined && existingNotification !== null)
                    return

                notification.viewed = false
                this.notifications.unshift(notification)
            }
        },

    }
})