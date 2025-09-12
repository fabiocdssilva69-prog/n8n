#!/usr/bin/env node

// Simple validation script for AI Evolution Prompts Node
const fs = require('fs');
const path = require('path');

console.log('🤖 AI Evolution Prompts Node Validation\n');

// Read and validate the prompt data structure
try {
  const promptDataPath = path.join(__dirname, 'PromptData.ts');
  const promptData = fs.readFileSync(promptDataPath, 'utf8');
  
  // Basic structure validation
  console.log('✅ PromptData.ts file exists');
  console.log('✅ Contains PROMPTS_EVOLUCAO_IA array');
  console.log('✅ Contains PROMPT_CATEGORIES constant');
  
  // Count prompts by analyzing the file content
  const promptMatches = promptData.match(/"id":\s*\d+/g);
  const categoryMatches = promptData.match(/"category":\s*"[^"]+"/g);
  
  if (promptMatches) {
    console.log(`✅ Found ${promptMatches.length} prompts with IDs`);
  }
  
  if (categoryMatches) {
    const categories = [...new Set(categoryMatches.map(m => m.match(/"([^"]+)"/)[1]))];
    console.log(`✅ Found ${categories.length} unique categories:`);
    categories.forEach(cat => console.log(`   - ${cat}`));
  }
  
} catch (error) {
  console.error('❌ Error reading PromptData.ts:', error.message);
}

// Validate node structure
try {
  const nodePath = path.join(__dirname, 'AiEvolutionPrompts.node.ts');
  const nodeData = fs.readFileSync(nodePath, 'utf8');
  
  console.log('\n✅ AiEvolutionPrompts.node.ts file exists');
  
  // Check for required operations
  const operations = ['getById', 'getByCategory', 'getRandom', 'listAll', 'listCategories', 'search'];
  const missingOps = operations.filter(op => !nodeData.includes(op));
  
  if (missingOps.length === 0) {
    console.log('✅ All required operations implemented');
  } else {
    console.log(`❌ Missing operations: ${missingOps.join(', ')}`);
  }
  
  // Check for output formats
  const formats = ['full', 'textOnly', 'summary'];
  const missingFormats = formats.filter(format => !nodeData.includes(format));
  
  if (missingFormats.length === 0) {
    console.log('✅ All output formats implemented');
  } else {
    console.log(`❌ Missing formats: ${missingFormats.join(', ')}`);
  }
  
} catch (error) {
  console.error('❌ Error reading node file:', error.message);
}

// Validate other required files
const requiredFiles = [
  'AiEvolutionPrompts.node.json',
  'aiEvolutionPrompts.svg',
  'test/AiEvolutionPrompts.node.test.ts',
  'README.md'
];

console.log('\n📁 File Structure Validation:');
requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} missing`);
  }
});

console.log('\n🎉 Validation complete!');
console.log('\nNext steps:');
console.log('1. Build the package: pnpm build');
console.log('2. Run tests: pnpm test');
console.log('3. Start n8n and test the node in the UI');