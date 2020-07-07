import ExpectMutation from '@stryker-mutator/mutator-specification/src/ExpectMutation';
import { expect } from 'chai';

import LifecycleMethodSwapMutator from '../../../src/mutators/LifecycleMethodSwapMutator';
import { verifySpecification } from '../../helpers/mutatorAssertions';

function LifecycleMethodSwapMutatorSpec(name: string, expectMutation: ExpectMutation) {
  describe('LifecycleMethodSwapMutator', () => {
    it('should have name "LifecycleMethodSwap"', () => {
      expect(name).eq('LifecycleMethodSwap');
    });

    it('should mutate lifecycle methods in classes', () => {
      expectMutation(
        `
          class MyComponent extends React.Component {
            shouldComponentUpdate(props, state) { return props.user !== state.user; }
            render() { return <div>Hello, world!</div>; }
          };
        `,
        `
          class MyComponent extends React.Component {
            componentDidUpdate(props, state) { return props.user !== state.user; }
            render() { return <div>Hello, world!</div>; }
          };
        `,
        `
          class MyComponent extends React.Component {
            UNSAFE_componentWillUpdate(props, state) { return props.user !== state.user; }
            render() { return <div>Hello, world!</div>; }
          };
        `
      );

      expectMutation(
        `
          class MyComponent extends React.Component {
            "componentDidUpdate"(props, state) {
              return props.user !== state.user;
            }
            render() { return <div>Hello, world!</div>; }
          };
        `,
        `
          class MyComponent extends React.Component {
            "shouldComponentUpdate"(props, state) { return props.user !== state.user; }
            render() { return <div>Hello, world!</div>; }
          };
        `,
        `
          class MyComponent extends React.Component {
            "UNSAFE_componentWillUpdate"(props, state) { return props.user !== state.user; }
            render() { return <div>Hello, world!</div>; }
          };
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

verifySpecification(LifecycleMethodSwapMutatorSpec, LifecycleMethodSwapMutator);
