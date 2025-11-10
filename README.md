# VietRide AI

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/dacbuione/vietride-ai)

An AI-powered platform to seamlessly book car and bus tickets across Vietnam.

## About The Project

VietRide AI is a modern, visually stunning web application designed to simplify the process of booking car and bus tickets in Vietnam. The platform features a dual-interface approach: a classic, intuitive search form for users who prefer a traditional booking method, and a powerful, integrated AI agent for those who want a conversational experience.

The AI, powered by Cloudflare Agents, can understand natural language queries to find routes, compare prices, and guide users through the booking process. The entire application is built on Cloudflare's serverless stack, ensuring high performance and scalability. The UI is meticulously crafted with a focus on visual excellence, featuring a sophisticated color palette, elegant typography, smooth animations, and a fully responsive design that provides a seamless experience on any device.

## Key Features

*   **Dual Booking Interface**: Choose between a traditional search form or a conversational AI agent.
*   **AI-Powered Chat**: Use natural language to find and book tickets with our Cloudflare-powered AI assistant.
*   **Serverless Architecture**: Built entirely on the Cloudflare stack for speed, reliability, and infinite scalability.
*   **Visually Stunning UI**: A clean, modern, and fully responsive interface built with shadcn/ui and Tailwind CSS.
*   **Persistent Conversations**: Chat history is saved across sessions using Durable Objects.
*   **Extensible Tooling**: The AI agent can be easily extended with new tools to enhance its capabilities.

## Technology Stack

**Frontend:**
*   [React](https://react.dev/)
*   [Vite](https://vitejs.dev/)
*   [TypeScript](https://www.typescriptlang.org/)
*   [Tailwind CSS](https://tailwindcss.com/)
*   [shadcn/ui](https://ui.shadcn.com/)
*   [Framer Motion](https://www.framer.com/motion/)
*   [Zustand](https://zustand-demo.pmnd.rs/)

**Backend:**
*   [Cloudflare Workers](https://workers.cloudflare.com/)
*   [Hono](https://hono.dev/)
*   [Cloudflare Agents (Durable Objects)](https://developers.cloudflare.com/workers/agents/)

**AI & Integrations:**
*   [OpenAI SDK](https://github.com/openai/openai-node)
*   [Cloudflare AI Gateway](https://developers.cloudflare.com/ai-gateway/)

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   [Node.js](https://nodejs.org/) (v18 or later recommended)
*   [Bun](https://bun.sh/)
*   [Git](https://git-scm.com/)
*   A Cloudflare account

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/vietride-ai.git
    cd vietride-ai
    ```

2.  **Install dependencies:**
    ```sh
    bun install
    ```

### Environment Variables

To run this project, you will need to add the following environment variables to a `.dev.vars` file in the root of your project. This file is used by Wrangler for local development.

```ini
# .dev.vars

# Your Cloudflare AI Gateway URL
CF_AI_BASE_URL="https://gateway.ai.cloudflare.com/v1/YOUR_ACCOUNT_ID/YOUR_GATEWAY_NAME/openai"

# Your Cloudflare API Key with AI Gateway permissions
CF_AI_API_KEY="YOUR_CLOUDFLARE_API_KEY"
```

Refer to the [Cloudflare AI Gateway documentation](https://developers.cloudflare.com/ai-gateway/) to set up your gateway and obtain these credentials.

## Development

To start the development server, which includes the Vite frontend and the local Cloudflare Worker, run:

```sh
bun dev
```

This command will start the application on `http://localhost:3000` (or the next available port) with hot-reloading for both the frontend and the worker.

## Deployment

Deploying the application to Cloudflare is a straightforward process.

1.  **Login to Wrangler:**
    If you haven't already, authenticate Wrangler with your Cloudflare account:
    ```sh
    bunx wrangler login
    ```

2.  **Configure Production Secrets:**
    Your environment variables need to be set as secrets for the deployed worker. Run the following commands, replacing the placeholder values with your actual credentials:
    ```sh
    bunx wrangler secret put CF_AI_BASE_URL
    # Paste your AI Gateway URL when prompted

    bunx wrangler secret put CF_AI_API_KEY
    # Paste your Cloudflare API Key when prompted
    ```

3.  **Deploy the application:**
    Run the deployment script, which builds the project and deploys it to your Cloudflare account.
    ```sh
    bun deploy
    ```

After a successful deployment, Wrangler will output the URL of your live application.

Alternatively, you can deploy directly from your GitHub repository with a single click:

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/dacbuione/vietride-ai)

## Project Structure

*   `src/`: Contains all the frontend code, including React components, pages, hooks, and styles.
*   `worker/`: Contains the backend Cloudflare Worker code, including the Hono router, the ChatAgent Durable Object, and AI integration logic.
*   `wrangler.jsonc`: Configuration file for the Cloudflare Worker, including bindings and build settings.
*   `vite.config.ts`: Configuration file for the Vite development server and build process.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.