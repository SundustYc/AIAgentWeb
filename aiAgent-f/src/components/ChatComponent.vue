<template>
  <div class="chat-container">
    <div class="model-indicator">
      当前模型: {{ currentAgentName }}
      <div v-if="isLoading" class="loading-spinner"></div>
    </div>
    <div class="messages" ref="messagesContainer">
      <div v-for="message in messages" :key="message.id" class="message" :class="message.role">
        <div v-if="message.name" class="message-name">{{ message.name }}</div>
        <div class="message-content" v-html="renderMarkdown(message.content)"></div>
      </div>
    </div>
    <div class="input-container">
      <textarea v-model="userMessage" placeholder="请输入消息..." @keydown.enter.prevent="sendMessage"
        ref="messageInput"></textarea>
      <div class="button-container">
        <button @click="sendMessage" class="send-button">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
            <path
              d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
          </svg>
        </button>
        <button @click="clearMemory" class="clear-button">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
            <path fill-rule="evenodd"
              d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z"
              clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
    <component :is="currentAgentComponent" v-if="currentAgent" :messages="messages"></component>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick, transformVNodeArgs } from 'vue';
import { useChat } from '../composables/useChat';
import MindMapAgent from './MindMapAgent.vue';
import { useAgentStore } from '../store/agentStore';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import PromptCreateGuideAgent from './PromptCreateGuideAgent.vue';
import MermaidAgent from './MermaidAgent.vue';

const store = useAgentStore();
const currentAgent = computed(() => store.currentAgentId);
const currentAgentName = computed(() => {
  const agent = store.agents.find(a => a.id === currentAgent.value);
  return agent ? agent.name : '未选择';
});

const { messages, userMessage, isLoading, sendMessage, clearMemory } = useChat();

const messageInput = ref(null);
const messagesContainer = ref(null);

const currentAgentComponent = computed(() => {
  switch (currentAgent.value) {
    case 'mindmap':
      return MindMapAgent;
    case 'prompt_create_guide':
      return PromptCreateGuideAgent;
    case 'mermaid':
      return MermaidAgent;
    default:
      return null;
  }
});

function renderMarkdown(content) {
  marked.setOptions({
    breaks: true,
    gfm: true,
    highlight: function (code, lang) {
      return code;
    }
  });
  const rawHtml = marked(content);
  return DOMPurify.sanitize(rawHtml);
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
}

watch(messages, () => {
  scrollToBottom();
});

onMounted(() => {
  if (messageInput.value) {
    messageInput.value.style.height = 'auto';
    messageInput.value.style.height = messageInput.value.scrollHeight + 'px';
  }
  scrollToBottom();
});
</script>

<style scoped>
.chat-container {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  width: 82%;
  height: 100%;
  background-color: #f4f7f9;
  border: 1px solid #ccc;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 10px;
  box-sizing: border-box;
}

.model-indicator {
  padding: 10px;
  background-color: #e9ecef;
  border-radius: 5px;
  margin-bottom: 10px;
  font-weight: bold;
  display: flex;
  align-items: center;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  margin-left: 10px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.messages {
  flex-grow: 1;
  overflow-y: auto;
  padding: 10px;
  background-color: #ffffff;
  border-radius: 10px;
  margin-bottom: 10px;
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.1);
}

.message {
  display: flex;
  flex-direction: column;
  margin: 10px 0;
  max-width: 100%;
}

.message-content {
  width: fit-content;
  max-width: 70%;
  padding: 10px;
  border-radius: 18px;
  font-size: 14px;
  line-height: 1.5;
  word-wrap: break-word;
}

.message-content :deep(p) {
  margin: 0;
  padding: 0;
}

.message-content :deep(* + p) {
  margin-top: 0.5em;
}

.message-content :deep(pre) {
  margin: 0.5em 0;
}

.message-content :deep(ul),
.message-content :deep(ol) {
  margin: 0.5em 0;
  padding-left: 1.5em;
}

.message-content :deep(li + li) {
  margin-top: 0.25em;
}

.message-content :deep(h1),
.message-content :deep(h2),
.message-content :deep(h3),
.message-content :deep(h4),
.message-content :deep(h5),
.message-content :deep(h6) {
  margin-top: 0.1em;
  margin-bottom: 0.2em;
}

.user {
  align-self: flex-end;
  align-items: flex-end;
}

.assistant {
  align-self: flex-start;
}


.user .message-content {
  background-color: #007bff;
  color: white;
}

.assistant .message-content {
  background-color: #e9ecef;
  color: black;
}

.message-name {
  font-size: 12px;
  font-weight: bold;
  margin-bottom: 4px;
  color: #555;
}

.user .message-name {
  text-align: right;
  width: 100%;
}

.assistant .message-name {
  align-self: flex-start;
}

.input-container {
  display: flex;
  margin-bottom: 10px;
  position: relative;
}

textarea {
  flex-grow: 1;
  padding: 10px 40px 10px 10px;
  border-radius: 5px;
  border: 1px solid #ced4da;
  resize: none;
  overflow-y: hidden;
  min-height: 40px;
  max-height: 200px;
}

.button-container {
  position: absolute;
  right: 5px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
}

.send-button,
.clear-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.send-button svg,
.clear-button svg {
  width: 20px;
  height: 20px;
  color: #007bff;
}

.clear-button svg {
  color: #dc3545;
}

:deep(pre) {
  background-color: #1e1e1e;
  color: #d4d4d4;
  padding: 0.5em;
  border-radius: 5px;
  overflow-x: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
  margin: 0.5em 0;
}

:deep(code) {
  font-family: 'Courier New', Courier, monospace;
}
</style>