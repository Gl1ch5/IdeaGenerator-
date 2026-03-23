// app.js - Main application logic

document.addEventListener('DOMContentLoaded', () => {

    // DOM Elements
    const apiKeyInput = document.getElementById('apiKey');
    const saveKeyBtn = document.getElementById('saveKeyBtn');
    const keyStatus = document.getElementById('keyStatus');

    const promptInput = document.getElementById('promptInput');
    const generateBtn = document.getElementById('generateBtn');
    const randomBtn = document.getElementById('randomBtn');

    const loadingIndicator = document.getElementById('loadingIndicator');
    const outputSection = document.getElementById('output-section');
    const typewriterText = document.getElementById('typewriterText');
    const outputContainer = document.getElementById('outputContainer');

    const copyBtn = document.getElementById('copyBtn');
    const exportBtn = document.getElementById('exportBtn');
    const historyBtn = document.getElementById('historyBtn');

    const historySection = document.getElementById('history-section');
    const historyList = document.getElementById('historyList');
    const closeHistoryBtn = document.getElementById('closeHistoryBtn');

    let currentOutput = '';
    let isTyping = false;
    let typeInterval = null;
    let gddHistory = []; // Feature: Local Session History

    // Initialization
    checkExistingKey();
    loadHistory();

    // Event Listeners
    saveKeyBtn.addEventListener('click', handleSaveKey);
    generateBtn.addEventListener('click', () => handleGenerate(promptInput.value));
    randomBtn.addEventListener('click', () => handleGenerate(''));
    copyBtn.addEventListener('click', handleCopy);
    exportBtn.addEventListener('click', handleExportTxt);
    historyBtn.addEventListener('click', toggleHistory);
    closeHistoryBtn.addEventListener('click', toggleHistory);

    // Feature 4: Client-side Key Management
    function checkExistingKey() {
        const key = getApiKey();
        if (key) {
            apiKeyInput.value = '**********'; // Mask key
            showStatus('KEY LOADED FROM MEMORY.');
        }
    }

    function handleSaveKey() {
        const val = apiKeyInput.value;
        if (val === '**********') return; // Don't re-save mask

        if (saveApiKey(val)) {
            apiKeyInput.value = '**********';
            showStatus('KEY SECURED IN SESSION MEMORY.');
        } else {
            showStatus('ERROR: INVALID KEY FORMAT.');
        }
    }

    function showStatus(msg) {
        keyStatus.textContent = msg;
        keyStatus.classList.remove('hidden');
        setTimeout(() => {
            keyStatus.classList.add('hidden');
        }, 3000);
    }

    // Generation Handling
    async function handleGenerate(promptStr) {
        if (!getApiKey()) {
            alert('SYSTEM ERROR: VALID API KEY REQUIRED IN SETTINGS.');
            apiKeyInput.focus();
            return;
        }

        if (isTyping) {
            clearInterval(typeInterval);
            isTyping = false;
        }

        setLoading(true);
        typewriterText.innerHTML = '';
        currentOutput = '';

        try {
            // Feature 1 & 2 & 3: API call
            const result = await generateGDD(promptStr);
            currentOutput = result;

            // Feature 9: Save to history
            saveToHistory(promptStr || 'RANDOM GENERATION', result);

            setLoading(false);

            // Feature 5 & 6: Typewriter effect
            typeWriterEffect(currentOutput);

        } catch (error) {
            setLoading(false);
            currentOutput = `[SYSTEM FAILURE]\n\nERROR TRACE:\n${error.message}\n\nPLEASE CHECK API KEY OR NETWORK CONNECTION.`;
            typeWriterEffect(currentOutput);
        }
    }

    function setLoading(isLoading) {
        const outSection = document.getElementById('output-section');
        const inputSection = document.getElementById('input-section');

        if (isLoading) {
            loadingIndicator.classList.remove('hidden');
            outSection.classList.add('hidden');
            inputSection.style.opacity = '0.5';
            generateBtn.disabled = true;
            randomBtn.disabled = true;
        } else {
            loadingIndicator.classList.add('hidden');
            outSection.classList.remove('hidden');
            inputSection.style.opacity = '1';
            generateBtn.disabled = false;
            randomBtn.disabled = false;
            // Scroll to output
            outSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    function typeWriterEffect(text) {
        isTyping = true;
        let i = 0;
        typewriterText.innerHTML = '';

        typeInterval = setInterval(() => {
            if (i < text.length) {
                // Quick hack for simple markdown rendering in typing effect
                let char = text.charAt(i);
                if (char === '\n') char = '<br>';

                typewriterText.innerHTML += char;
                outputContainer.scrollTop = outputContainer.scrollHeight;
                i++;
            } else {
                clearInterval(typeInterval);
                isTyping = false;
                formatOutput();
            }
        }, 15); // Typing speed
    }

    function formatOutput() {
        // Simple markdown parsing after typing is done for better readability
        let formatted = currentOutput
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/## (.*)/g, '<h3>$1</h3>')
            .replace(/# (.*)/g, '<h2>$1</h2>')
            .replace(/- (.*)/g, '• $1')
            .replace(/\n/g, '<br>');
        typewriterText.innerHTML = formatted;
    }

    // Feature 7: Copy
    function handleCopy() {
        if (!currentOutput) return;
        navigator.clipboard.writeText(currentOutput).then(() => {
            const originalText = copyBtn.innerText;
            copyBtn.innerText = '[COPIED!]';
            setTimeout(() => { copyBtn.innerText = originalText; }, 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            alert('SYSTEM ERROR: CLIPBOARD ACCESS DENIED.');
        });
    }

    // Feature 8: Export TXT
    function handleExportTxt() {
        if (!currentOutput) return;
        const blob = new Blob([currentOutput], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');

        // Extract a crude title or use default
        let titleMatch = currentOutput.match(/TITLE:\s*(.*)/i) || currentOutput.match(/#\s*(.*)/);
        let filename = titleMatch ? titleMatch[1].trim().replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'gdd_export';

        a.href = url;
        a.download = `${filename}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Feature 9: History
    function saveToHistory(prompt, result) {
        const entry = {
            id: Date.now(),
            prompt: prompt,
            snippet: result.substring(0, 50).replace(/\n/g, ' ') + '...',
            full: result
        };
        gddHistory.unshift(entry);
        if (gddHistory.length > 5) gddHistory.pop(); // Keep last 5

        sessionStorage.setItem('gdd_history', JSON.stringify(gddHistory));
        renderHistory();
    }

    function loadHistory() {
        const saved = sessionStorage.getItem('gdd_history');
        if (saved) {
            try {
                gddHistory = JSON.parse(saved);
                renderHistory();
            } catch (e) {
                console.error('Failed to parse history');
            }
        }
    }

    function renderHistory() {
        historyList.innerHTML = '';
        if (gddHistory.length === 0) {
            historyList.innerHTML = '<p>NO SESSION DATA FOUND.</p>';
            return;
        }

        gddHistory.forEach(item => {
            const div = document.createElement('div');
            div.className = 'history-item';
            div.innerHTML = `<strong>> ${item.prompt}</strong><br><small>${item.snippet}</small>`;
            div.addEventListener('click', () => {
                currentOutput = item.full;
                document.getElementById('output-section').classList.remove('hidden');
                formatOutput();
                toggleHistory();
            });
            historyList.appendChild(div);
        });
    }

    function toggleHistory() {
        historySection.classList.toggle('hidden');
    }
});