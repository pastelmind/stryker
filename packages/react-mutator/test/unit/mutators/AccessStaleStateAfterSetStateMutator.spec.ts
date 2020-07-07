import ExpectMutation from '@stryker-mutator/mutator-specification/src/ExpectMutation';
import { expect } from 'chai';

import AccessStaleStateAfterSetStateMutator from '../../../src/mutators/AccessStaleStateAfterSetStateMutator';
import { verifySpecification } from '../../helpers/mutatorAssertions';

function AccessStaleStateAfterSetStateMutatorSpec(name: string, expectMutation: ExpectMutation) {
  describe('AccessStaleStateAfterSetStateMutator', () => {
    it('should have name "AccessStaleStateAfterSetState"', () => {
      expect(name).eq('AccessStaleStateAfterSetState');
    });

    it('should mutate setState() calls with first arg object and second arg callback', () => {
      expectMutation(
        '{ this.setState({ foo: "user", bar: "title" }, () => { doSomething(this.state.value); }); }',
        '{ this.setState({ foo: "user", bar: "title" }); doSomething(this.state.value); }'
      );
    });

    it('should mutate setState() calls with first arg callback and second arg callback', () => {
      expectMutation(
        '{ this.setState((s, p) => { return newState(); }, () => { a(); b(); }); }',
        '{ this.setState((s, p) => { return newState(); }); a(); b(); }'
      );
    });

    it('should mutate setState() calls with first arg object and second arg expression', () => {
      expectMutation('{ this.setState({ value: 12 }, () => expr(1 + 2)); }', '{ this.setState({ value: 12 }); expr(1 + 2); }');
    });

    it('should not mutate empty callbacks', () => {
      expectMutation('{ this.setState({ foo: "user", bar: "title" }, () => {}); }', ...[] /* no mutations expected */);
    });

    it('should not mutate setState() with no secondary callback', () => {
      expectMutation('{ this.setState({ foo: "user", bar: "title" }); }', ...[] /* no mutations expected */);
    });
  });
}

verifySpecification(AccessStaleStateAfterSetStateMutatorSpec, AccessStaleStateAfterSetStateMutator);
