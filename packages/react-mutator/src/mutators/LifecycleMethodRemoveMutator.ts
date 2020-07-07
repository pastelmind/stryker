import * as types from '@babel/types';

import { NodeGenerator } from '../helpers/NodeGenerator';

import { NodeMutator } from './NodeMutator';

type MutationTuple = [types.Node, types.Node | { raw: string }];

function isNotNull<T>(value: T | null): value is T {
  return value !== null;
}

export default class LifecycleMethodRemoveMutator implements NodeMutator {
  public name = 'LifecycleMethodRemove';

  private readonly methodsToRemove: Set<string> = new Set([
    'componentDidMount',
    'componentDidUpdate',
    'componentWillUnmount',
    'getDerivedStateFromProps',
    'shouldComponentUpdate',
    'UNSAFE_componentWillUpdate',
  ]);

  private makeMethodRemovedMutant(node: types.ClassBody, methodNodeIndex: number, methodName: string): MutationTuple | null {
    if (this.methodsToRemove.has(methodName)) {
      let newBody = Array.from(node.body);
      newBody.splice(methodNodeIndex, 1);
      let newNode = NodeGenerator.createMutatedCloneWithProperties(node, { body: newBody });
      return [node, newNode];
    }

    return null;
  }

  public mutate(node: types.Node): MutationTuple[] {
    if (types.isClassBody(node)) {
      return node.body
        .map((bodyNode, bodyNodeIndex) => {
          if (types.isClassMethod(bodyNode) && bodyNode.kind === 'method') {
            if (bodyNode.body.body.length > 0) {
              if (!bodyNode.computed) {
                if (types.isIdentifier(bodyNode.key)) {
                  //  methodName() { /* ... */ }
                  return this.makeMethodRemovedMutant(node, bodyNodeIndex, bodyNode.key.name);
                } else if (types.isStringLiteral(bodyNode.key)) {
                  //  "methodName"() { /* ... */ }
                  return this.makeMethodRemovedMutant(node, bodyNodeIndex, bodyNode.key.value);
                }
              }
            }
          }

          return null;
        })
        .filter(isNotNull);
    }

    return [];
  }
}
