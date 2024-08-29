<template>
    <div ref="floatingBall" @mousedown="onDragStart" @click="$emit('toggle')" @contextmenu="onRightClick"
        class="floating-ball" :class="{ 'active': expanded }"
        :style="{ left: `${position.x}px`, top: `${position.y}px` }">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const props = defineProps({
    expanded: Boolean,
});

const emit = defineEmits(['toggle', 'contextmenu']);

const position = ref({ x: 80, y: 80 });
let isDragging = false;

const initializePosition = () => {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const ballWidth = 60;
    const ballHeight = 200;

    position.value.x = screenWidth - ballWidth - 20;
    position.value.y = screenHeight - ballHeight - 20;
};

const onDragStart = (event) => {
    isDragging = true;
    const initialX = event.clientX - position.value.x;
    const initialY = event.clientY - position.value.y;

    const onDrag = (moveEvent) => {
        if (!isDragging) return;
        position.value.x = moveEvent.clientX - initialX;
        position.value.y = moveEvent.clientY - initialY;
    };

    const onDragEnd = () => {
        isDragging = false;
        document.removeEventListener('mousemove', onDrag);
        document.removeEventListener('mouseup', onDragEnd);
        snapToEdge();
    };

    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', onDragEnd);
};

const snapToEdge = () => {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const ballWidth = 60;
    const ballHeight = 60;
    if (position.value.x < screenWidth / 2) {
        position.value.x = 20;
    } else {
        position.value.x = screenWidth - ballWidth - 20;
    }
    if (position.value.y < 20) {
        position.value.y = 20;
    } else if (position.value.y > screenHeight - ballHeight - 20) {
        position.value.y = screenHeight - ballHeight - 20;
    }
};

const onRightClick = (event) => {
    event.preventDefault();
    emit('contextmenu', event);
};

onMounted(() => {
    initializePosition();
});
</script>

<style scoped>
.floating-ball {
    position: fixed;
    width: 50px;
    height: 50px;
    border-radius: 30px;
    background-color: #3498db;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: move;
    user-select: none;
    z-index: 1000;
    transition: all 0.3s ease;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08);
}

.floating-ball:hover {
    transform: translateY(-2px);
    box-shadow: 0 7px 14px rgba(0, 0, 0, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08);
}

.floating-ball.active {
    background-color: #2980b9;
}

.floating-ball svg {
    transition: transform 0.3s ease;
}

.floating-ball:hover svg {
    transform: scale(1.1);
}

.floating-ball.active svg {
    transform: rotate(90deg);
}
</style>
