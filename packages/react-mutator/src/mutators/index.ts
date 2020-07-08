import AccessStaleStateAfterSetStateMutator from './AccessStaleStateAfterSetStateMutator';
import JsxAttributeValueNumberMutator from './JsxAttributeValueNumberMutator';
import JsxChangeNameCaseMutator from './JsxChangeNameCaseMutator';
import LifeCycleMethodRemoveMutator from './LifecycleMethodRemoveMutator';
import LifeCycleMethodSwapMutator from './LifecycleMethodSwapMutator';
import PassUnboundEventHandlerMutator from './PassUnboundEventHandlerMutator';
import StateMutationMutator from './StateMutationMutator';

export const nodeMutators = Object.freeze([
  new AccessStaleStateAfterSetStateMutator(),
  new JsxAttributeValueNumberMutator(),
  new JsxChangeNameCaseMutator(),
  new LifeCycleMethodRemoveMutator(),
  new LifeCycleMethodSwapMutator(),
  new PassUnboundEventHandlerMutator(),
  new StateMutationMutator(),
]);
