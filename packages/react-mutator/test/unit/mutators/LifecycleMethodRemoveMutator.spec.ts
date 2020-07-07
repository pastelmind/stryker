import ExpectMutation from '@stryker-mutator/mutator-specification/src/ExpectMutation';
import { expect } from 'chai';

import LifecycleMethodRemoveMutator from '../../../src/mutators/LifecycleMethodRemoveMutator';
import { verifySpecification } from '../../helpers/mutatorAssertions';

function LifecycleMethodRemoveMutatorSpec(name: string, expectMutation: ExpectMutation) {
  describe('LifecycleMethodRemoveMutator', () => {
    it('should have name "LifecycleMethodRemove"', () => {
      expect(name).eq('LifecycleMethodRemove');
    });

    it('should mutate lifecycle methods in classes', () => {
      expectMutation(
        `
          class MyComponent extends React.Component {
            shouldComponentUpdate(nextProps, nextState) { return this.state.user !== nextState.user; }
            "componentDidUpdate"(prevProps, prevState) { this.doSomething(); }
          };
        `,
        `
          class MyComponent extends React.Component { "componentDidUpdate"(prevProps, prevState) { this.doSomething(); } };
        `,
        `
          class MyComponent extends React.Component { shouldComponentUpdate(nextProps, nextState) { return this.state.user !== nextState.user; } };
        `
      );
    });

    it('should not mutate empty class methods', () => {
      expectMutation(
        `
          class MyComponent extends React.Component {
            shouldComponentUpdate(nextProps, nextState) { }
            "componentDidUpdate"(prevProps, prevState) { /* no op */ }
          };
        `,
        ...[] /* no mutations expected */
      );
    });

    it('should not mutate object methods', () => {
      expectMutation('let a = { componentDidUpdate(props, state) { return props; } };', ...[] /* no mutations expected */);
    });

    it('should not mutate functions', () => {
      expectMutation('function componentDidUpdate(props, state) { return props; }', ...[] /* no mutations expected */);
    });
  });
}

verifySpecification(LifecycleMethodRemoveMutatorSpec, LifecycleMethodRemoveMutator);
