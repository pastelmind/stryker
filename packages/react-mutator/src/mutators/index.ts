import JsxAttributeValueNumberMutator from './JsxAttributeValueNumberMutator';
import JsxChangeNameCaseMutator from './JsxChangeNameCaseMutator';
import LifeCycleMethodSwapMutator from './LifecycleMethodSwapMutator';
import StateMutationMutator from './StateMutationMutator';

export const nodeMutators = Object.freeze([
  new JsxAttributeValueNumberMutator(),
  new JsxChangeNameCaseMutator(),
  new LifeCycleMethodSwapMutator(),
  new StateMutationMutator(),
]);
