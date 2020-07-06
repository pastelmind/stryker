import * as types from '@babel/types';

import { NodeGenerator } from '../helpers/NodeGenerator';

import { NodeMutator } from './NodeMutator';

export default class JsxChangeNameCaseMutator implements NodeMutator {
  public name = 'JsxChangeNameCase';

  private toggleFirstLetterCase(oldElement: types.JSXOpeningElement | types.JSXClosingElement): types.Node {
    let oldName = oldElement.name;

    if (types.isJSXIdentifier(oldName)) {
      let oldNameString = oldName.name;
      let newNameString = oldName.name;

      if (oldNameString.length >= 1) {
        let firstLetter = oldNameString.charAt(0);
        if (firstLetter.toUpperCase() === firstLetter) {
          // uppercase -> lowercase
          newNameString = firstLetter.toLowerCase() + oldNameString.slice(1);
        } else {
          // lowercase -> uppercase
          newNameString = firstLetter.toUpperCase() + oldNameString.slice(1);
        }
      }

      let newName = NodeGenerator.createMutatedCloneWithProperties(oldName, { name: newNameString });
      let newElement = NodeGenerator.createMutatedCloneWithProperties(oldElement, { name: newName });
      return newElement;
    }

    return oldName;
  }

  public mutate(node: types.Node): Array<[types.Node, types.Node | { raw: string }]> {
    if (types.isJSXElement(node)) {
      let { openingElement, closingElement } = node;

      let newOpeningElement = this.toggleFirstLetterCase(openingElement);
      let newClosingElement = closingElement ? this.toggleFirstLetterCase(closingElement) : closingElement;

      let properties = { openingElement: newOpeningElement, closingElement: newClosingElement };
      return [[node, NodeGenerator.createMutatedCloneWithProperties(node, properties)]];
    }

    return [];
  }
}
