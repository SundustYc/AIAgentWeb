import { defineStore } from 'pinia';
import { mindmap_prompt_string, default_prompt_string, prompt_create_guide_prompt_string, translate_master_prompt_string, mermaid_prompt_string } from './agentPrompt.js';

export const useAgentStore = defineStore('agent', {
    state: () => ({
        currentAgentId: 'default',
        agents: [
            { id: 'default', name: '默认', prompt: default_prompt_string },
            { id: 'mindmap', name: '思维导图助手', prompt: mindmap_prompt_string },
            { id: 'prompt_create_guide', name: '提示词编写助手', prompt: prompt_create_guide_prompt_string },
            { id: 'translate_master', name: '翻译助手', prompt: translate_master_prompt_string },
            { id: 'mermaid', name: 'Mermaid图表助手', prompt: mermaid_prompt_string }
        ]
    }),
    actions: {
        setCurrentAgent(agentId) {
            this.currentAgentId = agentId;
        },
        addAgent(id, name, prompt) {
            if (!this.agents.some(agent => agent.id === id)) {
                this.agents.push({ id, name, prompt });
            }
        },
        updateAgent(agentId, name, prompt) {
            const agent = this.agents.find(agent => agent.id === agentId);
            if (agent) {
                agent.prompt = prompt;
                agent.name = name;
            }
        },
        removeAgent(agentId) {
            const index = this.agents.findIndex(agent => agent.id === agentId);
            if (index !== -1) {
                this.agents.splice(index, 1);
                if (this.currentAgentId === agentId && this.agents.length > 0) {
                    this.currentAgentId = this.agents[0].id;
                }
            }
        },
    }
});