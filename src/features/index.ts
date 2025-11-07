import { HandlerRegistry } from '../lib/router';
import { handleDocs } from './docs/docsController';

export const handlerRegistry: HandlerRegistry = {
  docs: handleDocs,
};
