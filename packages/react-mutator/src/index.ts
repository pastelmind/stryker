import { commonTokens, declareFactoryPlugin, Injector, OptionsContext, PluginKind, tokens } from '@stryker-mutator/api/plugin';

import { ReactMutator } from './ReactMutator';
import { nodeMutators } from './mutators';
import { NODE_MUTATORS_TOKEN, PARSER_TOKEN } from './helpers/tokens';
import BabelParser from './helpers/BabelParser';

export const strykerPlugins = [declareFactoryPlugin(PluginKind.Mutator, 'react', reactMutatorFactory)];

function reactMutatorFactory(injector: Injector<OptionsContext>): ReactMutator {
  return injector.provideValue(NODE_MUTATORS_TOKEN, nodeMutators).provideClass(PARSER_TOKEN, BabelParser).injectClass(ReactMutator);
}
reactMutatorFactory.inject = tokens(commonTokens.injector);
