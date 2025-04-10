Dreamscape - Dream Journal & AI Archetype Explorer
==================================================

Dreamscape is a web application designed to explore the world of dreams through a personal journal and analyses based on Jungian psychology. It allows users to record their dreams, receive AI-generated interpretations considering relevant archetypes, and better understand the patterns of their unconscious mind.

✨ Features
----------

### 🌙 Dream Journal

-   Record and store your dreams in detail.
-   Receive AI-generated interpretations based on Jungian psychology, identifying relevant symbols and archetypes.
-   (Future) Track emotional patterns and recurring symbols.
-   (Future) Get personalized self-care recommendations.

### 🎭 Archetype Explorer (Future/Potential Functionality)

-   Discover and learn about Jungian archetypes.
-   (Future) Take a test to discover your dominant archetype.
-   (Future) Explore detailed descriptions and characteristics of each archetype.
-   (Future) Understand shadow aspects and psychological functions.

### 👤 User Features

-   Secure authentication system (Registration and Login with JWT).
-   Personalized user profiles (Backend ready, Frontend implementation needed).
-   Dream journaling history (Backend ready, Frontend visualization needed).
-   (Future) Progress tracking and insights.

🛠 Architecture & Technology Stack
----------------------------------

This project uses a multi-component/microservice architecture:

1.  **Frontend (User Interface)**

    -   **Framework:** Vue 3 (Composition API with `<script setup>`)
    -   **Language:** TypeScript
    -   **Build Tool:** Vite
    -   **Routing:** Vue Router
    -   **State Management:** Pinia (with `pinia-plugin-persistedstate`)
    -   **Styling:** Tailwind CSS
    -   **HTTP Requests:** Axios (with Vite proxy)
    -   **Icons:** Lucide Icons
2.  **Backend (Main API & User Management)**

    -   **Framework:** Node.js + Express
    -   **Language:** TypeScript
    -   **Database:** MongoDB (using the native `mongodb` driver)
    -   **Authentication:** JWT (jsonwebtoken) + Bcrypt for password hashing
    -   **Middleware:** CORS
3.  **AI Service (Dream Interpretation)**

    -   **Framework:** Python + Flask
    -   **Artificial Intelligence:**
        -   Hugging Face Transformers (for loading and running local LLM models, e.g., Mistral 7B Instruct)
        -   Sentence Transformers (for generating text embeddings)
        -   PyTorch
        -   Accelerate (for efficient loading of large models)
    -   **Vector Database:** Pinecone (for archetype similarity search)
    -   **Other:** Dotenv

🚀 Getting Started (Local Development)
--------------------------------------

To run this project locally, you'll need the prerequisites installed and follow the steps to set up each service.

### Prerequisites

-   Node.js (v18 or higher recommended)
-   npm (v8 or higher recommended)
-   Python (v3.10 or higher recommended)
-   pip (Python package installer)
-   Git
-   A Pinecone account (the free "Starter" plan is sufficient).
-   A Hugging Face account (to download models and manage tokens).
-   `huggingface-cli` (installed via `pip install huggingface_hub`)

### 1\. Clone the Repository

git clone <https://github.com/your-username/dreambound-project.git> # Replace with your URL cd dreambound-project

### 2\. Environment Variable Setup

You need to create `.env` files in the `backend` and `ai-service` directories.

**a) Backend (`dreambound-project/backend/.env`):**

Port for the Node.js server (optional, defaults to 3000)


PORT=3000

Connection URI for your MongoDB Atlas or local database


MONGO_URI="mongodb+srv://<user>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority" # Replace with your actual URI

Secret key for signing JWTs (Invent a long, secure one!)


JWT_SECRET="A_VERY_SECRET_AND_LONG_KEY_FOR_JWT"

URL of the Python AI service (make sure it matches where Flask runs)


PYTHON_AI_SERVICE="http://localhost:5001"

**b) AI Service (`dreambound-project/ai-service/.env`):**

Pinecone API Key


PINECONE_API_KEY="YOUR_PINECONE_API_KEY"

Pinecone index name you will use/create


PINECONE_INDEX_NAME="dreambound" # Or your preferred name

(Optional) Define the LLM model to use (e.g., Mistral if Llama 2 access is problematic)


Path to the downloaded GGUF model file (relative to llama_service.py)
Download from Hugging Face (e.g., TheBloke/Mistral-7B-Instruct-v0.2-GGUF)
Example uses Q4_K_M quantization
LLAMA_GGUF_MODEL_PATH="./models/mistral-7b-instruct-v0.2.Q4_K_M.gguf"


Required for downloading models (ensure it has read permissions and access to public gated repos)


HUGGING_FACE_TOKEN="hf_YOUR_HUGGING_FACE_TOKEN"

### 3\. AI Service Setup & Run (Python)

Navigate to the AI service directory


cd ai-service

Create and activate a virtual environment (recommended)


python3 -m venv venv source venv/bin/activate # Linux/macOS

.\venv\Scripts\activate # Windows


Install Python dependencies


pip install --upgrade pip pip install -r requirements.txt

Authenticate with Hugging Face CLI (if not done already)


huggingface-cli login # Paste your token when prompted

Index Jungian concepts into Pinecone (ONLY THE FIRST TIME or if concepts change)


Make sure to review/modify metadata in populate_pinecone.py first


python populate_pinecone.py

Start the Flask server (can take a LONG time the first time while downloading the LLM)


python llama_service.py

*Leave this terminal open.*

### 4\. Backend Setup & Run (Node.js)

*Open a **new terminal**.*

Navigate to the backend directory


cd ../backend # Or the full path from the root

Install Node.js dependencies


npm install

Start the Node.js development server


npm run dev

*Leave this terminal open.*

### 5\. Frontend Setup & Run (Vue)

*Open a **third terminal**.*

Navigate to the project root directory

cd .. # Or the full path from the root

Install frontend dependencies

npm install

Start the Vite development server


npm run dev

*Leave this terminal open.*

### 6\. Accessing the Application

Open your browser and navigate to the address provided by Vite (usually `http://localhost:5173`).

🎨 Design Philosophy
--------------------

Dreamscape features a mystical, ethereal design that reflects the depth and mystery of the unconscious mind. The interface combines:

-   Starry background animations
-   Glassmorphic UI elements
-   Subtle hover effects
-   Typography that enhances readability
-   Responsive design for all devices

📱 Responsive Design
--------------------

The application is fully responsive and optimized for:

-   Desktop computers
-   Tablets
-   Mobile devices

🔒 Security Features
--------------------

-   JWT-based authentication
-   Secure password handling (bcrypt)
-   Protected routes (using middleware)
-   Session management (via tokens)

🤝 Contributing
---------------

Contributions are welcome! Please feel free to submit a Pull Request.

📄 License
----------

This project is licensed under the MIT License - see the LICENSE file for details.
