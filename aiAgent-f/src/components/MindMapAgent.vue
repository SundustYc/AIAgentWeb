<template>
    <div>
        <FloatingBall ref="floatingBall" :expanded="showMindMap" @toggle="toggleMindMap"
            @contextmenu="handleContextMenu" />
        <div id="map" :class="{ hidden: !showMindMap }"></div>

        <!-- Context Menu -->
        <transition name="fade">
            <div v-if="showContextMenu" class="context-menu" :style="contextMenuPosition">
                <button @click="toggleJsonEditor">Edit JSON</button>
                <button @click="exportToPng">Export as PNG</button>
            </div>
        </transition>

        <!-- JSON Editor -->
        <transition name="fade">
            <div v-if="showJsonEditor" class="json-editor-overlay">
                <div class="json-editor">
                    <h3>Edit JSON</h3>
                    <textarea v-model="jsonDataString" @input="updateJsonData" class="resizable"></textarea>
                    <div class="button-group">
                        <button @click="applyJsonChanges" class="primary">Apply Changes</button>
                        <button @click="toggleJsonEditor">Close</button>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useMindMap } from '../composables/useMindMap';
import FloatingBall from './FloatingBall.vue';

const props = defineProps(['messages']);

const {
    showMindMap,
    showJsonEditor,
    jsonData,
    toggleMindMap,
    updateMindMap,
    destroyMindMap,
    toggleJsonEditor,
    updateJsonData,
    exportToPng
} = useMindMap();

const showContextMenu = ref(false);
const contextMenuPosition = ref({ top: '0px', left: '0px' });
const jsonDataString = ref('');
const floatingBall = ref(null);

watch(() => props.messages, (newMessages) => {
    if (newMessages.length > 0) {
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage.role === 'assistant') {
            updateMindMap(lastMessage.content);
        }
    }
}, { deep: true });

watch(jsonData, (newJsonData) => {
    jsonDataString.value = JSON.stringify(newJsonData, null, 2);
}, { deep: true });

const handleContextMenu = (event) => {
    if (showMindMap.value) {
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
    contextMenuPosition.value = {
        top: `${top}px`,
        left: `${left}px`
    };
    showContextMenu.value = true;
};

const applyJsonChanges = () => {
    try {
        updateJsonData(jsonDataString.value);
        toggleJsonEditor();
    } catch (error) {
        console.error('Invalid JSON:', error);
    }
};

onMounted(() => {
    if (props.messages.length > 0) {
        const lastMessage = props.messages[props.messages.length - 1];
        if (lastMessage.role === 'assistant') {
            updateMindMap(lastMessage.content);
        }
    }
    document.addEventListener('click', (event) => {
        if (!event.target.closest('.context-menu') && !event.target.closest('.floating-ball')) {
            showContextMenu.value = false;
        }
    });
});

onUnmounted(() => {
    destroyMindMap();
    document.removeEventListener('click', () => {
        showContextMenu.value = false;
    });
});
</script>

<style scoped>
#map {
    width: 100%;
    height: 350px;
    border: 1px solid #dee2e6;
    border-radius: 5px;
    margin-top: 20px;
}

#map.hidden {
    display: none;
}

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

.json-editor-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1001;
    overflow: hidden;
}

textarea {
    flex-grow: 1;
    padding: 10px 40px 10px 10px;
    border-radius: 5px;
    border: 1px solid #ced4da;
    resize: none;
    overflow-y: auto;
    min-height: 40px;
    max-height: 200px;
}

.json-editor {
    margin-bottom: 10px;
    position: relative;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08);
    padding: 20px;
    width: 80%;
    max-width: 600px;
}

.json-editor textarea.resizable {
    width: 100%;
    height: 300px;
    margin-bottom: 15px;
    padding: 0px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-family: monospace;
    resize: both;
    min-height: 100px;
    max-width: 100%;
    max-height: calc(100vh - 200px);
}

.json-editor h3 {
    margin-top: 0;
    margin-bottom: 15px;
    color: #333;
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

.fade-enter,
.fade-leave-to {
    opacity: 0;
}
</style>