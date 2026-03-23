// Feature 1: Get API Key from Storage
function getApiKey() {
    return sessionStorage.getItem('GROQ_API_KEY');
}

// Feature 2: Save API Key
function saveApiKey(key) {
    sessionStorage.setItem('GROQ_API_KEY', key);
    return true;
}

// Feature 3: Delete API Key
function deleteApiKey() {
    sessionStorage.removeItem('GROQ_API_KEY');
    return true;
}

// Feature 4: Format output (Markdown to simple HTML for terminal)
function formatMarkdown(text) {
    let formatted = text
        .replace(/^### (.*$)/gim, '\n>>> $1 <<<\n')
        .replace(/^## (.*$)/gim, '\n>> $1 <<\n')
        .replace(/^# (.*$)/gim, '\n> $1 <\n')
        .replace(/\*\*(.*)\*\*/gim, '<span class="prompt-prefix">$1</span>')
        .replace(/\*(.*)\*/gim, '<em>$1</em>')
        .replace(/!\[(.*?)\]\((.*?)\)/gim, "[ IMG: $1 ]")
        .replace(/\[(.*?)\]\((.*?)\)/gim, "[ LNK: $1 ]")
        .replace(/\n/gim, '<br>');

    // Optional SVG animation insertion if specific keywords are found
    if (formatted.toLowerCase().includes("core loop")) {
        const svgAnim = `
        <svg class="svg-animation spin" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="40" stroke="white" stroke-width="2" fill="none" stroke-dasharray="10 5" />
            <circle cx="50" cy="50" r="30" stroke="white" stroke-width="1" fill="none" />
            <line x1="50" y1="10" x2="50" y2="90" stroke="white" stroke-width="1" />
            <line x1="10" y1="50" x2="90" y2="50" stroke="white" stroke-width="1" />
        </svg>
        `;
        formatted = formatted.replace(/(>>> CORE LOOP <<<)/i, `$1\n${svgAnim}`);
    }

    return `<div class="gdd-content">${formatted}</div>`;
}

// Feature 5: Add History Entry
function addHistoryEntry(content, type) {
    let history = JSON.parse(sessionStorage.getItem('GDD_HISTORY') || '[]');
    history.push({
        timestamp: new Date().toISOString(),
        type: type,
        content: content
    });
    sessionStorage.setItem('GDD_HISTORY', JSON.stringify(history));
}

// Feature 6: Get History
function getHistory() {
    return JSON.parse(sessionStorage.getItem('GDD_HISTORY') || '[]');
}

// Feature 7: Export to TXT
function downloadTxtFile(filename, text) {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

// Feature 8: Copy to Clipboard
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error('Failed to copy: ', err);
        return false;
    }
}

// Feature 9: Toggle CRT Effect
function toggleCrtEffect() {
    const overlay = document.getElementById('crt-overlay');
    if (overlay) {
        overlay.style.display = overlay.style.display === 'none' ? 'block' : 'none';
        return overlay.style.display !== 'none';
    }
    return false;
}

// Feature 10: Generate Stats
function getStats() {
    const history = getHistory();
    return {
        totalGenerated: history.length,
        lastGenerated: history.length > 0 ? history[history.length - 1].timestamp : "N/A"
    };
}
