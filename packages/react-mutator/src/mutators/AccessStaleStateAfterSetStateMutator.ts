import * as types from '@babel/types';

import { NodeGenerator } from '../helpers/NodeGenerator';

import { NodeMutator } from './NodeMutator';

type MutationTuple = [types.Node, types.Node | { raw: string }];

function isNotNull<T>(value: T | null): value is T {
  return value !== null;
}

export default class AccessStaleStateAfterSetStateMutator implements NodeMutator {
  public name = 'AccessStaleStateAfterSetState';

  private isSetStateMemberFunction(expression: types.Node): boolean {
    if (types.isMemberExpression(expression)) {
      let { object, property, computed } = expression;

      if (types.isThisExpression(object)) {
        if (computed) {
          // Only supports direct literals
          // ex) this["setState"]
          if (types.isStringLiteral(property) && property.value === 'setState') {
            return true;
          }
        } else {
          if (types.isIdentifier(property) && property.name === 'setState') {
            return true;
          }
        }
      }
    }

    return false;
  }

  public mutate(node: types.Node): MutationTuple[] {
    if (types.isBlockStatement(node)) {
      return node.body
        .map((statement, statementIndex): MutationTuple | null => {
          if (types.isExpressionStatement(statement) && types.isCallExpression(statement.expression)) {
            let { callee, arguments: args } = statement.expression;

            if (this.isSetStateMemberFunction(callee) && args.length == 2 && types.isArrowFunctionExpression(args[1])) {
              let arrowFunctionBody = args[1].body;
              let statementsToAppend: types.Statement[];
              if (types.isBlockStatement(arrowFunctionBody)) {
                // Ignore empty arrow functions
                if (arrowFunctionBody.body.length === 0) {
                  return null;
                }
                statementsToAppend = arrowFunctionBody.body;
              } else {
                statementsToAppend = [types.expressionStatement(arrowFunctionBody)];
              }

              let newArgs = Array.from(args);
              newArgs.splice(1, 1);
              let newCallExpression = NodeGenerator.createMutatedCloneWithProperties(statement.expression, { arguments: newArgs });
              let newCallStatement = NodeGenerator.createMutatedCloneWithProperties(statement, { expression: newCallExpression }) as typeof statement;

              let newBlockBody = Array.from(node.body);
              newBlockBody.splice(statementIndex, 1, newCallStatement, ...statementsToAppend);
              let newNode = NodeGenerator.createMutatedCloneWithProperties(node, { body: newBlockBody });
              return [node, newNode];
            }
          }

          return null;
        })
        .filter(isNotNull);
    }

    return [];
  }
}
