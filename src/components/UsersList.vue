<script>
import AddIcon from "./icons/AddIcon.vue";
import RemoveIcon from "./icons/RemoveIcon.vue";
export default {
  name: "UsersList",
  components: {RemoveIcon, AddIcon},
  props: {
    users: Array,
    isLoading: {
      type: Boolean,
      default: false
    },
    isAddingNewUser: {
      type: Boolean,
      default: false
    },
    removingUserId: String,
    error: String,
    onAddButtonClick: Function,
    onDeleteButtonClick: Function
  }
}
</script>

<template>
  <div v-if="error" class="error-alert">{{ this.error }}</div>
  <div class="users-list-container">
    <div v-if="isLoading === true" class="spinner"></div>
    <div v-else-if="users !== null && users !== undefined" class="users-list">
      <div v-if="users.length === 0" class="user-card">{{ $t('users-list.no-users') }}</div>
      <div v-else v-for="user in this.users" class="user-card">
        <div class="pfp" :style="'background-image: ' + user.avatarUrl"></div>
        <span class="username">$id: {{ user.id }}</span>
        <div v-if="removingUserId === user.id" class="control-panel">
          <div class="spinner"></div>
        </div>
        <div v-else class="control-panel">
          <div @click="onDeleteButtonClick(user.id)" class="simplified-button">
            <RemoveIcon class="ico" />
          </div>
        </div>
      </div>
    </div>

    <div class="add-user-container">
      <div v-if="isAddingNewUser === true" class="spinner"></div>
      <div v-else @click="onAddButtonClick" class="simplified-button">
        <AddIcon class="ico" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.spinner {
  display: inline-flex;
  width: 1.5rem;
  height: 1.5rem;
  margin: 0.3rem;
}

.error-alert {
  margin-top: 1rem;
  margin-bottom: 1rem;
}

.users-list-container {
  min-height: 2rem;
  padding: 0.375rem 0.75rem;
  color: var(--text-color);
  background-color: var(--background-second-color);
  border: 1px solid var(--border-color);
  border-radius: 0.555rem;
}

.users-list {
  /*overflow-y: auto;
  max-height: 55rem;*/
}

.users-list .user-card {
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
  display: flex;
  flex-direction: row;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
}

.user-card .pfp {
  --pfp-radius: 2rem;
  width: var(--pfp-radius);
  height: var(--pfp-radius);
  max-width: var(--pfp-radius);
  max-height: var(--pfp-radius);
  min-width: var(--pfp-radius);
  min-height: var(--pfp-radius);
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
  margin: 0.05rem 1rem 0.05rem 0.05rem;
  border: 1px solid var(--border-color);
  border-radius: 50%;
}

.user-card .username {
  margin-right: 1rem;
  width: 100%;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-card .control-panel {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.add-user-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 0.375rem;
}

.simplified-button {
  cursor: pointer;
}
</style>