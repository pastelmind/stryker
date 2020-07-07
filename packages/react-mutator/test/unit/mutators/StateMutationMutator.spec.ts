import { expect } from 'chai';
import ExpectMutation from '@stryker-mutator/mutator-specification/src/ExpectMutation';

import StateMutationMutator from '../../../src/mutators/StateMutationMutator';
import { verifySpecification } from '../../helpers/mutatorAssertions';

function StateMutationMutatorSpec(name: string, expectMutation: ExpectMutation) {
  describe('StateMutationMutator', () => {
    it('should have name "StateMutation"', () => {
      expect(name).eq('StateMutation');
    });

    it('should mutate a setState() call to direct state mutation', () => {
      expectMutation('this.setState({ myValue: 5 });', 'this.state.myValue = 5;');
      expectMutation('this.setState({ "myValue": 5 });', 'this.state["myValue"] = 5;');
      expectMutation(
        'this.setState({ foo: "a", "bar": "b", ["b" + "az"]: 27 });',
        '{ this.state.foo = "a"; this.state["bar"] = "b"; this.state["b" + "az"] = 27; }'
      );
    });
  });
}

verifySpecification(StateMutationMutatorSpec, StateMutationMutator);
