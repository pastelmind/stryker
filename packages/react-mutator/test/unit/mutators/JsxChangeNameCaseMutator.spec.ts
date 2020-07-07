import ExpectMutation from '@stryker-mutator/mutator-specification/src/ExpectMutation';
import { expect } from 'chai';

import JsxChangeNameCaseMutator from '../../../src/mutators/JsxChangeNameCaseMutator';
import { verifySpecification } from '../../helpers/mutatorAssertions';

function JsxChangeNameCaseMutatorSpec(name: string, expectMutation: ExpectMutation) {
  describe('JsxChangeNameCaseMutator', () => {
    it('should have name "JsxChangeNameCase"', () => {
      expect(name).eq('JsxChangeNameCase');
    });

    it('should mutate first letter of element to lowercase', () => {
      expectMutation('<Div></Div>', '<div></div>');
      expectMutation('<MyElement></MyElement>', '<myElement></myElement>');
      expectMutation('<My-Element></My-Element>', '<my-Element></my-Element>');
    });

    it('should mutate first letter of element to uppercase', () => {
      expectMutation('<div></div>', '<Div></Div>');
      expectMutation('<myElement></myElement>', '<MyElement></MyElement>');
      expectMutation('<my-element></my-element>', '<My-element></My-element>');
    });
  });
}

verifySpecification(JsxChangeNameCaseMutatorSpec, JsxChangeNameCaseMutator);
