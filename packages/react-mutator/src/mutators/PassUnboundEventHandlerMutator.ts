import * as types from '@babel/types';

import { NodeGenerator } from '../helpers/NodeGenerator';

import { NodeMutator } from './NodeMutator';

type MutationTuple = [types.Node, types.Node | { raw: string }];

export default class PassUnboundEventHandlerMutator implements NodeMutator {
  public name = 'PassUnboundEventHandler';

  public mutate(node: types.Node): MutationTuple[] {
    if (types.isJSXAttribute(node) && types.isJSXExpressionContainer(node.value)) {
      let { expression } = node.value;

      if (types.isArrowFunctionExpression(expression)) {
        let arrowFunctionBody = expression.body;
        let bodyExpression: types.Expression | null = null;

        if (types.isBlockStatement(arrowFunctionBody)) {
          // If the arrow function body is a block statement, check if it contains a single expression statement.
          // If so, unwrap it.
          if (arrowFunctionBody.body.length === 1) {
            let bodyStatement = arrowFunctionBody.body[0];
            if (types.isExpressionStatement(bodyStatement)) {
              bodyExpression = bodyStatement.expression;
            }
          }
        } else {
          // If the arrow function body is a single expression, use it.
          bodyExpression = arrowFunctionBody;
        }

        if (types.isCallExpression(bodyExpression)) {
          // Unwrap the expression
          let newValue = NodeGenerator.createMutatedCloneWithProperties(node.value, { expression: bodyExpression.callee });
          let newNode = NodeGenerator.createMutatedCloneWithProperties(node, { value: newValue });
          return [[node, newNode]];
        }
      }
    }

    return [];
  }
}
