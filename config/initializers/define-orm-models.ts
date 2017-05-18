import {
  forEach
} from 'lodash';
import { all } from 'bluebird';
import Application from '../../lib/runtime/application';
import Model from '../../lib/data/model';
import ORMAdapter from '../../lib/data/orm-adapter';

export default {
  name: 'define-orm-models',

  /**
   * Find all models, group them by their orm adapter, then give each adapter the chance to define
   * any internal model representation necessary.
   */
  async initialize(application: Application): Promise<void> {
    let models: { [modelName: string]: typeof Model } = application.container.lookupAll('model');
    let modelsGroupedByAdapter = new Map();
    forEach(models, (ModelClass: typeof Model) => {
      if (ModelClass.hasOwnProperty('abstract') && ModelClass.abstract) {
        return;
      }
      // Let the model class resolve its own adapter
      let Adapter = ModelClass.getAdapter(application.container);
      if (!modelsGroupedByAdapter.has(Adapter)) {
        modelsGroupedByAdapter.set(Adapter, []);
      }
      modelsGroupedByAdapter.get(Adapter).push(ModelClass);
    });
    let definitions: any[] = [];
    modelsGroupedByAdapter.forEach((modelsForThisAdapter: typeof Model[], Adapter: ORMAdapter): void => {
      definitions.push(Adapter.defineModels(modelsForThisAdapter));
    });
    await all(definitions);
  }
};
