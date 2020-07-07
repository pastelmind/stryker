import ExpectMutation from '@stryker-mutator/mutator-specification/src/ExpectMutation';
import { expect } from 'chai';

import PassUnboundEventHandlerMutator from '../../../src/mutators/PassUnboundEventHandlerMutator';
import { verifySpecification } from '../../helpers/mutatorAssertions';

function PassUnboundEventHandlerMutatorSpec(name: string, expectMutation: ExpectMutation) {
  describe('PassUnboundEventHandlerMutator', () => {
    it('should have name "PassUnboundEventHandler"', () => {
      expect(name).eq('PassUnboundEventHandler');
    });

    it('should mutate event handlers in arrow functions with expression body', () => {
      expectMutation('<button onClick={() => this.handleClick()}>Click me</button>', '<button onClick={this.handleClick}>Click me</button>');

      expectMutation('<button onClick={event => this.handleClick(event)}>Click me</button>', '<button onClick={this.handleClick}>Click me</button>');
    });

    it('should mutate event handlers in arrow functions with block body that contain a single call expression', () => {
      expectMutation('<button onClick={() => { this.handleClick(); }}>Click me</button>', '<button onClick={this.handleClick}>Click me</button>');

      expectMutation(
        '<button onClick={event => { this.handleClick(event); }}>Click me</button>',
        '<button onClick={this.handleClick}>Click me</button>'
      );
    });

    it('should not mutate non-callback props', () => {
      expectMutation('<MyComponent propName="1" />'); // No mutations expected
      expectMutation('<MyComponent propName={125} />'); // No mutations expected
      expectMutation('<MyComponent propName={someValue} />'); // No mutations expected
    });
  });
}

verifySpecification(PassUnboundEventHandlerMutatorSpec, PassUnboundEventHandlerMutator);
