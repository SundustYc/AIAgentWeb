import { nextTick, ref } from 'vue';
import MindElixir from 'mind-elixir';

export function useMindMap() {
    const showMindMap = ref(false);
    const showJsonEditor = ref(false);
    const jsonData = ref(null);
    let me = null;

    function toggleMindMap() {
        showMindMap.value = !showMindMap.value;
        if (showMindMap.value) {
            createMindMap();
        }
        if (!showMindMap.value) {
            destroyMindMap();
        }
    }

    function extractJsonFromResponse(responseText) {
        const match = responseText.match(/```json\n([\s\S]*?)\n```/);
        if (match && match[1]) {
            return JSON.parse(match[1]);
        }
        return null;
    }

    function updateMindMap(content) {
        jsonData.value = extractJsonFromResponse(content);
        console.log('jsonData:', jsonData.value);
        createMindMap();
    }
  
    function createMindMap() {
        if (jsonData.value) { 
            showMindMap.value = true;
            nextTick(() => {
                destroyMindMap();
                me = new MindElixir({
                    el: '#map',
                    direction: MindElixir.SIDE,
                });
                try {
                    me.init(jsonData.value);
                } catch (error) {
                    console.error('MindElixir error:', error);
                    destroyMindMap();
                }
            });
        }
    }

    function destroyMindMap() {
        me = null;
        const mapElement = document.getElementById('map');
        if (mapElement) {
            mapElement.innerHTML = '';
        }
    }

    function toggleJsonEditor() {
        showJsonEditor.value = !showJsonEditor.value;
    }

    function updateJsonData(newJsonData) {
        try {
            jsonData.value = JSON.parse(newJsonData);
            createMindMap();
        } catch (error) {
            console.error('Invalid JSON:', error);
        }
    }

    async function exportToPng() {
        if (me) {
            try {
                const blob = await me.exportPng();
                if (blob) {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'mindmap.png';
                    a.click();
                    URL.revokeObjectURL(url);
                }
            } catch (error) {
                console.error('Export error:', error);
            }
        }
    }

    return {
        showMindMap,
        showJsonEditor,
        jsonData,
        toggleMindMap,
        updateMindMap,
        destroyMindMap,
        toggleJsonEditor,
        updateJsonData,
        exportToPng
    };
}