# MCP Server Configuration for Aigent Project

This document describes the Model Context Protocol (MCP) servers configured for this project and how to use them.

## Configured MCP Servers

### 1. Context7
Context7 provides enhanced context management and retrieval capabilities for AI applications.

**Configuration:**
- Command: `npx -y @context7/mcp-server`
- Environment Variables: `CONTEXT7_API_KEY` (required)

**Setup:**
1. Obtain a Context7 API key from [Context7](https://context7.com)
2. Set the environment variable:
   ```bash
   # Windows
   set CONTEXT7_API_KEY=your_api_key_here

   # Linux/Mac
   export CONTEXT7_API_KEY=your_api_key_here
   ```

**Capabilities:**
- Advanced context retrieval
- Semantic search across documentation
- Context-aware code suggestions
- Knowledge base integration

### 2. Serena
Serena is a Python-based LSP (Language Server Protocol) MCP server that provides semantic code analysis for 25+ programming languages.

**Configuration:**
- Command: `uvx --from git+https://github.com/oraios/serena serena start-mcp-server`
- Repository: [https://github.com/oraios/serena](https://github.com/oraios/serena)
- No API key required (uses local language servers)
- Requires `uv` Python package manager

**Prerequisites:**
1. Install `uv` (Python package manager):
   ```bash
   # Windows (PowerShell)
   powershell -c "irm https://astral.sh/uv/install.ps1 | iex"

   # Linux/Mac
   curl -LsSf https://astral.sh/uv/install.sh | sh
   ```

**Capabilities:**
- Symbol-level code retrieval and editing
- Semantic code analysis across 25+ languages
- Language server protocol integration
- Project indexing for faster performance
- No subscription fees or external API calls
- Works with your locally installed language servers

## Using MCP Servers

### Claude Desktop Integration

To use these MCP servers with Claude Desktop:

1. Open Claude Desktop settings
2. Navigate to the MCP Servers section
3. Add the configuration from [mcp_config.json](mcp_config.json)
4. Restart Claude Desktop

### VS Code Integration

For VS Code with Claude Code extension:

1. Open VS Code settings
2. Search for "MCP"
3. Add server configurations from [mcp_config.json](mcp_config.json)
4. Reload the window

### Manual Configuration

Copy the contents of [mcp_config.json](mcp_config.json) to your Claude configuration file:

**Windows:**
```
%APPDATA%\Claude\claude_desktop_config.json
```

**macOS:**
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Linux:**
```
~/.config/Claude/claude_desktop_config.json
```

## Project-Specific MCP Considerations

As you develop your Aigent project, consider adding these additional MCP servers:

### Recommended for AI Agent Development:
- **Filesystem MCP**: For file operations and code generation
- **Memory MCP**: For persistent agent memory
- **GitHub MCP**: For repository operations and version control
- **PostgreSQL/SQLite MCP**: For database operations if needed

### Example Additional Configuration:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/your/project"]
    },
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"]
    }
  }
}
```

## Troubleshooting

### Context7 Connection Issues
- Verify your API key is correctly set
- Check network connectivity
- Ensure you have the latest version: `npm i -g @context7/mcp-server`

### Serena Not Responding
- Ensure `uv` is installed and in your PATH
- Try running manually: `uvx --from git+https://github.com/oraios/serena serena start-mcp-server`
- Check if Python is installed (uv requires Python)
- Review Serena configuration: `uvx --from git+https://github.com/oraios/serena serena config edit`
- Check Claude Desktop logs for error messages

### General MCP Issues

- Restart Claude Desktop/VS Code
- Verify JSON configuration syntax
- Check that Node.js is installed and accessible (for Context7)
- Check that Python and `uv` are installed (for Serena)
- Review logs in Claude Desktop settings

## Resources

- [MCP Documentation](https://modelcontextprotocol.io)
- [Context7 Documentation](https://context7.com/docs)
- [Serena GitHub Repository](https://github.com/oraios/serena)
- [uv Python Package Manager](https://docs.astral.sh/uv/)
- [Claude Desktop MCP Guide](https://docs.anthropic.com/claude/docs/model-context-protocol)

## Next Steps

1. Install `uv` Python package manager (for Serena)
2. Configure the MCP servers in Claude Desktop using [mcp_config.json](mcp_config.json)
3. Restart Claude Desktop
4. Test the connection by asking Claude to use Context7 or Serena capabilities
5. Add additional project-specific MCP servers as needed
