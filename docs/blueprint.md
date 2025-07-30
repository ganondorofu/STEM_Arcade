# **App Name**: BunkaSai Arcade

## Core Features:

- Game Launcher: Display a list of WebGL games as cards, each showing the title, short description, thumbnail, and a 'Play' button.
- Game Display: Load and display the selected game in an iframe on the same page. The iframe includes a full-screen toggle button, and a Markdown description of the game displayed below or alongside the game.
- Game Submission Form: A 'Add Game' link that navigates to a form for submitting new games with details such as game title, description, zip file, thumbnail, and Markdown description.
- Game Data Management: Client-side game ID generation. Save game information (title, description, paths) to Firebase. Upload zip files, thumbnails, and markdown descriptions to a Python server.
- Admin Panel: An admin page to edit game details, re-upload game files, and review feedback. Editing or re-uploading will overwrite existing information while keeping the original game ID.
- Anonymous Feedback: Implement a simple anonymous feedback form for each game to collect user comments and store it with timestamp and game id. Only accessible on admin page.

## Style Guidelines:

- Primary color: Cheerful magenta (#F06292) for a fun and inviting atmosphere.
- Background color: Very light desaturated magenta (#F8BBD0) to provide a gentle, bright backdrop.
- Accent color: Complementary cyan (#00BCD4) to highlight interactive elements and call to actions.
- Body and headline font: 'PT Sans', a humanist sans-serif, which combines a modern look and a little warmth or personality, for a friendly and accessible feel.
- Use a set of bright, playful icons representing different game genres or themes to add visual interest.
- Card-based layout with clear, intuitive design for easy navigation and game selection, suitable for all devices.
- Subtle animations, such as card hover effects and smooth transitions when loading games, to enhance user engagement.