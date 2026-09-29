@echo off
echo ========================================================
echo   QSTELLAR - STELLAR RAVEN MCP REMOTE BRIDGE (2026)
echo ========================================================
echo Connecting to https://raven.stellar.org/mcp ...
npx -y mcp-remote@latest https://raven.stellar.org/mcp --transport http-only
