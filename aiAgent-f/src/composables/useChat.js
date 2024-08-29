import { ref } from 'vue';
import { useAgentStore } from '../store/agentStore';
import { apiSendMessage, apiResetMemory } from '../services/api';

export function useChat() {
    const messages = ref([]);
    const userMessage = ref('');
    const nextId = ref(1);
    const store = useAgentStore();
    const isLoading = ref(false);

    async function sendMessage() {
        if (userMessage.value.trim() === '') return;

        const userMessageData = { id: nextId.value++, role: 'user', name: '用户', content: userMessage.value };
        messages.value.push(userMessageData);

        try {
            // 找当前的agent
            const currentAgent = store.agents.find(agent => agent.id === store.currentAgentId);
            const currentPrompt = currentAgent ? currentAgent.prompt : '';
            isLoading.value = true;
            const apiResponse = await apiSendMessage(userMessage.value, currentPrompt);
            const assistantMessageData = { id: nextId.value++, role: 'assistant', name: currentAgent.name, content: apiResponse.response };
            messages.value.push(assistantMessageData);
        } catch (error) {
            console.error('错误:', error);
            messages.value.push({ id: nextId.value++, role: 'assistant', content: '抱歉，发生了错误。' });
        } finally {
            isLoading.value = false;
        }
        userMessage.value = '';
    }

    async function clearMemory() {
        try {
            messages.value = [];
            const apiResponse = await apiResetMemory();
            const msg = { id: nextId.value++, role: 'assistant', name: '系统消息', content: apiResponse.response };
            messages.value.push(msg);
        } catch (error) {
            console.error('Error clearing memory:', error);
        }
    }

    return {
        messages,
        userMessage,
        isLoading,
        sendMessage,
        clearMemory
    };
}