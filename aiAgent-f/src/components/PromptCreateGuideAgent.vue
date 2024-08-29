<template>
    <div>
        <FloatingBall ref="floatingBall" :expanded="showPromptGuide" @toggle="togglePromptGuide"
            @contextmenu="handleContextMenu" />

        <FloatingWindow v-if="showPromptGuide">
            <textarea v-model="extractedMarkdown" class="markdown-textarea"></textarea>
        </FloatingWindow>

        <!-- Context menu -->
        <transition name="fade">
            <div v-if="showContextMenu" class="context-menu" :style="contextMenuStyle">
                <button @click="createAgentFromMarkdown">创建 Agent</button>
            </div>
        </transition>
    </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import FloatingBall from './FloatingBall.vue';
import FloatingWindow from './FloatingWindow.vue';
import { useAgentStore } from '../store/agentStore';

const props = defineProps({
    messages: {
        type: Array,
        default: () => []
    }
});

const showPromptGuide = ref(false);
const extractedMarkdown = ref('');
const showContextMenu = ref(false);
const contextMenuStyle = ref({ top: '0px', left: '0px' });
const store = useAgentStore();
const floatingBall = ref(null);

const togglePromptGuide = () => {
    showPromptGuide.value = !showPromptGuide.value;
};

const handleContextMenu = (event) => {
    if (showPromptGuide.value) {
        openContextMenu(event);
    } else {
        event.preventDefault();
    }
};

const openContextMenu = (event) => {
    event.preventDefault();
    const ballRect = floatingBall.value.$el.getBoundingClientRect();
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    let left = event.clientX;
    let top = event.clientY;
    if (left + 200 > screenWidth) {
        left = screenWidth - 210;
    }
    if (top + 150 > screenHeight) {
        top = screenHeight - 160;
    }
    contextMenuStyle.value = {
        top: `${top}px`,
        left: `${left}px`
    };
    showContextMenu.value = true;
};

const createAgentFromMarkdown = () => {
    if (extractedMarkdown.value) {
        const id = `custom_${Date.now()}`;
        const name = `Agent ${store.agents.length + 1}`;
        store.addAgent(id, name, extractedMarkdown.value);
        showContextMenu.value = false;
    }
};

const extractMarkdownFromMessages = (messages) => {
    const markdownBlocks = [];
    messages.forEach(message => {
        const matches = message.content.match(/```markdown([\s\S]*?)```/g);
        if (matches) {
            matches.forEach(match => {
                const cleanMatch = match.replace(/```markdown|\n```/g, '').trim();
                markdownBlocks.push(cleanMatch);
            });
        }
    });
    return markdownBlocks.join('\n\n');
};

watch(() => props.messages, (newMessages) => {
    extractedMarkdown.value = extractMarkdownFromMessages(newMessages);
}, { deep: true });

onMounted(() => {
    document.addEventListener('click', (event) => {
        if (!event.target.closest('.context-menu') && !event.target.closest('.floating-ball')) {
            showContextMenu.value = false;
        }
    });
});

onUnmounted(() => {
    document.removeEventListener('click', () => {
        showContextMenu.value = false;
    });
});
</script>

<style scoped>
.context-menu {
    position: fixed;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08);
    z-index: 1000;
    padding: 8px 0;
    min-width: 200px;
}

.context-menu button {
    display: block;
    width: 100%;
    padding: 10px 15px;
    text-align: left;
    border: none;
    background: none;
    cursor: pointer;
    font-size: 14px;
    color: #333;
    transition: background-color 0.2s;
}

.context-menu button:hover {
    background-color: #f0f0f0;
}

.markdown-textarea {
    width: 100%;
    height: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-family: monospace;
    resize: vertical;
    overflow-y: auto;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>