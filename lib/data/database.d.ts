import Service from '../runtime/service';
import Model from './model';
import ORMAdapter from './orm-adapter';
export default class DatabaseService extends Service {
    find(modelType: string, id: any, options?: any): Promise<Model | null>;
    queryOne(modelType: string, query: any, options?: any): Promise<Model | null>;
    query(modelType: string, query: any, options?: any): Promise<Model[]>;
    all(modelType: string, options?: any): Promise<Model[]>;
    create(modelType: string, data: any, options?: any): Model;
    protected lookupAdapter(modelType: string): ORMAdapter;
}
