document.addEventListener("DOMContentLoaded", () => {
    // Elements
    const outputArea = document.getElementById("output-area");
    const inputArea = document.getElementById("input-area");
    const userInput = document.getElementById("user-input");
    const settingsPanel = document.getElementById("settings-panel");
    const controlsPanel = document.getElementById("controls-panel");
    const apiKeyInput = document.getElementById("api-key-input");
    const saveSettingsBtn = document.getElementById("save-settings-btn");

    // Command Buttons
    const btnRandom = document.getElementById("btn-random");
    const btnCustom = document.getElementById("btn-custom");
    const btnExport = document.getElementById("btn-export");
    const btnCopy = document.getElementById("btn-copy");
    const btnHistory = document.getElementById("btn-history");
    const btnSettings = document.getElementById("btn-settings");
    const btnClear = document.getElementById("btn-clear");
    const btnStats = document.getElementById("btn-stats");
    const btnTheme = document.getElementById("btn-theme");
    const btnHelp = document.getElementById("btn-help");

    let isBooting = true;
    let awaitState = 'command'; // command, settings, customPrompt
    let currentRawGDD = ""; // Store the current unmodified GDD

    // Audio/Typewriter Sound (Simulated)
    const typeSound = new Audio("assets/type.mp3");

    // Utilities
    const appendToOutput = (text, isHTML = false, styleClass = "") => {
        const p = document.createElement("p");
        if (styleClass) p.className = styleClass;

        if (isHTML) {
            p.innerHTML = text;
            outputArea.appendChild(p);
            outputArea.scrollTop = outputArea.scrollHeight;
        } else {
            p.textContent = text;
            outputArea.appendChild(p);
            outputArea.scrollTop = outputArea.scrollHeight;
        }
    };

    const typeText = async (text, speed = 20) => {
        const p = document.createElement("p");
        outputArea.appendChild(p);

        for (let i = 0; i < text.length; i++) {
            p.textContent += text.charAt(i);
            outputArea.scrollTop = outputArea.scrollHeight;
            await new Promise(r => setTimeout(r, speed));
        }
    };

    // Boot Sequence
    setTimeout(() => {
        const bootSeq = document.querySelector('.boot-sequence');
        if (bootSeq) bootSeq.remove();

        appendToOutput("> SYSTEM ONLINE.");

        if (getApiKey()) {
            appendToOutput("> API_KEY FOUND IN MEMORY.");
            showControls();
        } else {
            appendToOutput("> NO API_KEY DETECTED. ENTER CONFIG MODE [6].", false, "error-text");
            showControls();
        }

        inputArea.classList.remove("hidden");
        userInput.focus();
        isBooting = false;
    }, 2000);

    // Show Panels
    const showSettings = () => {
        settingsPanel.classList.remove("hidden");
        controlsPanel.classList.add("hidden");
        apiKeyInput.value = getApiKey() || "";
        apiKeyInput.focus();
        awaitState = 'settings';
        appendToOutput("> ENTERING SETTINGS MODE...");
    };

    const hideSettings = () => {
        settingsPanel.classList.add("hidden");
        showControls();
        awaitState = 'command';
        userInput.focus();
    };

    const showControls = () => {
        controlsPanel.classList.remove("hidden");
    };

    // Actions
    const handleGenerate = async (type, topic = null) => {
        const key = getApiKey();
        if (!key) {
            appendToOutput("> ERR: NO API_KEY FOUND. CONFIGURE FIRST.", false, "error-text");
            return;
        }

        appendToOutput(`> EXECUTING ${type.toUpperCase()}_GEN...`);
        appendToOutput("> AWAITING RESPONSE FROM MAIN_FRAME (THIS MAY TAKE A MOMENT)...", false, "blink");

        // Disable input
        inputArea.classList.add("hidden");
        controlsPanel.classList.add("hidden");

        try {
            const rawGdd = await generateGDD(key, type, topic);

            // Remove blinker
            const blinkers = document.querySelectorAll(".blink");
            blinkers.forEach(b => b.remove());

            appendToOutput("> GENERATION COMPLETE. PARSING DATA...");

            currentRawGDD = rawGdd;
            addHistoryEntry(rawGdd, type);

            // Format and display
            appendToOutput(formatMarkdown(rawGdd), true);
            appendToOutput("> END OF FILE.");

        } catch (err) {
            // Remove blinker
            const blinkers = document.querySelectorAll(".blink");
            blinkers.forEach(b => b.remove());
            appendToOutput(`> ERR: ${err.message}`, false, "error-text");
        } finally {
            inputArea.classList.remove("hidden");
            controlsPanel.classList.remove("hidden");
            userInput.focus();
        }
    };

    // Event Listeners
    saveSettingsBtn.addEventListener("click", () => {
        const val = apiKeyInput.value.trim();
        if (val) {
            saveApiKey(val);
            appendToOutput("> API_KEY UPDATED.");
        } else {
            deleteApiKey();
            appendToOutput("> API_KEY CLEARED.");
        }
        hideSettings();
    });

    // Buttons Actions
    btnRandom.addEventListener("click", () => handleGenerate("random"));
    btnCustom.addEventListener("click", () => {
        awaitState = 'customPrompt';
        appendToOutput("> ENTER TOPIC/IDEA FOR CUSTOM_GEN:");
        userInput.focus();
    });

    btnExport.addEventListener("click", () => {
        if (!currentRawGDD) {
            appendToOutput("> ERR: NO DATA IN BUFFER TO EXPORT.", false, "error-text");
            return;
        }
        downloadTxtFile("GDD_OUTPUT.txt", currentRawGDD);
        appendToOutput("> EXPORT COMPLETE. CHECK LOCAL FS.");
    });

    btnCopy.addEventListener("click", async () => {
        if (!currentRawGDD) {
            appendToOutput("> ERR: NO DATA IN BUFFER TO COPY.", false, "error-text");
            return;
        }
        const success = await copyToClipboard(currentRawGDD);
        if (success) {
            appendToOutput("> DATA COPIED TO CLIPBOARD.");
        } else {
            appendToOutput("> ERR: CLIPBOARD ACCESS DENIED.", false, "error-text");
        }
    });

    btnHistory.addEventListener("click", () => {
        const history = getHistory();
        if (history.length === 0) {
            appendToOutput("> NO HISTORY FOUND.");
        } else {
            appendToOutput(`> FOUND ${history.length} RECORDS:`);
            history.forEach((h, i) => {
                appendToOutput(`[${i}] ${new Date(h.timestamp).toLocaleString()} - ${h.type.toUpperCase()}_GEN`);
            });
            appendToOutput("> HISTORY DISPLAY COMPLETE.");
        }
    });

    btnSettings.addEventListener("click", showSettings);

    btnClear.addEventListener("click", () => {
        outputArea.innerHTML = "";
        appendToOutput("> SCREEN CLEARED.");
    });

    btnStats.addEventListener("click", () => {
        const stats = getStats();
        appendToOutput("> SYSTEM STATS:");
        appendToOutput(`> TOTAL GENERATED: ${stats.totalGenerated}`);
        appendToOutput(`> LAST ACTIVITY:   ${stats.lastGenerated}`);
    });

    btnTheme.addEventListener("click", () => {
        const isOn = toggleCrtEffect();
        appendToOutput(`> CRT FLICKER SET TO: ${isOn ? 'ON' : 'OFF'}`);
    });

    btnHelp.addEventListener("click", () => {
        appendToOutput("> HELP SYSTEM:");
        appendToOutput("> USE NUMBER KEYS 1-0 OR CLICK BUTTONS TO EXECUTE COMMANDS.");
        appendToOutput("> SET API_KEY [6] FIRST BEFORE GENERATING.");
    });

    // Input handling (CLI simulation)
    userInput.addEventListener("keydown", async (e) => {
        if (e.key === "Enter") {
            const val = userInput.value.trim();
            userInput.value = "";

            if (!val) return;

            appendToOutput(`SYS> ${val}`);

            if (awaitState === 'customPrompt') {
                awaitState = 'command';
                handleGenerate("custom", val);
                return;
            }

            // Simple command routing
            switch (val.toLowerCase()) {
                case '1': btnRandom.click(); break;
                case '2': btnCustom.click(); break;
                case '3': btnExport.click(); break;
                case '4': btnCopy.click(); break;
                case '5': btnHistory.click(); break;
                case '6': btnSettings.click(); break;
                case '7': btnClear.click(); break;
                case '8': btnStats.click(); break;
                case '9': btnTheme.click(); break;
                case '0': btnHelp.click(); break;
                default:
                    appendToOutput(`> ERR: UNKNOWN COMMAND "${val}". TYPE '0' FOR HELP.`, false, "error-text");
            }
        }
    });

    // Click anywhere to focus input
    document.body.addEventListener("click", (e) => {
        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'BUTTON') {
            userInput.focus();
        }
    });
});
