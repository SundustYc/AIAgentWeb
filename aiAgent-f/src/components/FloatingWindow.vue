<template>
    <div ref="floatingWindow" class="floating-window"
        :style="{ width: containerWidth + 'px', height: containerHeight + 'px' }" @mousedown.stop>
        <div class="window-header" @mousedown="startDrag">
            <div class="control-buttons">
                <button class="control-button blue" @click="toggleMaximize"></button>
            </div>
        </div>
        <slot></slot>
        <div class="resize-handle" @mousedown="startResize"></div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const containerWidth = ref(300);
const containerHeight = ref(200);
const isDragging = ref(false);
const isResizing = ref(false);
const isMaximized = ref(false);
const dragOffset = ref({ x: 0, y: 0 });
const originalSize = ref({ width: 300, height: 200, top: 20, left: 20 });
const floatingWindow = ref(null);

const startDrag = (event) => {
    isDragging.value = true;
    const rect = floatingWindow.value.getBoundingClientRect();
    dragOffset.value = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
    };
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDrag);
};

const drag = (event) => {
    if (isDragging.value) {
        const x = event.clientX - dragOffset.value.x;
        const y = event.clientY - dragOffset.value.y;
        floatingWindow.value.style.left = `${x}px`;
        floatingWindow.value.style.top = `${y}px`;
    }
};

const stopDrag = () => {
    isDragging.value = false;
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('mouseup', stopDrag);
};

const startResize = (event) => {
    isResizing.value = true;
    document.addEventListener('mousemove', resize);
    document.addEventListener('mouseup', stopResize);
};

const resize = (event) => {
    if (isResizing.value) {
        const rect = floatingWindow.value.getBoundingClientRect();
        containerWidth.value = Math.max(200, event.clientX - rect.left);
        containerHeight.value = Math.max(150, event.clientY - rect.top);
    }
};

const stopResize = () => {
    isResizing.value = false;
    document.removeEventListener('mousemove', resize);
    document.removeEventListener('mouseup', stopResize);
};

const toggleMaximize = () => {
    if (isMaximized.value) {
        containerWidth.value = originalSize.value.width;
        containerHeight.value = originalSize.value.height;
        floatingWindow.value.style.top = `${originalSize.value.top}px`;
        floatingWindow.value.style.left = `${originalSize.value.left}px`;
    } else {
        originalSize.value = {
            width: containerWidth.value,
            height: containerHeight.value,
            top: floatingWindow.value.style.top,
            left: floatingWindow.value.style.left,
        };
        containerWidth.value = window.innerWidth;
        containerHeight.value = window.innerHeight;
        floatingWindow.value.style.top = '0px';
        floatingWindow.value.style.left = '0px';
    }
    isMaximized.value = !isMaximized.value;
};

onMounted(() => {
    floatingWindow.value.style.position = 'fixed';
    floatingWindow.value.style.left = '300px';
    floatingWindow.value.style.top = '300px';
});

onUnmounted(() => {
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('mouseup', stopDrag);
});
</script>

<style scoped>
.floating-window {
    position: fixed;
    z-index: 1000;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    resize: both;
}

.window-header {
    height: 24px;
    background-color: #f0f0f0;
    cursor: move;
    display: flex;
    align-items: center;
    padding: 0 8px;
}

.control-buttons {
    display: flex;
    gap: 5px;
}

.control-button {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: none;
    cursor: pointer;
}

.control-button.blue {
    background-color: #3498db;
}

.resize-handle {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 10px;
    height: 10px;
    cursor: nwse-resize;
}
</style>