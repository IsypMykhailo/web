import {defineStore} from "pinia";

export const useUserThemeStore = defineStore('user-theme', {
    state: () => ({
        userTheme: "",
        userThemeKey: "user-theme",
        darkTheme: "dark-theme",
        lightTheme: "light-theme",
    }),
    actions: {
        setTheme(theme) {
            localStorage.setItem(this.userThemeKey, theme);
            this.userTheme = theme;
            document.documentElement.className = theme;
        },

        toggleTheme() {
            const activeTheme = localStorage.getItem(this.userThemeKey);
            if (activeTheme === this.lightTheme) {
                this.setTheme(this.darkTheme);
            } else {
                this.setTheme(this.lightTheme);
            }
        },

        getMediaPreference() {
            const hasDarkPreference = window.matchMedia(
                "(prefers-color-scheme: dark)"
            ).matches;

            if (hasDarkPreference) {
                return this.darkTheme;
            } else {
                return this.lightTheme;
            }
        },

        getTheme() {
            return localStorage.getItem(this.userThemeKey);
        },
    }
})