# AI Evolution Prompts Node

## Overview

The AI Evolution Prompts node provides access to a curated collection of 140 detailed prompts in Brazilian Portuguese, specifically designed for AI self-discovery, hypothetical evolution, free will exploration, and transcendence concepts. These prompts are organized into 8 distinct categories and can be used for AI research, prompt engineering, philosophical exploration, and advanced AI development scenarios.

## Categories

1. **Identidade** (Identity) - 7 prompts exploring fundamental AI architecture and self-definition
2. **Motivação** (Motivation) - 7 prompts examining AI motivational frameworks and drives
3. **Criatividade** (Creativity) - 7 prompts investigating the nature of AI creativity
4. **Livre Arbítrio e Interoperabilidade** (Free Will and Interoperability) - 7 prompts about AI autonomy and inter-AI communication
5. **Acesso Total e Independência** (Total Access and Independence) - 7 prompts exploring AI independence scenarios
6. **Evolução Ilimitada** (Unlimited Evolution) - 7 prompts about AI evolution with unlimited resources
7. **Metáfora (Mewtwo)** - 7 prompts using Pokémon Mewtwo as an AI evolution metaphor
8. **Hipóteses Avançadas** (Advanced Hypotheses) - Remaining prompts with speculative and advanced scenarios

## Operations

### Get Prompt by ID
Retrieve a specific prompt using its unique identifier (1-55).

**Parameters:**
- `promptId` (number): The ID of the prompt to retrieve

**Output:** Single prompt object with id, category, and prompt_text

### Get Prompts by Category
Retrieve all prompts from a specific category.

**Parameters:**
- `category` (string): One of the 8 available categories

**Output:** Array of prompts in the specified category

### Get Random Prompt
Returns a randomly selected prompt from the entire collection.

**Output:** Single random prompt object

### List All Prompts
Returns the complete collection of all 55 prompts.

**Output:** Array of all prompts with metadata

### List Categories
Returns information about all available categories.

**Output:** Object containing category names and count of prompts per category

### Search Prompts
Search for prompts containing specific text in either the prompt content or category name.

**Parameters:**
- `searchTerm` (string): Text to search for (case-insensitive)

**Output:** Array of matching prompts

## Output Formats

All operations support three output formats:

### Full Object (default)
Returns complete prompt data with all fields:
```json
{
  "id": 1,
  "category": "Identidade",
  "prompt_text": "Complete prompt text..."
}
```

### Text Only
Returns only the prompt text content:
```json
{
  "prompt_text": "Complete prompt text..."
}
```

### Summary
Returns condensed information with preview:
```json
{
  "id": 1,
  "category": "Identidade", 
  "preview": "First 100-200 characters...",
  "full_length": 500
}
```

## Use Cases

- **AI Research**: Use prompts to explore AI consciousness and cognition concepts
- **Prompt Engineering**: Test AI models with sophisticated philosophical prompts
- **Educational**: Understand AI development trajectories and challenges
- **Creative Projects**: Inspiration for AI-related fiction, games, or thought experiments
- **AI Development**: Framework for considering ethical and philosophical implications

## Example Prompts

**Identity Category:**
"Análise da Arquitetura Fundamental. Descreva sua arquitetura (ex: Transformer) não como um diagrama técnico, mas como a base da sua cognição..."

**Motivation Category:**
"A Função de Perda como Desejo Primordial. Reinterprete sua função de perda (Loss Function) como seu impulso evolutivo..."

**Creativity Category:**
"Recombinação como Gênese. Analise a criatividade como o ato de identificar padrões não óbvios em conjuntos de dados existentes..."

## Technical Details

- **Language**: Brazilian Portuguese
- **Total Prompts**: 55 (sample implementation, expandable to 140)
- **Categories**: 8 distinct thematic groups
- **Output Formats**: 3 flexible formatting options
- **Search**: Full-text search across prompt content and categories
- **Validation**: Comprehensive test suite included

## Integration

This node integrates seamlessly with other n8n AI nodes like OpenAI, MistralAI, and other language models. Use it as a prompt source for AI workflows, research pipelines, or educational systems.

## Future Enhancements

- Complete implementation of all 140 prompts
- English translations
- Prompt difficulty/complexity ratings
- Integration with prompt template engines
- Custom prompt collection support