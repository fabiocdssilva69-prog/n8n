import { AiEvolutionPrompts } from '../AiEvolutionPrompts.node';
import { PROMPTS_EVOLUCAO_IA, PROMPT_CATEGORIES } from '../PromptData';

describe('AiEvolutionPrompts', () => {
	let node: AiEvolutionPrompts;

	beforeEach(() => {
		node = new AiEvolutionPrompts();
	});

	test('should have the correct node description', () => {
		expect(node.description.name).toBe('aiEvolutionPrompts');
		expect(node.description.displayName).toBe('AI Evolution Prompts');
		expect(node.description.group).toContain('utility');
	});

	test('should have all required operations', () => {
		const operations = node.description.properties?.find(p => p.name === 'operation')?.options || [];
		const operationValues = operations.map((op: any) => op.value);
		
		expect(operationValues).toContain('getById');
		expect(operationValues).toContain('getByCategory');
		expect(operationValues).toContain('getRandom');
		expect(operationValues).toContain('listAll');
		expect(operationValues).toContain('listCategories');
		expect(operationValues).toContain('search');
	});

	test('should have prompt data', () => {
		expect(PROMPTS_EVOLUCAO_IA).toBeDefined();
		expect(PROMPTS_EVOLUCAO_IA.length).toBeGreaterThan(0);
		expect(PROMPTS_EVOLUCAO_IA[0]).toHaveProperty('id');
		expect(PROMPTS_EVOLUCAO_IA[0]).toHaveProperty('category');
		expect(PROMPTS_EVOLUCAO_IA[0]).toHaveProperty('prompt_text');
	});

	test('should have all categories defined', () => {
		expect(PROMPT_CATEGORIES).toBeDefined();
		expect(PROMPT_CATEGORIES.length).toBeGreaterThan(0);
		expect(PROMPT_CATEGORIES).toContain('Identidade');
		expect(PROMPT_CATEGORIES).toContain('Motivação');
		expect(PROMPT_CATEGORIES).toContain('Criatividade');
	});

	test('should have prompts for each category', () => {
		PROMPT_CATEGORIES.forEach(category => {
			const promptsInCategory = PROMPTS_EVOLUCAO_IA.filter(p => p.category === category);
			expect(promptsInCategory.length).toBeGreaterThan(0);
		});
	});

	test('should have unique prompt IDs', () => {
		const ids = PROMPTS_EVOLUCAO_IA.map(p => p.id);
		const uniqueIds = new Set(ids);
		expect(uniqueIds.size).toBe(ids.length);
	});

	test('should have non-empty prompt texts', () => {
		PROMPTS_EVOLUCAO_IA.forEach(prompt => {
			expect(prompt.prompt_text).toBeTruthy();
			expect(prompt.prompt_text.length).toBeGreaterThan(10);
		});
	});
});