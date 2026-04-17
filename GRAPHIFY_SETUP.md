# Graphify MCP Server and Client Setup Instructions

These steps will help you install and configure the Graphify MCP server globally and the client locally in your repository, matching the setup used in this project.

---

## 1. Install Graphify MCP Server (Global)

1. **Install Node.js (if not already installed):**
   - Download from https://nodejs.org/ and install the latest LTS version.

2. **Install Graphify MCP server globally:**
   ```bash
   npm install -g @graphify/mcp-server
   ```

3. **Verify installation:**
   ```bash
   graphify-mcp --help
   ```
   You should see the available commands and options.

4. **(Optional) Start the MCP server:**
   ```bash
   graphify-mcp start
   ```
   By default, it runs on `localhost:9001`. You can change the port with `--port`.

---

## 2. Install Graphify Client (Local, in your repo)

1. **Navigate to your project root:**
   ```bash
   cd path/to/your/repo
   ```

2. **Install Graphify as a dev dependency:**
   ```bash
   npm install --save-dev @graphify/client
   ```

3. **(Optional) Add a `.graphifyignore` file**  
   (Already present in this repo, but for new setups, create it to exclude folders from scanning):
   ```
   old_app/archive
   old_app/images
   old_app/graphify-out
   graphify-out
   .venv
   node_modules
   dist
   build
   coverage
   .git
   ```

4. **(Optional) Add a script to your `package.json`:**
   ```json
   "scripts": {
     "graphify": "graphify"
   }
   ```

---

## 3. Run Graphify Analysis

1. **From your project root, run:**
   ```bash
   npx graphify
   ```
   or, if you added the script:
   ```bash
   npm run graphify
   ```

2. **Output:**  
   - Results will be written to `graphify-out/` (e.g., `graph.html`, `GRAPH_REPORT.md`).
   - Open `graphify-out/graph.html` in your browser to view the interactive graph.

---

## 4. Connect Client to MCP Server

- By default, the client will connect to the local MCP server at `localhost:9001`.
- If your server runs elsewhere, set the endpoint:
  ```bash
  npx graphify --mcp http://your-server:9001
  ```

---

## 5. (Optional) VS Code Integration

- If you use the Graphify VS Code extension, install it from the marketplace for enhanced UI.

---

**Summary:**
- Install the MCP server globally (`npm install -g @graphify/mcp-server`)
- Install the client locally in your repo (`npm install --save-dev @graphify/client`)
- Use `.graphifyignore` to exclude folders
- Run `npx graphify` to generate and view the graph
