<template>
    <div>
        <FloatingBall ref="floatingBall" :expanded="showDiagram" @toggle="toggleDiagram"
            @contextmenu="handleContextMenu" />
        <FloatingWindow v-if="showDiagram">
            <MermaidViewer :svgCode="svgCode" />
        </FloatingWindow>

        <!-- Context menu -->
        <transition name="fade">
            <div v-if="showContextMenu" class="context-menu" :style="contextMenuStyle">
                <button @click="onEditCode">编辑 Mermaid 代码</button>
                <button @click="exportToPNG">导出为 PNG</button>
            </div>
        </transition>

        <!-- Mermaid code editor -->
        <transition name="fade">
            <div v-if="showCodeEditor" class="code-editor-overlay">
                <div class="code-editor">
                    <h3>编辑 Mermaid 代码</h3>
                    <textarea v-model="localMermaidCode" class="resizable"></textarea>
                    <div class="button-group">
                        <button @click="applyCodeChanges" class="primary">应用更改</button>
                        <button @click="toggleCodeEditor">关闭</button>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useMermaid } from '../composables/useMermaid';
import FloatingBall from './FloatingBall.vue';
import FloatingWindow from './FloatingWindow.vue';
import MermaidViewer from './MermaidViewer.vue';

const props = defineProps({
    messages: {
        type: Array,
        default: () => []
    }
});

const {
    showDiagram,
    showCodeEditor,
    mermaidCode,
    svgCode,
    toggleDiagram,
    updateDiagram,
    toggleCodeEditor,
    updateMermaidCode,
    exportToPNG
} = useMermaid();

const showContextMenu = ref(false);
const contextMenuStyle = ref({ top: '0px', left: '0px' });
const localMermaidCode = ref('');
const floatingBall = ref(null);

watch(
    () => props.messages,
    (newMessages) => {
        if (newMessages.length > 0) {
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage.role === 'assistant') {
                updateDiagram(lastMessage.content);
            }
        }
    },
    { deep: true }
);

watch(mermaidCode, (newCode) => {
    localMermaidCode.value = newCode;
});

const handleContextMenu = (event) => {
    if (showDiagram.value) {
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

const onEditCode = () => {
    showContextMenu.value = false;
    toggleCodeEditor();
};

const applyCodeChanges = () => {
    updateMermaidCode(localMermaidCode.value);
    toggleCodeEditor();
};

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
    position: absolute;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    z-index: 2000;
    padding: 8px 0;
    min-width: 150px;
}

.context-menu button {
    display: block;
    width: 100%;
    padding: 8px 12px;
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

.code-editor-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
}

.code-editor {
    background: white;
    border-radius: 8px;
    padding: 20px;
    width: 80%;
    max-width: 600px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.code-editor h3 {
    margin-top: 0;
    margin-bottom: 15px;
    color: #333;
}

.code-editor textarea.resizable {
    width: 100%;
    height: 300px;
    margin-bottom: 15px;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-family: monospace;
    resize: both;
    overflow: auto;
}

.button-group {
    display: flex;
    justify-content: flex-end;
}

.button-group button {
    padding: 8px 15px;
    margin-left: 10px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.button-group button.primary {
    background-color: #007bff;
    color: white;
}

.button-group button.primary:hover {
    background-color: #0056b3;
}

.button-group button:not(.primary) {
    background-color: #f8f9fa;
    color: #333;
}

.button-group button:not(.primary):hover {
    background-color: #e2e6ea;
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
