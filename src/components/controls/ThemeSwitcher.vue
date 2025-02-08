<script>
import {useUserThemeStore} from "../../stores/user-theme";
import {storeToRefs} from "pinia/dist/pinia";

export default {
  name: "ThemeSwitcher",
  setup() {
    const userThemeStore = useUserThemeStore()

    const { userTheme, lightTheme } = storeToRefs(userThemeStore)
    const { toggleTheme } = userThemeStore

    return { userTheme, lightTheme, toggleTheme }
  }
}
</script>

<template>
  <div class="theme-switcher-container">
    <input v-on:input="this.toggleTheme" class="theme-switcher" type="checkbox" :checked="this.userTheme === this.lightTheme">
  </div>
</template>

<style scoped>
/*.theme-switcher-container {
  display: flex;
  justify-content: flex-end;
}*/

.theme-switcher {
  --switcher-width: 3.5rem;
  --switcher-height: calc(var(--switcher-width) / 2);
  appearance: none;
  width: var(--switcher-width);
  height: var(--switcher-height);
  position: relative;
  border-radius: 2rem;
  outline: none;
  border: none;
  cursor: pointer;
  background-color: var(--background-accent-color);
  transition: background-color ease 0.3s;
}

.theme-switcher:before {
  --switch-padding: 0.45rem;
  --switch-radius: 1.2rem;
  position: relative;
  content: "";
  background-image: url('/moon.svg');
  top: calc((var(--switcher-height) - var(--switch-radius)) / 2);
  bottom: calc((var(--switcher-height) - var(--switch-radius)) / 2);
  display: block;
  left: var(--switch-padding);
  width: var(--switch-radius);
  height: var(--switch-radius);
  background-color: var(--background-color);
  background-position: center;
  background-repeat: no-repeat;
  background-size: 80%;
  border-radius: 50%;
  /*outline: 2px solid var(--background-second-color);
  padding: 5px;*/
  overflow: hidden;
  transition: all cubic-bezier(0.3, 1.5, 0.7, 1) 0.3s;
}

.theme-switcher:checked:before {
  left: calc(var(--switcher-width) - var(--switch-radius) - var(--switch-padding));
  background-image: url('/sun.svg');
}
</style>