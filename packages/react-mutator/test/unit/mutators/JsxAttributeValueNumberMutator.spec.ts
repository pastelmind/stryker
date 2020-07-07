import ExpectMutation from '@stryker-mutator/mutator-specification/src/ExpectMutation';
import { expect } from 'chai';

import JsxAttributeValueNumberMutator from '../../../src/mutators/JsxAttributeValueNumberMutator';
import { verifySpecification } from '../../helpers/mutatorAssertions';

function JsxAttributeValueNumberMutatorSpec(name: string, expectMutation: ExpectMutation) {
  describe('JsxAttributeValueNumberMutator', () => {
    it('should have name "JsxAttributeValueNumber"', () => {
      expect(name).eq('JsxAttributeValueNumber');
    });

    it('should mutate JSX attributes with number values to string values', () => {
      expectMutation('<MyButton delay={35}>Click me</MyButton>', '<MyButton delay="35">Click me</MyButton>');
      expectMutation('<Foo bar={100} />', '<Foo bar="100" />');
    });

    it('should mutate JSX attributes with string values to number values', () => {
      expectMutation('<Counter value="6"><br /></Counter>', '<Counter value={6}><br /></Counter>');
      expectMutation('<TestItem val="45" />', '<TestItem val={45} />');
    });
  });
}

verifySpecification(JsxAttributeValueNumberMutatorSpec, JsxAttributeValueNumberMutator);
