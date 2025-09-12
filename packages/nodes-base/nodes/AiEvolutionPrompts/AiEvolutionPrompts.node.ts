import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';

import { PROMPTS_EVOLUCAO_IA, PROMPT_CATEGORIES, type PromptData, type PromptCategory } from './PromptData';

export class AiEvolutionPrompts implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'AI Evolution Prompts',
		name: 'aiEvolutionPrompts',
		icon: {
			light: 'file:aiEvolutionPrompts.svg',
			dark: 'file:aiEvolutionPrompts.svg',
		},
		group: ['utility'],
		version: 1,
		subtitle: '={{ $parameter["operation"] }}',
		description: 'Access a curated collection of AI evolution and self-discovery prompts',
		defaults: {
			name: 'AI Evolution Prompts',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Get Prompt by ID',
						value: 'getById',
						description: 'Retrieve a specific prompt by its ID',
					},
					{
						name: 'Get Prompts by Category',
						value: 'getByCategory',
						description: 'Retrieve all prompts from a specific category',
					},
					{
						name: 'Get Random Prompt',
						value: 'getRandom',
						description: 'Get a random prompt from the collection',
					},
					{
						name: 'List All Prompts',
						value: 'listAll',
						description: 'Retrieve all prompts in the collection',
					},
					{
						name: 'List Categories',
						value: 'listCategories',
						description: 'List all available prompt categories',
					},
					{
						name: 'Search Prompts',
						value: 'search',
						description: 'Search prompts by text content',
					},
				],
				default: 'getRandom',
			},
			{
				displayName: 'Prompt ID',
				name: 'promptId',
				type: 'number',
				default: 1,
				required: true,
				displayOptions: {
					show: {
						operation: ['getById'],
					},
				},
				description: 'The ID of the prompt to retrieve (1-55)',
			},
			{
				displayName: 'Category',
				name: 'category',
				type: 'options',
				options: PROMPT_CATEGORIES.map(cat => ({
					name: cat,
					value: cat,
				})),
				default: 'Identidade',
				required: true,
				displayOptions: {
					show: {
						operation: ['getByCategory'],
					},
				},
				description: 'The category of prompts to retrieve',
			},
			{
				displayName: 'Search Term',
				name: 'searchTerm',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						operation: ['search'],
					},
				},
				description: 'Text to search for in prompt content',
			},
			{
				displayName: 'Output Format',
				name: 'outputFormat',
				type: 'options',
				options: [
					{
						name: 'Full Object',
						value: 'full',
						description: 'Return complete prompt object with ID, category, and text',
					},
					{
						name: 'Text Only',
						value: 'textOnly',
						description: 'Return only the prompt text',
					},
					{
						name: 'Summary',
						value: 'summary',
						description: 'Return prompt with summary information',
					},
				],
				default: 'full',
				description: 'How to format the output',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			const operation = this.getNodeParameter('operation', i) as string;
			const outputFormat = this.getNodeParameter('outputFormat', i) as string;

			let result: any = {};

			try {
				switch (operation) {
					case 'getById':
						result = this.getPromptById(i);
						break;

					case 'getByCategory':
						result = this.getPromptsByCategory(i);
						break;

					case 'getRandom':
						result = this.getRandomPrompt();
						break;

					case 'listAll':
						result = this.listAllPrompts();
						break;

					case 'listCategories':
						result = this.listCategories();
						break;

					case 'search':
						result = this.searchPrompts(i);
						break;

					default:
						throw new Error(`Unknown operation: ${operation}`);
				}

				// Format output based on user preference
				const formattedResult = this.formatOutput(result, outputFormat, operation);

				returnData.push({
					json: formattedResult,
					pairedItem: {
						item: i,
					},
				});
			} catch (error) {
				returnData.push({
					json: {
						error: error.message,
						operation,
					},
					pairedItem: {
						item: i,
					},
				});
			}
		}

		return [returnData];
	}

	private getPromptById(itemIndex: number): PromptData | null {
		const promptId = this.getNodeParameter('promptId', itemIndex) as number;
		return PROMPTS_EVOLUCAO_IA.find(prompt => prompt.id === promptId) || null;
	}

	private getPromptsByCategory(itemIndex: number): PromptData[] {
		const category = this.getNodeParameter('category', itemIndex) as PromptCategory;
		return PROMPTS_EVOLUCAO_IA.filter(prompt => prompt.category === category);
	}

	private getRandomPrompt(): PromptData {
		const randomIndex = Math.floor(Math.random() * PROMPTS_EVOLUCAO_IA.length);
		return PROMPTS_EVOLUCAO_IA[randomIndex];
	}

	private listAllPrompts(): PromptData[] {
		return PROMPTS_EVOLUCAO_IA;
	}

	private listCategories(): { categories: string[], count: Record<string, number> } {
		const count: Record<string, number> = {};
		
		PROMPTS_EVOLUCAO_IA.forEach(prompt => {
			count[prompt.category] = (count[prompt.category] || 0) + 1;
		});

		return {
			categories: PROMPT_CATEGORIES.slice(),
			count,
		};
	}

	private searchPrompts(itemIndex: number): PromptData[] {
		const searchTerm = this.getNodeParameter('searchTerm', itemIndex) as string;
		const searchLower = searchTerm.toLowerCase();
		
		return PROMPTS_EVOLUCAO_IA.filter(prompt =>
			prompt.prompt_text.toLowerCase().includes(searchLower) ||
			prompt.category.toLowerCase().includes(searchLower)
		);
	}

	private formatOutput(data: any, format: string, operation: string): IDataObject {
		if (operation === 'listCategories') {
			return data;
		}

		const prompts = Array.isArray(data) ? data : [data];
		
		switch (format) {
			case 'textOnly':
				if (operation === 'listAll' || operation === 'getByCategory' || operation === 'search') {
					return {
						prompts: prompts.map((p: PromptData) => p?.prompt_text).filter(Boolean),
						count: prompts.length,
					};
				} else {
					return {
						prompt_text: prompts[0]?.prompt_text || null,
					};
				}

			case 'summary':
				if (operation === 'listAll' || operation === 'getByCategory' || operation === 'search') {
					return {
						prompts: prompts.map((p: PromptData) => ({
							id: p.id,
							category: p.category,
							preview: p.prompt_text.substring(0, 100) + '...',
						})),
						count: prompts.length,
						categories: [...new Set(prompts.map((p: PromptData) => p.category))],
					};
				} else {
					const p = prompts[0];
					return p ? {
						id: p.id,
						category: p.category,
						preview: p.prompt_text.substring(0, 200) + '...',
						full_length: p.prompt_text.length,
					} : { error: 'Prompt not found' };
				}

			case 'full':
			default:
				if (operation === 'listAll' || operation === 'getByCategory' || operation === 'search') {
					return {
						prompts,
						count: prompts.length,
						categories: [...new Set(prompts.map((p: PromptData) => p.category))],
					};
				} else {
					return prompts[0] || { error: 'Prompt not found' };
				}
		}
	}
}