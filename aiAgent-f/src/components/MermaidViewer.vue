<template>
    <div class="mermaid-viewer" ref="viewerContainer" @wheel="handleZoom" @mousedown="startDrag" @mousemove="drag"
        @mouseup="stopDrag" @mouseleave="stopDrag">
        <div class="mermaid-content" :style="contentStyle" v-html="svgCode"></div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps(['svgCode']);

const scale = ref(1);
const position = ref({ x: 0, y: 0 });
const isDragging = ref(false);
const dragStart = ref({ x: 0, y: 0 });
const viewerContainer = ref(null);

const contentStyle = computed(() => ({
    transform: `scale(${scale.value}) translate(${position.value.x}px, ${position.value.y}px)`,
    transformOrigin: 'top left'
}));

function handleZoom(event) {
    event.preventDefault();
    const zoomIntensity = 0.1;
    const wheel = event.deltaY < 0 ? 1 : -1;
    const zoom = Math.exp(wheel * zoomIntensity);

    const viewerRect = viewerContainer.value.getBoundingClientRect();
    const offsetX = event.clientX - viewerRect.left;
    const offsetY = event.clientY - viewerRect.top;

    const currentScale = scale.value;
    const newScale = Math.max(0.1, Math.min(5, currentScale * zoom));

    position.value = {
        x: offsetX - (offsetX - position.value.x) * (newScale / currentScale),
        y: offsetY - (offsetY - position.value.y) * (newScale / currentScale)
    };

    scale.value = newScale;
}

function startDrag(event) {
    isDragging.value = true;
    dragStart.value = { x: event.clientX - position.value.x, y: event.clientY - position.value.y };
}

function drag(event) {
    if (isDragging.value) {
        position.value = {
            x: event.clientX - dragStart.value.x,
            y: event.clientY - dragStart.value.y
        };
    }
}

function stopDrag() {
    isDragging.value = false;
}

</script>

<style scoped>
.mermaid-viewer {
    width: 100%;
    height: 100%;
    overflow: hidden;
    position: relative;
    background-color: white;
    border: 1px solid #ccc;
    border-radius: 4px;
}

.mermaid-content {
    position: absolute;
    will-change: transform;
}
</style>