import { EOL } from 'os';

import { Injector } from 'typed-inject';
import { Logger } from '@stryker-mutator/api/logging';
import { commonTokens, tokens } from '@stryker-mutator/api/plugin';
import { StrykerOptions, Mutant } from '@stryker-mutator/api/core';
import {
  DryRunResult,
  TestRunner2,
  RunStatus,
  CompleteDryRunResult,
  TestStatus,
  TestResult,
  FailedTestResult,
  ErrorDryRunResult,
} from '@stryker-mutator/api/test_runner2';
import { first } from 'rxjs/operators';

import { coreTokens } from '../di';
import { Sandbox } from '../sandbox/sandbox';
import Timer from '../utils/Timer';
import { TestRunnerPool, createTestRunnerFactory } from '../test-runner-2';
import { MutationTestReportCalculator } from '../reporters/MutationTestReportCalculator';

import { MutationTestContext } from './4-MutationTestExecutor';
import { MutantInstrumenterContext } from './2-MutantInstrumenterExecutor';

// The initial run might take a while.
// For example: angular-bootstrap takes up to 45 seconds.
// Lets take 5 minutes just to be sure
const INITIAL_RUN_TIMEOUT = 60 * 1000 * 5;
const INITIAL_TEST_RUN_MARKER = 'Initial test run';

export interface DryRunContext extends MutantInstrumenterContext {
  [coreTokens.sandbox]: Sandbox;
  [coreTokens.mutants]: readonly Mutant[];
}

/**
 * A small object that keeps the timing variables of a test run.
 */
interface Timing {
  /**
   * The time that the test runner was actually executing tests in milliseconds.
   */
  net: number;
  /**
   * the time that was spend not executing tests in milliseconds.
   * So the time it took to start the test runner and to report the result.
   */
  overhead: number;
}

function isFailedTest(testResult: TestResult): testResult is FailedTestResult {
  return testResult.status === TestStatus.Failed;
}

export class DryRunExecutor {
  public static readonly inject = tokens(commonTokens.injector, commonTokens.logger, commonTokens.options, coreTokens.timer, coreTokens.mutants);

  constructor(
    private readonly injector: Injector<DryRunContext>,
    private readonly log: Logger,
    private readonly options: StrykerOptions,
    private readonly timer: Timer,
    private readonly mutants: readonly Mutant[]
  ) {}

  public async execute(): Promise<Injector<MutationTestContext>> {
    const testRunnerInjector = this.injector
      .provideFactory(coreTokens.testRunnerFactory, createTestRunnerFactory)
      .provideClass(coreTokens.testRunnerPool, TestRunnerPool);
    const testRunnerPool = testRunnerInjector.resolve(coreTokens.testRunnerPool);
    const testRunner = await testRunnerPool.testRunner$.pipe(first()).toPromise();
    const { dryRunResult, grossTimeMS } = await this.timeDryRun(testRunner);
    this.validateResultCompleted(dryRunResult);
    const timing = this.calculateTiming(grossTimeMS, dryRunResult.tests);
    this.logInitialTestRunSucceeded(dryRunResult.tests, timing);
    if (!dryRunResult.tests.length || !this.mutants.length) {
      this.logTraceLogLevelHint();
    }
    return testRunnerInjector
      .provideValue(coreTokens.timeOverheadMS, timing.overhead)
      .provideValue(coreTokens.dryRunResult, dryRunResult)
      .provideClass(coreTokens.mutationTestReportCalculator, MutationTestReportCalculator);
  }

  private logTraceLogLevelHint() {
    if (!this.log.isTraceEnabled()) {
      this.log.info('Trouble figuring out what went wrong? Try `npx stryker run --fileLogLevel trace --logLevel debug` to get some more info.');
    }
  }

  private validateResultCompleted(runResult: DryRunResult): asserts runResult is CompleteDryRunResult {
    switch (runResult.status) {
      case RunStatus.Complete:
        const failedTests = runResult.tests.filter(isFailedTest);
        if (failedTests.length) {
          this.logFailedTestsInInitialRun(failedTests);
          throw new Error('There were failed tests in the initial test run.');
        }
        if (runResult.tests.length === 0) {
          this.log.warn('No tests were executed. Stryker will exit prematurely. Please check your configuration.');
        }
        return;
      case RunStatus.Error:
        this.logErrorsInInitialRun(runResult);
        break;
      case RunStatus.Timeout:
        this.logTimeoutInitialRun();
        break;
    }
    throw new Error('Something went wrong in the initial test run');
  }
  private async timeDryRun(testRunner: Required<TestRunner2>): Promise<{ dryRunResult: DryRunResult; grossTimeMS: number }> {
    this.timer.mark(INITIAL_TEST_RUN_MARKER);
    const dryRunResult = await testRunner.dryRun({ timeout: INITIAL_RUN_TIMEOUT, coverageAnalysis: this.options.coverageAnalysis });
    const grossTimeMS = this.timer.elapsedMs(INITIAL_TEST_RUN_MARKER);
    return { dryRunResult, grossTimeMS };
  }

  private logInitialTestRunSucceeded(tests: TestResult[], timing: Timing) {
    this.log.info(
      'Initial test run succeeded. Ran %s tests in %s (net %s ms, overhead %s ms).',
      tests.length,
      this.timer.humanReadableElapsed(),
      timing.net,
      timing.overhead
    );
  }

  /**
   * Calculates the timing variables for the test run.
   * grossTime = NetTime + overheadTime
   *
   * The overhead time is used to calculate exact timeout values during mutation testing.
   * See timeoutMS setting in README for more information on this calculation
   */
  private calculateTiming(grossTimeMS: number, tests: readonly TestResult[]): Timing {
    const netTimeMS = tests.reduce((total, test) => total + test.timeSpentMs, 0);
    const overheadTimeMS = grossTimeMS - netTimeMS;
    return {
      net: netTimeMS,
      overhead: overheadTimeMS < 0 ? 0 : overheadTimeMS,
    };
  }

  private logFailedTestsInInitialRun(failedTests: FailedTestResult[]): void {
    let message = 'One or more tests failed in the initial test run:';
    failedTests.forEach((test) => {
      message += `${EOL}\t${test.name}`;
      message += `${EOL}\t\t${test.failureMessage}`;
    });
    this.log.error(message);
  }
  private logErrorsInInitialRun(runResult: ErrorDryRunResult) {
    let message = `One or more tests resulted in an error:${EOL}\t${runResult.errorMessage}`;
    this.log.error(message);
  }

  private logTimeoutInitialRun() {
    this.log.error('Initial test run timed out!');
  }
}