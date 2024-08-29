<template>
  <div class="app-container">
    <Sidebar @change-agent="changeAgent" />
    <ChatComponent :current-agent="currentAgent" />
  </div>
</template>

<script setup>

import { computed } from 'vue';
import { useAgentStore } from './store/agentStore';
import Sidebar from './components/Sidebar.vue';
import ChatComponent from './components/ChatComponent.vue';

const store = useAgentStore();
const currentAgent = computed(() => store.currentAgentId);

const changeAgent = (agent) => {
  store.setCurrentAgent(agent);
};
</script>

<style>
html,
body,
#app {
  height: 100%;
  margin: 0;
  padding: 0;
}

.app-container {
  display: flex;
  height: 100vh;
}
</style>