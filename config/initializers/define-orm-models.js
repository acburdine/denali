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
            let container = application.container;
            let models = application.container.lookupAll('model');
            let modelsGroupedByAdapter = new Map();
            lodash_1.forEach(models, (ModelClass, modelName) => {
                if (ModelClass.hasOwnProperty('abstract') && ModelClass.abstract) {
                    return;
                }
                let Adapter = container.lookup(`orm-adapter:${modelName}`, { loose: true }) || container.lookup('orm-adapter:application');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVmaW5lLW9ybS1tb2RlbHMuanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL2FidXJkaW5lL1Byb2plY3RzL2RlbmFsaS9tYWluLyIsInNvdXJjZXMiOlsiY29uZmlnL2luaXRpYWxpemVycy9kZWZpbmUtb3JtLW1vZGVscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxtQ0FFZ0I7QUFDaEIsdUNBQStCO0FBSy9CLGtCQUFlO0lBQ2IsSUFBSSxFQUFFLG1CQUFtQjtJQUV6Qjs7O09BR0c7SUFDRyxVQUFVLENBQUMsV0FBd0I7O1lBQ3ZDLElBQUksU0FBUyxHQUFHLFdBQVcsQ0FBQyxTQUFTLENBQUM7WUFDdEMsSUFBSSxNQUFNLEdBQTBDLFdBQVcsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzdGLElBQUksc0JBQXNCLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUN2QyxnQkFBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLFVBQVUsRUFBRSxTQUFTO2dCQUNwQyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxJQUFJLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO29CQUNqRSxNQUFNLENBQUM7Z0JBQ1QsQ0FBQztnQkFDRCxJQUFJLE9BQU8sR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLGVBQWdCLFNBQVUsRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxDQUFDLElBQUksU0FBUyxDQUFDLE1BQU0sQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO2dCQUM3SCxFQUFFLENBQUMsQ0FBQyxDQUFDLHNCQUFzQixDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3pDLHNCQUFzQixDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUM7Z0JBQzFDLENBQUM7Z0JBQ0Qsc0JBQXNCLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUN2RCxDQUFDLENBQUMsQ0FBQztZQUNILElBQUksV0FBVyxHQUFVLEVBQUUsQ0FBQztZQUM1QixzQkFBc0IsQ0FBQyxPQUFPLENBQUMsQ0FBQyxvQkFBb0MsRUFBRSxPQUFtQjtnQkFDdkYsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQztZQUMvRCxDQUFDLENBQUMsQ0FBQztZQUNILE1BQU0sY0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ3pCLENBQUM7S0FBQTtDQUNGLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBmb3JFYWNoXG59IGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgeyBhbGwgfSBmcm9tICdibHVlYmlyZCc7XG5pbXBvcnQgQXBwbGljYXRpb24gZnJvbSAnLi4vLi4vbGliL3J1bnRpbWUvYXBwbGljYXRpb24nO1xuaW1wb3J0IE1vZGVsIGZyb20gJy4uLy4uL2xpYi9kYXRhL21vZGVsJztcbmltcG9ydCBPUk1BZGFwdGVyIGZyb20gJy4uLy4uL2xpYi9kYXRhL29ybS1hZGFwdGVyJztcblxuZXhwb3J0IGRlZmF1bHQge1xuICBuYW1lOiAnZGVmaW5lLW9ybS1tb2RlbHMnLFxuXG4gIC8qKlxuICAgKiBGaW5kIGFsbCBtb2RlbHMsIGdyb3VwIHRoZW0gYnkgdGhlaXIgb3JtIGFkYXB0ZXIsIHRoZW4gZ2l2ZSBlYWNoIGFkYXB0ZXIgdGhlIGNoYW5jZSB0byBkZWZpbmVcbiAgICogYW55IGludGVybmFsIG1vZGVsIHJlcHJlc2VudGF0aW9uIG5lY2Vzc2FyeS5cbiAgICovXG4gIGFzeW5jIGluaXRpYWxpemUoYXBwbGljYXRpb246IEFwcGxpY2F0aW9uKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgbGV0IGNvbnRhaW5lciA9IGFwcGxpY2F0aW9uLmNvbnRhaW5lcjtcbiAgICBsZXQgbW9kZWxzOiB7IFttb2RlbE5hbWU6IHN0cmluZ106IHR5cGVvZiBNb2RlbCB9ID0gYXBwbGljYXRpb24uY29udGFpbmVyLmxvb2t1cEFsbCgnbW9kZWwnKTtcbiAgICBsZXQgbW9kZWxzR3JvdXBlZEJ5QWRhcHRlciA9IG5ldyBNYXAoKTtcbiAgICBmb3JFYWNoKG1vZGVscywgKE1vZGVsQ2xhc3MsIG1vZGVsTmFtZSkgPT4ge1xuICAgICAgaWYgKE1vZGVsQ2xhc3MuaGFzT3duUHJvcGVydHkoJ2Fic3RyYWN0JykgJiYgTW9kZWxDbGFzcy5hYnN0cmFjdCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBsZXQgQWRhcHRlciA9IGNvbnRhaW5lci5sb29rdXAoYG9ybS1hZGFwdGVyOiR7IG1vZGVsTmFtZSB9YCwgeyBsb29zZTogdHJ1ZSB9KSB8fCBjb250YWluZXIubG9va3VwKCdvcm0tYWRhcHRlcjphcHBsaWNhdGlvbicpO1xuICAgICAgaWYgKCFtb2RlbHNHcm91cGVkQnlBZGFwdGVyLmhhcyhBZGFwdGVyKSkge1xuICAgICAgICBtb2RlbHNHcm91cGVkQnlBZGFwdGVyLnNldChBZGFwdGVyLCBbXSk7XG4gICAgICB9XG4gICAgICBtb2RlbHNHcm91cGVkQnlBZGFwdGVyLmdldChBZGFwdGVyKS5wdXNoKE1vZGVsQ2xhc3MpO1xuICAgIH0pO1xuICAgIGxldCBkZWZpbml0aW9uczogYW55W10gPSBbXTtcbiAgICBtb2RlbHNHcm91cGVkQnlBZGFwdGVyLmZvckVhY2goKG1vZGVsc0ZvclRoaXNBZGFwdGVyOiB0eXBlb2YgTW9kZWxbXSwgQWRhcHRlcjogT1JNQWRhcHRlcik6IHZvaWQgPT4ge1xuICAgICAgZGVmaW5pdGlvbnMucHVzaChBZGFwdGVyLmRlZmluZU1vZGVscyhtb2RlbHNGb3JUaGlzQWRhcHRlcikpO1xuICAgIH0pO1xuICAgIGF3YWl0IGFsbChkZWZpbml0aW9ucyk7XG4gIH1cbn07XG4iXX0=