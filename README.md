# aecademy
Many students have trouble learning from dense lecture slides and long textbooks. aecademy is an AI-driven learning tool that provides an alternate study path for students who struggle with this, providing key concept summaries and personalized quizzes by summarizing these huge content pieces. This project was built as part of LA Hacks 2025 for the Hack2School Track.

## How Does It Work
- aecademy leverages fetch.ai's platform by creating AI uAgents to ascbchronously perform tasks in the background, including pdf parsing, summary generation, and quiz creation.
- uAgents communicate with each in the background, providing a service where users can import pdfs of lecture slides or textbooks with a personalized skill level, which are then sent to Fetch's LLM for quuerying.
- User queries and profiles are stored in MongoDB Atlas, allowing for users to access past entries as study material.

## How to Use
### 1. Clone this repository
```bash
git clone https://github.com/your-username/aecademy.git
cd aecademy
```

### 2. Run Backend
```bash
cd backend

# Activate/Create Virtual Environment
python -m venv venv

# Windows
venv/Scripts/activate

# Mac
source venv/bin/activate

# Install Dependencies and run uAgents
./run_backend.sh
```

### 3. Run Frontend
```bash
cd ../frontend
cd aecademy

# Install Dependencies and Run Server
npm i
npm run dev
```

### 4. Access the Application
Open https://http://localhost:3001 in your browser!

## Future Enhancements
- Use of a more in-depth LLM for more fine-tuned generations (currently using FetchASI-1 Mini)
- Allow the user to dynamically chat with their submitted pdf
- Enhance quiz capabilities with adaptive learning

