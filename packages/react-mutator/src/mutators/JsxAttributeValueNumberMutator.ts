import * as types from '@babel/types';

import { NodeGenerator } from '../helpers/NodeGenerator';

import { NodeMutator } from './NodeMutator';

type MutationTuple = [types.Node, types.Node | { raw: string }];

function isNotNull<T>(value: T | null): value is T {
  return value !== null;
}

export default class JsxAttributeValueNumberMutator implements NodeMutator {
  public name = 'JsxAttributeValueNumber';

  public mutate(node: types.Node): MutationTuple[] {
    if (types.isJSXOpeningElement(node)) {
      let { attributes } = node;

      return attributes
        .map((attribute, index): MutationTuple | null => {
          if (types.isJSXAttribute(attribute)) {
            let { value } = attribute;
            let newAttribute = null;

            if (types.isJSXExpressionContainer(value)) {
              if (types.isNumericLiteral(value.expression)) {
                // <Element attribute={100} /> -> <Element attribute="100" />
                newAttribute = NodeGenerator.createMutatedCloneWithProperties(attribute, {
                  value: types.stringLiteral(String(value.expression.value)),
                }) as types.JSXAttribute;
              }
            } else if (types.isStringLiteral(value)) {
              let numberValue = Number(value.value);
              if (!Number.isNaN(numberValue)) {
                // <Element attribute="100" /> -> <Element attribute={100} />
                newAttribute = NodeGenerator.createMutatedCloneWithProperties(attribute, {
                  value: types.jsxExpressionContainer(types.numericLiteral(numberValue)),
                }) as types.JSXAttribute;
              }
            }

            if (newAttribute) {
              let newAttributes = Array.from(attributes);
              newAttributes[index] = newAttribute;
              return [node, NodeGenerator.createMutatedCloneWithProperties(node, { attributes: newAttributes })];
            }
          }

          return null;
        })
        .filter(isNotNull);
    }

    return [];
  }
}
