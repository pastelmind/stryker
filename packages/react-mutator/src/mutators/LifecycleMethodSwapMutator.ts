import * as types from '@babel/types';

import { NodeGenerator } from '../helpers/NodeGenerator';

import { NodeMutator } from './NodeMutator';

type MutationTuple = [types.Node, types.Node | { raw: string }];

export default class LifecycleMethodSwapMutator implements NodeMutator {
  public name = 'LifecycleMethodSwap';

  private readonly methodsToSwap: { [methodToSwap: string]: string[] } = {
    shouldComponentUpdate: ['componentDidUpdate', 'UNSAFE_componentWillUpdate'],
    componentDidUpdate: ['shouldComponentUpdate', 'UNSAFE_componentWillUpdate'],
    UNSAFE_componentWillUpdate: ['shouldComponentUpdate', 'componentDidUpdate'],
  };

  private createSwappedMutations(
    node: types.ClassMethod,
    oldMethodName: string,
    makeKeyNode: (newMethodName: string) => types.Node
  ): MutationTuple[] {
    let swappedMethodNames = this.methodsToSwap[oldMethodName];
    if (swappedMethodNames) {
      return swappedMethodNames.map((newMethodName) => {
        let newKey = makeKeyNode(newMethodName);
        let newNode = NodeGenerator.createMutatedCloneWithProperties(node, { key: newKey });
        return [node, newNode];
      });
    }

    return [];
  }

  public mutate(node: types.Node): MutationTuple[] {
    if (types.isClassMethod(node) && node.kind === 'method') {
      if (node.body.body.length > 0) {
        if (!node.computed) {
          if (types.isIdentifier(node.key)) {
            //  methodName() { /* ... */ }
            return this.createSwappedMutations(node, node.key.name, (newMethodName) =>
              NodeGenerator.createMutatedCloneWithProperties(node.key, { name: newMethodName })
            );
          } else if (types.isStringLiteral(node.key)) {
            //  "methodName"() { /* ... */ }
            return this.createSwappedMutations(node, node.key.value, (newMethodName) =>
              NodeGenerator.createMutatedCloneWithProperties(node.key, { value: newMethodName })
            );
          }
        }
      }
    }

    return [];
  }
}
