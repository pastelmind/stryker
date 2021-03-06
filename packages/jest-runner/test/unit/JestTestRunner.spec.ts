import { RunOptions, RunStatus, TestStatus } from '@stryker-mutator/api/test_runner';
import { testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import sinon from 'sinon';

import { JestTestAdapter } from '../../src/jestTestAdapters';
import JestTestRunner from '../../src/JestTestRunner';
import * as producers from '../helpers/producers';
import { processEnvToken, jestTestAdapterToken, configLoaderToken } from '../../src/pluginTokens';
import JestConfigLoader from '../../src/configLoaders/JestConfigLoader';

describe('JestTestRunner', () => {
  const basePath = '/path/to/project/root';
  const runOptions: RunOptions = { timeout: 0 };

  let jestTestAdapterMock: sinon.SinonStubbedInstance<JestTestAdapter>;
  let jestConfigLoaderMock: sinon.SinonStubbedInstance<JestConfigLoader>;
  let jestTestRunner: JestTestRunner;
  let processEnvMock: NodeJS.ProcessEnv;

  beforeEach(() => {
    jestTestAdapterMock = { run: sinon.stub() };
    jestTestAdapterMock.run.resolves({ results: { testResults: [] } });
    jestConfigLoaderMock = { loadConfig: sinon.stub() };
    jestConfigLoaderMock.loadConfig.resolves({});

    testInjector.options.jest = { config: { property: 'value' } };
    testInjector.options.basePath = basePath;

    processEnvMock = {
      NODE_ENV: undefined,
    };

    jestTestRunner = testInjector.injector
      .provideValue(processEnvToken, processEnvMock)
      .provideValue(jestTestAdapterToken, (jestTestAdapterMock as unknown) as JestTestAdapter)
      .provideValue(configLoaderToken, jestConfigLoaderMock)
      .injectClass(JestTestRunner);
  });

  it('should log the project root when constructing the JestTestRunner', () => {
    expect(testInjector.logger.debug).calledWith(`Project root is ${basePath}`);
  });

  it('should call the run function with the provided config and the projectRoot', async () => {
    await jestTestRunner.run(runOptions);

    expect(jestTestAdapterMock.run).called;
  });

  it('should call the jestTestRunner run method and return a correct runResult', async () => {
    jestTestAdapterMock.run.resolves({ results: producers.createSuccessResult() });

    const result = await jestTestRunner.run(runOptions);

    expect(result).to.deep.equal({
      errorMessages: [],
      status: RunStatus.Complete,
      tests: [
        {
          failureMessages: [],
          name: 'App renders without crashing',
          status: TestStatus.Success,
          timeSpentMs: 23,
        },
      ],
    });
  });

  it('should call the jestTestRunner run method and return a skipped runResult', async () => {
    jestTestAdapterMock.run.resolves({ results: producers.createPendingResult() });

    const result = await jestTestRunner.run(runOptions);

    expect(result).to.deep.equal({
      errorMessages: [],
      status: RunStatus.Complete,
      tests: [
        {
          failureMessages: [],
          name: 'App renders without crashing',
          status: TestStatus.Skipped,
          timeSpentMs: 0,
        },
      ],
    });
  });

  it('should call the jestTestRunner run method and return a todo runResult', async () => {
    jestTestAdapterMock.run.resolves({ results: producers.createTodoResult() });

    const result = await jestTestRunner.run(runOptions);

    expect(result).to.deep.equal({
      errorMessages: [],
      status: RunStatus.Complete,
      tests: [
        {
          failureMessages: [],
          name: 'App renders without crashing',
          status: TestStatus.Success,
          timeSpentMs: 4,
        },
        {
          failureMessages: [],
          name: 'App renders without crashing with children',
          status: TestStatus.Skipped,
          timeSpentMs: 0,
        },
      ],
    });
  });

  it('should call the jestTestRunner run method and return a negative runResult', async () => {
    jestTestAdapterMock.run.resolves({ results: producers.createFailResult() });

    const result = await jestTestRunner.run(runOptions);

    expect(result).to.deep.equal({
      errorMessages: ['test failed - App.test.js'],
      status: RunStatus.Complete,
      tests: [
        {
          failureMessages: ['Fail message 1', 'Fail message 2'],
          name: 'App render renders without crashing',
          status: TestStatus.Failed,
          timeSpentMs: 2,
        },
        {
          failureMessages: ['Fail message 3', 'Fail message 4'],
          name: 'App render renders without crashing',
          status: TestStatus.Failed,
          timeSpentMs: 0,
        },
        {
          failureMessages: [],
          name: 'App renders without crashing',
          status: TestStatus.Success,
          timeSpentMs: 23,
        },
      ],
    });
  });

  it('should return an error result when a runtime error occurs', async () => {
    jestTestAdapterMock.run.resolves({ results: { testResults: [], numRuntimeErrorTestSuites: 1 } });

    const result = await jestTestRunner.run(runOptions);

    expect(result).to.deep.equal({
      errorMessages: [],
      status: RunStatus.Error,
      tests: [],
    });
  });

  it("should set process.env.NODE_ENV to 'test' when process.env.NODE_ENV is null", async () => {
    await jestTestRunner.run(runOptions);

    expect(processEnvMock.NODE_ENV).to.equal('test');
  });

  it('should keep the value set in process.env.NODE_ENV if not null', async () => {
    processEnvMock.NODE_ENV = 'stryker';

    await jestTestRunner.run(runOptions);

    expect(processEnvMock.NODE_ENV).to.equal('stryker');
  });

  it('should override verbose, collectCoverage, testResultsProcessor, notify and bail on all loaded configs', async () => {
    await jestTestRunner.run(runOptions);

    expect(
      jestTestAdapterMock.run.calledWith({
        bail: false,
        collectCoverage: false,
        notify: false,
        testResultsProcessor: undefined,
        verbose: false,
      })
    );
  });
});
