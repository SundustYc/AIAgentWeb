<template>
    <div class="sidebar">
        <h2>选择 Agent</h2>
        <div v-for="agent in agents" :key="agent.id" class="agent-button-container">
            <button @click="selectAgent(agent.id)" @contextmenu.prevent="openContextMenu(agent, $event)"
                :class="{ active: selectedAgent === agent.id }">
                {{ agent.name }}
            </button>
        </div>
        <div class="new-agent-section">
            <button @click="showNewAgentForm = true" class="new-agent-button">新建 Agent</button>
        </div>

        <!-- Context Menu -->
        <div v-if="showContextMenu" class="context-menu" :style="contextMenuStyle">
            <button @click="editAgent">编辑 Agent</button>
            <button @click="deleteAgent">删除 Agent</button>
        </div>

        <!-- Edit Agent Form -->
        <div v-if="showEditForm" class="edit-form">
            <h3>编辑 Agent</h3>
            <input v-model="editingAgent.name" placeholder="Agent 名称" />
            <textarea v-model="editingAgent.prompt" placeholder="Agent 提示词" class="resizable"></textarea>
            <div class="button-group">
                <button @click="saveEditedAgent" class="primary-button">保存</button>
                <button @click="cancelEdit" class="secondary-button">取消</button>
            </div>
        </div>

        <!-- New Agent Form -->
        <div v-if="showNewAgentForm" class="edit-form">
            <h3>新建 Agent</h3>
            <input v-model="newAgentName" placeholder="Agent 名称" />
            <textarea v-model="newAgentPrompt" placeholder="Agent 提示词" class="resizable"></textarea>
            <div class="button-group">
                <button @click="createNewAgent" class="primary-button">创建</button>
                <button @click="cancelNewAgent" class="secondary-button">取消</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAgentStore } from '../store/agentStore';

const emit = defineEmits(['change-agent']);
const store = useAgentStore();

const agents = computed(() => store.agents);
const selectedAgent = computed(() => store.currentAgentId);

const showNewAgentForm = ref(false);
const newAgentName = ref('');
const newAgentPrompt = ref('');

const showContextMenu = ref(false);
const contextMenuStyle = ref({});
const showEditForm = ref(false);
const editingAgent = ref({});

function selectAgent(agentId) {
    store.setCurrentAgent(agentId);
    emit('change-agent', agentId);
}

function createNewAgent() {
    if (newAgentName.value && newAgentPrompt.value) {
        const id = `custom_${Date.now()}`;
        store.addAgent(id, newAgentName.value, newAgentPrompt.value);
        selectAgent(id);
        cancelNewAgent();
    }
}

function cancelNewAgent() {
    showNewAgentForm.value = false;
    newAgentName.value = '';
    newAgentPrompt.value = '';
}

function openContextMenu(agent, event) {
    editingAgent.value = { ...agent };
    showContextMenu.value = true;
    contextMenuStyle.value = {
        position: 'absolute',
        top: `${event.clientY}px`,
        left: `${event.clientX}px`
    };
    event.preventDefault();
}

function editAgent() {
    showContextMenu.value = false;
    showEditForm.value = true;
}

function deleteAgent() {
    if (confirm(`确定要删除 Agent "${editingAgent.value.name}" 吗？`)) {
        store.removeAgent(editingAgent.value.id);
        showContextMenu.value = false;
    }
}

function saveEditedAgent() {
    if (editingAgent.value.name && editingAgent.value.prompt) {
        store.updateAgent(editingAgent.value.id, editingAgent.value.name, editingAgent.value.prompt);
        showEditForm.value = false;
    }
}

function cancelEdit() {
    showEditForm.value = false;
}

// Close context menu when clicking outside
document.addEventListener('click', () => {
    showContextMenu.value = false;
});
</script>

<style scoped>
.sidebar {
    width: 18%;
    background-color: #f8f9fa;
    padding: 20px;
    border-right: 1px solid #dee2e6;
    display: flex;
    flex-direction: column;
    position: relative;
}

h2 {
    margin-bottom: 20px;
}

.agent-button-container {
    margin-bottom: 10px;
}

button {
    display: block;
    width: 100%;
    padding: 10px;
    background-color: #e9ecef;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    text-align: center;
}

button.active {
    background-color: #007bff;
    color: white;
}

.new-agent-section {
    margin-top: auto;
}

.new-agent-button {
    background-color: #28a745;
    color: white;
}

.context-menu {
    position: fixed;
    background: white;
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 5px 0;
    z-index: 1000;
}

.context-menu button {
    display: block;
    width: 100%;
    padding: 5px 20px;
    text-align: left;
    background: none;
    border: none;
    cursor: pointer;
}

.context-menu button:hover {
    background-color: #f1f3f5;
}

.edit-form {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    z-index: 1001;
}

input,
textarea {
    width: 100%;
    margin-bottom: 10px;
    padding: 5px;
    border: 1px solid #ced4da;
    border-radius: 4px;
}

textarea.resizable {
    resize: both;
    min-height: 100px;
}

.button-group {
    display: flex;
    justify-content: flex-end;
    margin-top: 10px;
}

.primary-button {
    background-color: #007bff;
    color: white;
}

.secondary-button {
    background-color: #6c757d;
    color: white;
    margin-left: 10px;
}
</style>