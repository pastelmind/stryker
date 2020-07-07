import JsxChangeNameCaseMutator from './JsxChangeNameCaseMutator';
import StateMutationMutator from './StateMutationMutator';

export const nodeMutators = Object.freeze([new JsxChangeNameCaseMutator(), new StateMutationMutator()]);
