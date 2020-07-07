import JsxAttributeValueNumberMutator from './JsxAttributeValueNumberMutator';
import JsxChangeNameCaseMutator from './JsxChangeNameCaseMutator';
import LifeCycleMethodRemoveMutator from './LifecycleMethodRemoveMutator';
import LifeCycleMethodSwapMutator from './LifecycleMethodSwapMutator';
import StateMutationMutator from './StateMutationMutator';

export const nodeMutators = Object.freeze([
  new JsxAttributeValueNumberMutator(),
  new JsxChangeNameCaseMutator(),
  new LifeCycleMethodRemoveMutator(),
  new LifeCycleMethodSwapMutator(),
  new StateMutationMutator(),
]);
