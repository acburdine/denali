"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const lodash_1 = require("lodash");
const bluebird_1 = require("bluebird");
exports.default = {
    name: 'define-orm-models',
    /**
     * Find all models, group them by their orm adapter, then give each adapter the chance to define
     * any internal model representation necessary.
     */
    initialize(application) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let models = application.container.lookupAll('model');
            let modelsGroupedByAdapter = new Map();
            lodash_1.forEach(models, (ModelClass) => {
                let Adapter = application.container.lookup(`orm-adapter:${ModelClass.type}`);
                if (!modelsGroupedByAdapter.has(Adapter)) {
                    modelsGroupedByAdapter.set(Adapter, []);
                }
                modelsGroupedByAdapter.get(Adapter).push(ModelClass);
            });
            let definitions = [];
            modelsGroupedByAdapter.forEach((modelsForThisAdapter, Adapter) => {
                definitions.push(Adapter.defineModels(modelsForThisAdapter));
            });
            yield bluebird_1.all(definitions);
        });
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVmaW5lLW9ybS1tb2RlbHMuanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL2FjYnVyZGluZS9Qcm9qZWN0cy9kZW5hbGkvZGVuYWxpLyIsInNvdXJjZXMiOlsiY29uZmlnL2luaXRpYWxpemVycy9kZWZpbmUtb3JtLW1vZGVscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxtQ0FFZ0I7QUFDaEIsdUNBQStCO0FBSy9CLGtCQUFlO0lBQ2IsSUFBSSxFQUFFLG1CQUFtQjtJQUV6Qjs7O09BR0c7SUFDRyxVQUFVLENBQUMsV0FBd0I7O1lBQ3ZDLElBQUksTUFBTSxHQUEwQyxXQUFXLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUM3RixJQUFJLHNCQUFzQixHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7WUFDdkMsZ0JBQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxVQUF3QjtnQkFDdkMsSUFBSSxPQUFPLEdBQUcsV0FBVyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsZUFBZ0IsVUFBVSxDQUFDLElBQUssRUFBRSxDQUFDLENBQUM7Z0JBQy9FLEVBQUUsQ0FBQyxDQUFDLENBQUMsc0JBQXNCLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDekMsc0JBQXNCLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQztnQkFDMUMsQ0FBQztnQkFDRCxzQkFBc0IsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3ZELENBQUMsQ0FBQyxDQUFDO1lBQ0gsSUFBSSxXQUFXLEdBQVUsRUFBRSxDQUFDO1lBQzVCLHNCQUFzQixDQUFDLE9BQU8sQ0FBQyxDQUFDLG9CQUFvQyxFQUFFLE9BQW1CO2dCQUN2RixXQUFXLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDO1lBQy9ELENBQUMsQ0FBQyxDQUFDO1lBQ0gsTUFBTSxjQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDekIsQ0FBQztLQUFBO0NBQ0YsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIGZvckVhY2hcbn0gZnJvbSAnbG9kYXNoJztcbmltcG9ydCB7IGFsbCB9IGZyb20gJ2JsdWViaXJkJztcbmltcG9ydCBBcHBsaWNhdGlvbiBmcm9tICcuLi8uLi9saWIvcnVudGltZS9hcHBsaWNhdGlvbic7XG5pbXBvcnQgTW9kZWwgZnJvbSAnLi4vLi4vbGliL2RhdGEvbW9kZWwnO1xuaW1wb3J0IE9STUFkYXB0ZXIgZnJvbSAnLi4vLi4vbGliL2RhdGEvb3JtLWFkYXB0ZXInO1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIG5hbWU6ICdkZWZpbmUtb3JtLW1vZGVscycsXG5cbiAgLyoqXG4gICAqIEZpbmQgYWxsIG1vZGVscywgZ3JvdXAgdGhlbSBieSB0aGVpciBvcm0gYWRhcHRlciwgdGhlbiBnaXZlIGVhY2ggYWRhcHRlciB0aGUgY2hhbmNlIHRvIGRlZmluZVxuICAgKiBhbnkgaW50ZXJuYWwgbW9kZWwgcmVwcmVzZW50YXRpb24gbmVjZXNzYXJ5LlxuICAgKi9cbiAgYXN5bmMgaW5pdGlhbGl6ZShhcHBsaWNhdGlvbjogQXBwbGljYXRpb24pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBsZXQgbW9kZWxzOiB7IFttb2RlbE5hbWU6IHN0cmluZ106IHR5cGVvZiBNb2RlbCB9ID0gYXBwbGljYXRpb24uY29udGFpbmVyLmxvb2t1cEFsbCgnbW9kZWwnKTtcbiAgICBsZXQgbW9kZWxzR3JvdXBlZEJ5QWRhcHRlciA9IG5ldyBNYXAoKTtcbiAgICBmb3JFYWNoKG1vZGVscywgKE1vZGVsQ2xhc3M6IHR5cGVvZiBNb2RlbCkgPT4ge1xuICAgICAgbGV0IEFkYXB0ZXIgPSBhcHBsaWNhdGlvbi5jb250YWluZXIubG9va3VwKGBvcm0tYWRhcHRlcjokeyBNb2RlbENsYXNzLnR5cGUgfWApO1xuICAgICAgaWYgKCFtb2RlbHNHcm91cGVkQnlBZGFwdGVyLmhhcyhBZGFwdGVyKSkge1xuICAgICAgICBtb2RlbHNHcm91cGVkQnlBZGFwdGVyLnNldChBZGFwdGVyLCBbXSk7XG4gICAgICB9XG4gICAgICBtb2RlbHNHcm91cGVkQnlBZGFwdGVyLmdldChBZGFwdGVyKS5wdXNoKE1vZGVsQ2xhc3MpO1xuICAgIH0pO1xuICAgIGxldCBkZWZpbml0aW9uczogYW55W10gPSBbXTtcbiAgICBtb2RlbHNHcm91cGVkQnlBZGFwdGVyLmZvckVhY2goKG1vZGVsc0ZvclRoaXNBZGFwdGVyOiB0eXBlb2YgTW9kZWxbXSwgQWRhcHRlcjogT1JNQWRhcHRlcik6IHZvaWQgPT4ge1xuICAgICAgZGVmaW5pdGlvbnMucHVzaChBZGFwdGVyLmRlZmluZU1vZGVscyhtb2RlbHNGb3JUaGlzQWRhcHRlcikpO1xuICAgIH0pO1xuICAgIGF3YWl0IGFsbChkZWZpbml0aW9ucyk7XG4gIH1cbn07XG4iXX0=