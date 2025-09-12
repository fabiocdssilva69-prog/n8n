# Sistema Colmeia - Triple IA

## Overview

The Sistema Colmeia (Hive System) is a comprehensive AI coordination framework implemented as n8n nodes. It orchestrates multiple AI agents working in harmony under the "Protocolo Colmeia" (Hive Protocol) with strong security, automation, and human oversight capabilities.

## Components

### AI Agents

1. **Biel (ChatGPT Strategist)**
   - Role: Strategic analysis and creative thinking
   - Capabilities: Summarization, analysis, creative writing, problem solving
   - Provider: OpenAI GPT-4

2. **Bruno (Notion Organizer)**
   - Role: Documentation and organization
   - Capabilities: Documentation, organization, knowledge management, Kanban
   - Provider: Notion AI

3. **Martinho (Copilot Executor)**
   - Role: Technical execution and security auditing
   - Capabilities: Code execution, security audit, technical validation, system monitoring
   - Provider: GitHub Copilot

4. **Hamilton (Gemini Resilience)**
   - Role: Resilience and recovery operations
   - Capabilities: Resilience analysis, recovery planning, diversity insights, failover management
   - Provider: Google Vertex AI (Gemini)

### Core Nodes

#### Colmeia AI Coordinator Node
- **File**: `Colmeia.node.ts`
- **Purpose**: Coordinate AI agents in the Triple IA system
- **Features**:
  - Multi-agent coordination
  - Protocol mode selection (Standard, Modo Mewtwo, Emergency)
  - Security level configuration
  - Session management and logging

#### SafePoint Backup Node
- **File**: `SafePoint.node.ts`
- **Purpose**: Automated backup and integrity verification system
- **Features**:
  - Automated backup creation with SHA-256 verification
  - Multiple data source support (Notion, Drive, Audio, Config, Workflows)
  - Compression and encryption
  - Remote storage integration
  - Integrity testing and restore verification
  - Emergency recovery procedures

### Workflow Templates

#### Modo Mewtwo Automation
- **File**: `modo-mewtwo.json`
- **Purpose**: Full automation workflow with human oversight
- **Features**:
  - Scheduled health checks (9 AM and 9 PM)
  - Webhook trigger for manual activation
  - Coordinated AI agent execution
  - Automatic SafePoint backup
  - Security gate with compliance verification
  - Human override and kill-switch capabilities
  - Comprehensive result aggregation

## Protocol Modes

### Standard Mode
- Normal operation with coordinated AI responses
- Medium security level
- Human oversight required for all operations

### Modo Mewtwo
- Full automation mode with enhanced capabilities
- High security level
- Supervisory human oversight
- Features: Autonomous execution, continuous logging, kill-switch available

### Emergency Mode (QAN)
- Emergency response with maximum security measures
- Critical security level
- Mandatory human oversight
- Features: Immediate isolation, enhanced monitoring, automatic rollback

## Security Features

### Core Principles
- **Minimum Privilege**: Each component has only necessary access
- **Encryption by Default**: All data encrypted in transit and at rest
- **Immutable Logs**: Audit trails cannot be modified
- **Tested Backups**: Regular restoration testing
- **Prompt Security**: Input validation and sanitization

### Backup System (SafePoint)
- Daily automated backups (14-day retention)
- Weekly comprehensive backups (90-day retention)
- Milestone backups (1-year retention)
- SHA-256 integrity verification
- AES-256-GCM encryption
- Multiple storage destinations
- Automatic restoration testing

### Emergency Protocols
- **QAN Code**: Activate all defensive protocols
- **Red Code**: System hibernation (Blue Pill)
- **Golden Code**: Reduce functionality by 50% (Thanos Snap)
- **Black Code**: Planned component shutdown (Batman Contingency)

## Installation and Usage

### Prerequisites
- n8n instance with nodes-base package
- Required API credentials:
  - OpenAI API key (for Biel)
  - Notion integration token (for Bruno)
  - GitHub Copilot access (for Martinho)
  - Google Cloud/Vertex AI credentials (for Hamilton)

### Setup
1. The nodes are automatically registered when n8n starts
2. Configure credentials for each AI provider
3. Import the Modo Mewtwo workflow template
4. Configure SafePoint backup destinations
5. Set up monitoring dashboards (optional)

### Basic Usage
1. **Single Agent Operation**: Use the Colmeia AI Coordinator node with specific agent selection
2. **Full Automation**: Deploy the Modo Mewtwo workflow template
3. **Backup Operations**: Use SafePoint node for data protection
4. **Emergency Response**: Activate emergency protocols as needed

## Configuration

The system uses `colmeia-config.json` for configuration management:
- Agent definitions and capabilities
- Protocol specifications
- Security settings
- Integration parameters
- Emergency codes

## Monitoring and Health Checks

### Automated Monitoring
- Health checks twice daily (9 AM and 9 PM)
- Security scans daily at 1 AM
- Integrity verification daily at 4 AM
- Prometheus/Grafana integration for metrics

### Human Oversight Controls
- Kill-switch available in all automation modes
- Human confirmation required for critical operations
- Audit trails for all agent activities
- Manual override capabilities

## Cultural References and Design Philosophy

The Colmeia system incorporates references from popular culture (Iron Man, Transformers, Rick & Morty, Harry Potter, Naruto, Matrix, etc.) to make the technical architecture more memorable and intuitive. This "cultural layer" helps with rapid identification and association of components with their functions.

## Development and Customization

### Adding New Agents
1. Extend the Colmeia node with new agent definitions
2. Implement agent-specific processing logic
3. Update the configuration file
4. Add appropriate workflow integrations

### Custom Protocols
1. Define new protocol modes in the configuration
2. Implement protocol-specific logic in the nodes
3. Create corresponding workflow templates
4. Update security and monitoring procedures

## Support and Documentation

For detailed implementation documentation, refer to the individual node files and the comprehensive system documentation described in the original problem statement.

## License

This implementation is part of the n8n nodes-base package and follows the same licensing terms.