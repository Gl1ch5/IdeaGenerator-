# Vintage Game Design Document Generator

A black-and-white, vintage-styled web application that generates complete Game Design Documents (GDDs) using the powerful Groq API (specifically leveraging Llama 3 70B).

## Features

This application generates comprehensive game ideas, either completely randomly or based on user prompts. It includes a custom vintage aesthetic with CSS animations and SVG elements.

### 10 Unique Features Included:
1. **Full GDD Generation:** Detailed output covering core loop, mechanics, narrative, art style, and monetization.
2. **True Randomization:** A "Surprise Me" button for entirely unexpected game concepts.
3. **User-Guided Prompts:** Input your basic ideas and watch them expand into a full document.
4. **Secure API Key Handling:** Client-side only API key storage (session storage) for security.
5. **Vintage Aesthetic:** Custom black-and-white retro terminal/typewriter styling.
6. **Animated Loading States:** Custom SVG animations while waiting for the AI response.
7. **Copy to Clipboard:** One-click copying of the generated document.
8. **Export to TXT:** Download the generated GDD directly as a text file.
9. **Local History:** Keeps track of recently generated ideas during your session.
10. **Marketing Strategy Add-on:** Specifically asks the AI to include a guerrilla marketing strategy for the game.

## Setup for GitHub Pages

This project is perfectly structured to be hosted directly on GitHub Pages without any build steps!

1. Fork or clone this repository.
2. Go to your repository settings on GitHub.
3. Navigate to **Pages** on the left sidebar.
4. Under **Build and deployment**, select **Deploy from a branch**.
5. Choose the `main` branch and the `/ (root)` folder.
6. Click **Save**.
7. Your site will be live at `https://[your-username].github.io/[repository-name]/` within a few minutes.

## Usage

1. Open the website.
2. Get an API key from [Groq Console](https://console.groq.com/).
3. Enter your Groq API key in the settings panel.
4. Either type a prompt (e.g., "A farming simulator but in space") or click "Generate Random Idea".
5. Wait for the vintage terminal to type out your complete Game Design Document!
