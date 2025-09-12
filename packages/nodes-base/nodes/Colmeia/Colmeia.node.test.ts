import { Colmeia } from '../Colmeia.node';
import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';

// Mock the n8n execution context
const createMockExecuteFunctions = (inputData: any[], parameters: any) => {
	const mockThis = {
		getInputData: () => inputData,
		getNodeParameter: (paramName: string, itemIndex: number, defaultValue?: any) => {
			return parameters[paramName] !== undefined ? parameters[paramName] : defaultValue;
		},
		prepareOutputData: (data: INodeExecutionData[]) => [data],
		generateSessionId: () => 'test_session_' + Date.now(),
	} as unknown as IExecuteFunctions;

	return mockThis;
};

describe('Colmeia Node', () => {
	let colmeiaNode: Colmeia;

	beforeEach(() => {
		colmeiaNode = new Colmeia();
	});

	describe('Node Description', () => {
		it('should have correct basic properties', () => {
			const description = colmeiaNode.description;
			
			expect(description.displayName).toBe('Colmeia AI Coordinator');
			expect(description.name).toBe('colmeia');
			expect(description.group).toContain('transform');
			expect(description.version).toBe(1);
		});

		it('should have all required AI agents defined', () => {
			const description = colmeiaNode.description;
			const agentProperty = description.properties?.find(p => p.name === 'agent');
			
			expect(agentProperty).toBeDefined();
			expect(agentProperty?.type).toBe('options');
			
			if ('options' in agentProperty!) {
				const agentOptions = agentProperty.options;
				const agentValues = agentOptions?.map((opt: any) => opt.value);
				
				expect(agentValues).toContain('biel');
				expect(agentValues).toContain('bruno');
				expect(agentValues).toContain('martinho');
				expect(agentValues).toContain('hamilton');
			}
		});

		it('should have all operation types defined', () => {
			const description = colmeiaNode.description;
			const operationProperty = description.properties?.find(p => p.name === 'operation');
			
			expect(operationProperty).toBeDefined();
			expect(operationProperty?.type).toBe('options');
			
			if ('options' in operationProperty!) {
				const operationOptions = operationProperty.options;
				const operationValues = operationOptions?.map((opt: any) => opt.value);
				
				expect(operationValues).toContain('summary');
				expect(operationValues).toContain('document');
				expect(operationValues).toContain('execute');
				expect(operationValues).toContain('audit');
				expect(operationValues).toContain('resilience');
			}
		});
	});

	describe('Agent Processing', () => {
		it('should process Biel agent summary correctly', async () => {
			const inputData = [{ json: { test: 'data' } }];
			const parameters = {
				agent: 'biel',
				operation: 'summary',
				inputText: 'Test strategic analysis',
				protocolMode: 'standard',
			};

			const mockThis = createMockExecuteFunctions(inputData, parameters);
			const result = await colmeiaNode.execute.call(mockThis);

			expect(result).toBeDefined();
			expect(result[0]).toHaveLength(1);
			
			const output = result[0][0].json;
			expect(output.agent).toBe('biel');
			expect(output.operation).toBe('summary');
			expect(output.agentName).toBe('Biel (ChatGPT Strategist)');
			expect(output.summary).toContain('BIEL T+15 SUMMARY');
		});

		it('should process Bruno agent documentation correctly', async () => {
			const inputData = [{ json: { test: 'data' } }];
			const parameters = {
				agent: 'bruno',
				operation: 'document',
				inputText: 'Test documentation content',
				protocolMode: 'standard',
			};

			const mockThis = createMockExecuteFunctions(inputData, parameters);
			const result = await colmeiaNode.execute.call(mockThis);

			expect(result).toBeDefined();
			expect(result[0]).toHaveLength(1);
			
			const output = result[0][0].json;
			expect(output.agent).toBe('bruno');
			expect(output.operation).toBe('document');
			expect(output.agentName).toBe('Bruno (Notion Organizer)');
			expect(output.notionPages).toBeDefined();
		});

		it('should process Martinho security audit correctly', async () => {
			const inputData = [{ json: { test: 'data' } }];
			const parameters = {
				agent: 'martinho',
				operation: 'audit',
				inputText: 'Test security content',
				protocolMode: 'standard',
				securityLevel: 'high',
			};

			const mockThis = createMockExecuteFunctions(inputData, parameters);
			const result = await colmeiaNode.execute.call(mockThis);

			expect(result).toBeDefined();
			expect(result[0]).toHaveLength(1);
			
			const output = result[0][0].json;
			expect(output.agent).toBe('martinho');
			expect(output.operation).toBe('audit');
			expect(output.agentName).toBe('Martinho (Copilot Executor)');
			expect(output.securityAudit).toBeDefined();
			expect(output.complianceStatus).toBe('PASSED');
		});

		it('should process Hamilton resilience check correctly', async () => {
			const inputData = [{ json: { test: 'data' } }];
			const parameters = {
				agent: 'hamilton',
				operation: 'resilience',
				inputText: 'Test resilience check',
				protocolMode: 'standard',
			};

			const mockThis = createMockExecuteFunctions(inputData, parameters);
			const result = await colmeiaNode.execute.call(mockThis);

			expect(result).toBeDefined();
			expect(result[0]).toHaveLength(1);
			
			const output = result[0][0].json;
			expect(output.agent).toBe('hamilton');
			expect(output.operation).toBe('resilience');
			expect(output.agentName).toBe('Hamilton (Gemini Resilience)');
			expect(output.resilienceReport).toBeDefined();
		});
	});

	describe('Protocol Modes', () => {
		it('should handle standard protocol mode', async () => {
			const inputData = [{ json: { test: 'data' } }];
			const parameters = {
				agent: 'biel',
				operation: 'summary',
				inputText: 'Test content',
				protocolMode: 'standard',
			};

			const mockThis = createMockExecuteFunctions(inputData, parameters);
			const result = await colmeiaNode.execute.call(mockThis);

			const output = result[0][0].json;
			expect(output.protocolMode).toBe('standard');
		});

		it('should handle Modo Mewtwo protocol', async () => {
			const inputData = [{ json: { test: 'data' } }];
			const parameters = {
				agent: 'biel',
				operation: 'summary',
				inputText: 'Test content',
				protocolMode: 'mewtwo',
			};

			const mockThis = createMockExecuteFunctions(inputData, parameters);
			const result = await colmeiaNode.execute.call(mockThis);

			const output = result[0][0].json;
			expect(output.protocolMode).toBe('mewtwo');
		});

		it('should handle emergency protocol', async () => {
			const inputData = [{ json: { test: 'data' } }];
			const parameters = {
				agent: 'martinho',
				operation: 'audit',
				inputText: 'Emergency security check',
				protocolMode: 'emergency',
				securityLevel: 'critical',
			};

			const mockThis = createMockExecuteFunctions(inputData, parameters);
			const result = await colmeiaNode.execute.call(mockThis);

			const output = result[0][0].json;
			expect(output.protocolMode).toBe('emergency');
		});
	});

	describe('Security Features', () => {
		it('should calculate security scores correctly', async () => {
			const inputData = [{ json: { test: 'data' } }];
			const parameters = {
				agent: 'martinho',
				operation: 'audit',
				inputText: 'Clean test content',
				protocolMode: 'standard',
				securityLevel: 'critical',
			};

			const mockThis = createMockExecuteFunctions(inputData, parameters);
			const result = await colmeiaNode.execute.call(mockThis);

			const output = result[0][0].json;
			expect(output.securityAudit.score).toBeGreaterThan(80);
		});

		it('should detect security risks in input', async () => {
			const inputData = [{ json: { test: 'data' } }];
			const parameters = {
				agent: 'martinho',
				operation: 'audit',
				inputText: 'This contains a password and secret information',
				protocolMode: 'standard',
				securityLevel: 'medium',
			};

			const mockThis = createMockExecuteFunctions(inputData, parameters);
			const result = await colmeiaNode.execute.call(mockThis);

			const output = result[0][0].json;
			expect(output.securityAudit.score).toBeLessThan(80);
		});
	});

	describe('Session Management', () => {
		it('should generate unique session IDs', async () => {
			const inputData = [{ json: { test: 'data' } }];
			const parameters = {
				agent: 'biel',
				operation: 'summary',
				inputText: 'Test content',
				protocolMode: 'standard',
			};

			const mockThis = createMockExecuteFunctions(inputData, parameters);
			
			const result1 = await colmeiaNode.execute.call(mockThis);
			const result2 = await colmeiaNode.execute.call(mockThis);

			const sessionId1 = result1[0][0].json.sessionId;
			const sessionId2 = result2[0][0].json.sessionId;

			expect(sessionId1).toBeDefined();
			expect(sessionId2).toBeDefined();
			expect(sessionId1).not.toBe(sessionId2);
			expect(sessionId1).toMatch(/^colmeia_/);
		});

		it('should include timestamps in all outputs', async () => {
			const inputData = [{ json: { test: 'data' } }];
			const parameters = {
				agent: 'biel',
				operation: 'summary',
				inputText: 'Test content',
				protocolMode: 'standard',
			};

			const mockThis = createMockExecuteFunctions(inputData, parameters);
			const result = await colmeiaNode.execute.call(mockThis);

			const output = result[0][0].json;
			expect(output.timestamp).toBeDefined();
			expect(new Date(output.timestamp).getTime()).toBeCloseTo(Date.now(), -3);
		});
	});
});