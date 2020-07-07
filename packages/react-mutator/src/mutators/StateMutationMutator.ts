import * as types from '@babel/types';

import { NodeMutator } from './NodeMutator';

export default class StateMutationMutator implements NodeMutator {
  public name = 'StateMutation';

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

  private makeAssignmentStatement(property: types.ObjectProperty): types.ExpressionStatement | null {
    if (types.isExpression(property.value)) {
      let thisStateExpression = types.memberExpression(types.thisExpression(), types.identifier('state'), false);
      let leftExpression;

      if (property.computed) {
        // computed key;
        // always use this.state[]
        leftExpression = types.memberExpression(thisStateExpression, property.key, true);
      } else {
        // identifier or string key;
        // use this.state.identifier or this.state["string"]
        if (types.isIdentifier(property.key) || types.isStringLiteral(property.key)) {
          let isComputed = types.isStringLiteral(property.key);
          leftExpression = types.memberExpression(thisStateExpression, property.key, isComputed);
        }
      }

      if (leftExpression) {
        return types.expressionStatement(types.assignmentExpression('=', leftExpression, property.value));
      }
    }

    return null;
  }

  public mutate(node: types.Node): Array<[types.Node, types.Node | { raw: string }]> {
    if (types.isExpressionStatement(node) && types.isCallExpression(node.expression)) {
      let { callee, arguments: args } = node.expression;

      if (this.isSetStateMemberFunction(callee)) {
        if (args.length === 1) {
          // Single-argument form of setState():
          //    this.setState({ name1: value1, name2: value2, ... });
          let objectArg = args[0];
          if (types.isObjectExpression(objectArg)) {
            let { properties } = objectArg;

            if (properties.length === 1) {
              // Single-argument form of setState() with only one change:
              //    this.setState({ name: value });
              // Will be replaced with:
              //    this.state.name = value;
              let property = properties[0];
              if (types.isObjectProperty(property)) {
                let assignmentStatement = this.makeAssignmentStatement(property);
                if (assignmentStatement) {
                  return [[node, assignmentStatement]];
                }
              }
            } else {
              // Single-argument form of setState() with multiple changes:
              //    this.setState({ name1: value1, name2: value2, ... });
              // Will be replaced with:
              //    {
              //      this.state.name1 = value1;
              //      this.state.name2 = value2;
              //      // ...
              //    }
              let assignStatements = [];

              for (let property of objectArg.properties) {
                if (types.isObjectProperty(property)) {
                  let assignmentStatement = this.makeAssignmentStatement(property);
                  if (assignmentStatement) {
                    assignStatements.push(assignmentStatement);
                    continue;
                  }
                }
                return [];
              }

              return [[node, types.blockStatement(assignStatements)]];
            }
          }
        }
      }
    }

    return [];
  }
}
