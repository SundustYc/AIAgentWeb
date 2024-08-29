import { ref, nextTick } from 'vue';
import mermaid from 'mermaid';

export function useMermaid() {
    const showDiagram = ref(false);
    const showCodeEditor = ref(false);
    const mermaidCode = ref('');
    const svgCode = ref('');

    function toggleDiagram() {
        showDiagram.value = !showDiagram.value;
        if (showDiagram.value) {
            renderDiagram();
        }
    }

    function extractMermaidFromResponse(responseText) {
        const match = responseText.match(/```mermaid\n([\s\S]*?)\n```/);
        return match ? match[1] : null;
    }

    function updateDiagram(content) {
        const extractedCode = extractMermaidFromResponse(content);
        if (extractedCode) {
            mermaidCode.value = extractedCode;
            renderDiagram();
        }
    }

    async function renderDiagram() {
        if (mermaidCode.value) {
            try {
                mermaid.initialize({ startOnLoad: true, theme: 'default', securityLevel: 'loose' });
                const { svg } = await mermaid.render('mermaid-diagram', mermaidCode.value);

                // 创建一个临时的 div 元素来包含 SVG
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = svg;
                const svgElement = tempDiv.querySelector('svg');

                // 设置 SVG 的宽度和高度
                svgElement.setAttribute('width', '1200');
                svgElement.setAttribute('height', '900');

                svgCode.value = tempDiv.innerHTML;
                showDiagram.value = true;
            } catch (error) {
                console.error('Mermaid rendering error:', error);
            }
        }
    }

    function toggleCodeEditor() {
        showCodeEditor.value = !showCodeEditor.value;
    }

    function updateMermaidCode(newCode) {
        mermaidCode.value = newCode;
        renderDiagram();
    }

    function exportToPNG() {
        const svgElement = document.querySelector('.mermaid-content svg');
        if (!svgElement) return;

        const svgData = new XMLSerializer().serializeToString(svgElement);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const img = new Image();
        img.onload = () => {
            canvas.width = img.width * 2;
            canvas.height = img.height * 2;
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            canvas.toBlob((blob) => {
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = 'diagram.png';
                a.click();
            }, 'image/png');
        };

        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    }

    return {
        showDiagram,
        showCodeEditor,
        mermaidCode,
        svgCode,
        toggleDiagram,
        updateDiagram,
        toggleCodeEditor,
        updateMermaidCode,
        exportToPNG,
    };
}