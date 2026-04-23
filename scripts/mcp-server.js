#!/usr/bin/env node
/**
 * TopCastles MCP Server
 *
 * Exposes the TopCastles dataset as MCP tools for AI assistants.
 */

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createTopCastlesMcpServer } from '../server/lib/topcastles-mcp.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataPath = join(__dirname, '../new_app/src/assets/data/castles_enriched.json');
const allCastles = JSON.parse(readFileSync(dataPath, 'utf8'));

const server = createTopCastlesMcpServer(allCastles);
const transport = new StdioServerTransport();
await server.connect(transport);
