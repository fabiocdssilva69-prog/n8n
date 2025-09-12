import { SafePoint } from '../SafePoint.node';
import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';

// Mock the n8n execution context
const createMockExecuteFunctions = (inputData: any[], parameters: any) => {
	const mockThis = {
		getInputData: () => inputData,
		getNodeParameter: (paramName: string, itemIndex: number, defaultValue?: any) => {
			return parameters[paramName] !== undefined ? parameters[paramName] : defaultValue;
		},
		prepareOutputData: (data: INodeExecutionData[]) => [data],
	} as unknown as IExecuteFunctions;

	return mockThis;
};

describe('SafePoint Node', () => {
	let safePointNode: SafePoint;

	beforeEach(() => {
		safePointNode = new SafePoint();
	});

	describe('Node Description', () => {
		it('should have correct basic properties', () => {
			const description = safePointNode.description;
			
			expect(description.displayName).toBe('SafePoint Backup');
			expect(description.name).toBe('safePoint');
			expect(description.group).toContain('utility');
			expect(description.version).toBe(1);
		});

		it('should have all backup operations defined', () => {
			const description = safePointNode.description;
			const operationProperty = description.properties?.find(p => p.name === 'operation');
			
			expect(operationProperty).toBeDefined();
			expect(operationProperty?.type).toBe('options');
			
			if ('options' in operationProperty!) {
				const operationOptions = operationProperty.options;
				const operationValues = operationOptions?.map((opt: any) => opt.value);
				
				expect(operationValues).toContain('backup');
				expect(operationValues).toContain('verify');
				expect(operationValues).toContain('testRestore');
				expect(operationValues).toContain('report');
				expect(operationValues).toContain('emergencyRestore');
			}
		});

		it('should have all backup types defined', () => {
			const description = safePointNode.description;
			const backupTypeProperty = description.properties?.find(p => p.name === 'backupType');
			
			expect(backupTypeProperty).toBeDefined();
			
			if ('options' in backupTypeProperty!) {
				const backupTypeOptions = backupTypeProperty.options;
				const backupTypeValues = backupTypeOptions?.map((opt: any) => opt.value);
				
				expect(backupTypeValues).toContain('daily');
				expect(backupTypeValues).toContain('weekly');
				expect(backupTypeValues).toContain('milestone');
				expect(backupTypeValues).toContain('manual');
			}
		});
	});

	describe('Backup Operations', () => {
		it('should create backup with correct structure', async () => {
			const inputData = [{ json: { test: 'data' } }];
			const parameters = {
				operation: 'backup',
				backupType: 'daily',
				dataSources: ['notion', 'config'],
				compressionLevel: 'balanced',
				encryption: true,
				remoteStorage: ['local'],
			};

			const mockThis = createMockExecuteFunctions(inputData, parameters);
			const result = await safePointNode.execute.call(mockThis);

			expect(result).toBeDefined();
			expect(result[0]).toHaveLength(1);
			
			const output = result[0][0].json;
			expect(output.operation).toBe('backup');
			expect(output.backupManifest).toBeDefined();
			expect(output.backupManifest.type).toBe('daily');
			expect(output.backupManifest.dataSources).toEqual(['notion', 'config']);
			expect(output.files).toBeDefined();
			expect(output.checksums).toBeDefined();
			expect(output.encryptionStatus).toBe('AES-256-GCM');
		});

		it('should generate unique backup IDs', async () => {
			const inputData = [{ json: { test: 'data' } }];
			const parameters = {
				operation: 'backup',
				backupType: 'manual',
				dataSources: ['notion'],
				compressionLevel: 'fast',
				encryption: false,
				remoteStorage: ['local'],
			};

			const mockThis = createMockExecuteFunctions(inputData, parameters);
			
			const result1 = await safePointNode.execute.call(mockThis);
			const result2 = await safePointNode.execute.call(mockThis);

			const backupId1 = result1[0][0].json.backupManifest.id;
			const backupId2 = result2[0][0].json.backupManifest.id;

			expect(backupId1).toBeDefined();
			expect(backupId2).toBeDefined();
			expect(backupId1).not.toBe(backupId2);
			expect(backupId1).toMatch(/^sp_/);
		});

		it('should create checksums for all data sources', async () => {
			const inputData = [{ json: { test: 'data' } }];
			const parameters = {
				operation: 'backup',
				backupType: 'weekly',
				dataSources: ['notion', 'drive', 'audio'],
				compressionLevel: 'maximum',
				encryption: true,
				remoteStorage: ['gcs', 's3'],
			};

			const mockThis = createMockExecuteFunctions(inputData, parameters);
			const result = await safePointNode.execute.call(mockThis);

			const output = result[0][0].json;
			expect(output.checksums).toBeDefined();
			expect(output.checksums.notion).toBeDefined();
			expect(output.checksums.drive).toBeDefined();
			expect(output.checksums.audio).toBeDefined();
			
			// Check SHA-256 format (64 hex characters)
			expect(output.checksums.notion).toMatch(/^[a-f0-9]{64}$/);
		});
	});

	describe('Integrity Verification', () => {
		it('should verify integrity of data sources', async () => {
			const inputData = [{ json: { test: 'data' } }];
			const parameters = {
				operation: 'verify',
				dataSources: ['notion', 'config', 'workflows'],
			};

			const mockThis = createMockExecuteFunctions(inputData, parameters);
			const result = await safePointNode.execute.call(mockThis);

			expect(result).toBeDefined();
			expect(result[0]).toHaveLength(1);
			
			const output = result[0][0].json;
			expect(output.operation).toBe('verify');
			expect(output.verificationResults).toBeDefined();
			expect(output.overallStatus).toMatch(/^(passed|failed)$/);
			expect(output.integrityScore).toBeGreaterThanOrEqual(0);
			expect(output.integrityScore).toBeLessThanOrEqual(100);
		});

		it('should provide recommendations based on verification results', async () => {
			const inputData = [{ json: { test: 'data' } }];
			const parameters = {
				operation: 'verify',
				dataSources: ['notion'],
			};

			const mockThis = createMockExecuteFunctions(inputData, parameters);
			const result = await safePointNode.execute.call(mockThis);

			const output = result[0][0].json;
			expect(output.recommendations).toBeDefined();
			expect(Array.isArray(output.recommendations)).toBe(true);
			expect(output.recommendations.length).toBeGreaterThan(0);
		});
	});

	describe('Restore Testing', () => {
		it('should perform restore test with detailed steps', async () => {
			const inputData = [{ json: { test: 'data' } }];
			const parameters = {
				operation: 'testRestore',
			};

			const mockThis = createMockExecuteFunctions(inputData, parameters);
			const result = await safePointNode.execute.call(mockThis);

			expect(result).toBeDefined();
			expect(result[0]).toHaveLength(1);
			
			const output = result[0][0].json;
			expect(output.operation).toBe('testRestore');
			expect(output.testEnvironment).toBeDefined();
			expect(output.restoreSteps).toBeDefined();
			expect(Array.isArray(output.restoreSteps)).toBe(true);
			expect(output.success).toBe(true);
			expect(output.rto).toBe('4h');
			expect(output.rpo).toBe('24h');
		});

		it('should validate all restoration steps', async () => {
			const inputData = [{ json: { test: 'data' } }];
			const parameters = {
				operation: 'testRestore',
			};

			const mockThis = createMockExecuteFunctions(inputData, parameters);
			const result = await safePointNode.execute.call(mockThis);

			const output = result[0][0].json;
			const steps = output.restoreSteps;
			
			expect(steps).toHaveLength(6);
			expect(steps.every((step: any) => step.status === 'completed')).toBe(true);
			expect(steps.every((step: any) => step.duration)).toBeDefined();
		});
	});

	describe('Reporting', () => {
		it('should generate comprehensive backup report', async () => {
			const inputData = [{ json: { test: 'data' } }];
			const parameters = {
				operation: 'report',
			};

			const mockThis = createMockExecuteFunctions(inputData, parameters);
			const result = await safePointNode.execute.call(mockThis);

			expect(result).toBeDefined();
			expect(result[0]).toHaveLength(1);
			
			const output = result[0][0].json;
			expect(output.operation).toBe('report');
			expect(output.reportPeriod).toBeDefined();
			expect(output.backupStatistics).toBeDefined();
			expect(output.integrityChecks).toBeDefined();
			expect(output.restoreTests).toBeDefined();
			expect(output.complianceStatus).toBeDefined();
		});

		it('should include performance metrics in report', async () => {
			const inputData = [{ json: { test: 'data' } }];
			const parameters = {
				operation: 'report',
			};

			const mockThis = createMockExecuteFunctions(inputData, parameters);
			const result = await safePointNode.execute.call(mockThis);

			const output = result[0][0].json;
			const stats = output.backupStatistics;
			
			expect(stats.totalBackups).toBeGreaterThan(0);
			expect(stats.successfulBackups).toBeLessThanOrEqual(stats.totalBackups);
			expect(stats.successRate).toMatch(/^\d+(\.\d+)?%$/);
			expect(stats.averageSize).toBeDefined();
		});
	});

	describe('Emergency Procedures', () => {
		it('should handle emergency restore with proper protocols', async () => {
			const inputData = [{ json: { test: 'data' } }];
			const parameters = {
				operation: 'emergencyRestore',
			};

			const mockThis = createMockExecuteFunctions(inputData, parameters);
			const result = await safePointNode.execute.call(mockThis);

			expect(result).toBeDefined();
			expect(result[0]).toHaveLength(1);
			
			const output = result[0][0].json;
			expect(output.operation).toBe('emergencyRestore');
			expect(output.emergencyProtocol).toBe('ACTIVATED');
			expect(output.priorityLevel).toBe('CRITICAL');
			expect(output.humanConfirmationRequired).toBe(true);
			expect(output.killSwitchAvailable).toBe(true);
		});

		it('should provide detailed emergency response plan', async () => {
			const inputData = [{ json: { test: 'data' } }];
			const parameters = {
				operation: 'emergencyRestore',
			};

			const mockThis = createMockExecuteFunctions(inputData, parameters);
			const result = await safePointNode.execute.call(mockThis);

			const output = result[0][0].json;
			
			expect(output.restoreSequence).toBeDefined();
			expect(Array.isArray(output.restoreSequence)).toBe(true);
			expect(output.restoreSequence.length).toBeGreaterThan(0);
			expect(output.rollbackPlan).toBeDefined();
			expect(output.rollbackPlan.available).toBe(true);
		});
	});

	describe('Security and Compliance', () => {
		it('should enforce encryption when enabled', async () => {
			const inputData = [{ json: { test: 'data' } }];
			const parameters = {
				operation: 'backup',
				backupType: 'manual',
				dataSources: ['notion'],
				encryption: true,
				remoteStorage: ['local'],
			};

			const mockThis = createMockExecuteFunctions(inputData, parameters);
			const result = await safePointNode.execute.call(mockThis);

			const output = result[0][0].json;
			expect(output.encryptionStatus).toBe('AES-256-GCM');
			
			// Check that file paths have .enc extension
			const files = output.files;
			expect(files.every((file: any) => file.path.endsWith('.enc'))).toBe(true);
		});

		it('should respect retention policies', async () => {
			const inputData = [{ json: { test: 'data' } }];
			const parameters = {
				operation: 'backup',
				backupType: 'milestone',
				dataSources: ['notion'],
				encryption: false,
				remoteStorage: ['local'],
			};

			const mockThis = createMockExecuteFunctions(inputData, parameters);
			const result = await safePointNode.execute.call(mockThis);

			const output = result[0][0].json;
			expect(output.retentionPolicy).toBeDefined();
			expect(output.retentionPolicy.days).toBe(365);
			expect(output.retentionPolicy.description).toContain('1 year');
		});

		it('should include protocol compliance metadata', async () => {
			const inputData = [{ json: { test: 'data' } }];
			const parameters = {
				operation: 'backup',
				backupType: 'daily',
				dataSources: ['config'],
				encryption: true,
				remoteStorage: ['local'],
			};

			const mockThis = createMockExecuteFunctions(inputData, parameters);
			const result = await safePointNode.execute.call(mockThis);

			const output = result[0][0].json;
			expect(output.protocolCompliance).toBe(true);
			expect(output.safePointVersion).toBe('1.0');
			expect(output.timestamp).toBeDefined();
		});
	});
});