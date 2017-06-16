"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const path = require("path");
const denali_cli_1 = require("denali-cli");
const index_1 = require("../blueprints/app/index");
/**
 * Create a new denali app
 *
 * @package commands
 */
class NewCommand extends denali_cli_1.Command {
    run(argv) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            index_1.default.dir = path.join(__dirname, '..', 'blueprints', 'app');
            let appBlueprint = new index_1.default();
            yield appBlueprint.generate(argv);
        });
    }
}
/* tslint:disable:completed-docs typedef */
NewCommand.commandName = 'new';
NewCommand.description = index_1.default.description;
NewCommand.longDescription = index_1.default.longDescription;
NewCommand.params = index_1.default.params;
NewCommand.flags = index_1.default.flags;
NewCommand.runsInApp = false;
exports.default = NewCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmV3LmpzIiwic291cmNlUm9vdCI6Ii9Vc2Vycy9hYnVyZGluZS9Qcm9qZWN0cy9kZW5hbGkvbWFpbi8iLCJzb3VyY2VzIjpbImNvbW1hbmRzL25ldy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSw2QkFBNkI7QUFDN0IsMkNBQXFDO0FBQ3JDLG1EQUFtRDtBQUduRDs7OztHQUlHO0FBQ0gsZ0JBQWdDLFNBQVEsb0JBQU87SUFXdkMsR0FBRyxDQUFDLElBQVM7O1lBQ2pCLGVBQVksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLFlBQVksRUFBRSxLQUFLLENBQUMsQ0FBQztZQUNuRSxJQUFJLFlBQVksR0FBRyxJQUFJLGVBQVksRUFBRSxDQUFDO1lBQ3RDLE1BQU0sWUFBWSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNwQyxDQUFDO0tBQUE7O0FBYkQsMkNBQTJDO0FBQ3BDLHNCQUFXLEdBQUcsS0FBSyxDQUFDO0FBQ3BCLHNCQUFXLEdBQUcsZUFBWSxDQUFDLFdBQVcsQ0FBQztBQUN2QywwQkFBZSxHQUFHLGVBQVksQ0FBQyxlQUFlLENBQUM7QUFDL0MsaUJBQU0sR0FBRyxlQUFZLENBQUMsTUFBTSxDQUFDO0FBQzdCLGdCQUFLLEdBQUcsZUFBWSxDQUFDLEtBQUssQ0FBQztBQUUzQixvQkFBUyxHQUFHLEtBQUssQ0FBQztBQVQzQiw2QkFpQkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgQ29tbWFuZCB9IGZyb20gJ2RlbmFsaS1jbGknO1xuaW1wb3J0IEFwcEJsdWVwcmludCBmcm9tICcuLi9ibHVlcHJpbnRzL2FwcC9pbmRleCc7XG5cblxuLyoqXG4gKiBDcmVhdGUgYSBuZXcgZGVuYWxpIGFwcFxuICpcbiAqIEBwYWNrYWdlIGNvbW1hbmRzXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE5ld0NvbW1hbmQgZXh0ZW5kcyBDb21tYW5kIHtcblxuICAvKiB0c2xpbnQ6ZGlzYWJsZTpjb21wbGV0ZWQtZG9jcyB0eXBlZGVmICovXG4gIHN0YXRpYyBjb21tYW5kTmFtZSA9ICduZXcnO1xuICBzdGF0aWMgZGVzY3JpcHRpb24gPSBBcHBCbHVlcHJpbnQuZGVzY3JpcHRpb247XG4gIHN0YXRpYyBsb25nRGVzY3JpcHRpb24gPSBBcHBCbHVlcHJpbnQubG9uZ0Rlc2NyaXB0aW9uO1xuICBzdGF0aWMgcGFyYW1zID0gQXBwQmx1ZXByaW50LnBhcmFtcztcbiAgc3RhdGljIGZsYWdzID0gQXBwQmx1ZXByaW50LmZsYWdzO1xuXG4gIHN0YXRpYyBydW5zSW5BcHAgPSBmYWxzZTtcblxuICBhc3luYyBydW4oYXJndjogYW55KSB7XG4gICAgQXBwQmx1ZXByaW50LmRpciA9IHBhdGguam9pbihfX2Rpcm5hbWUsICcuLicsICdibHVlcHJpbnRzJywgJ2FwcCcpO1xuICAgIGxldCBhcHBCbHVlcHJpbnQgPSBuZXcgQXBwQmx1ZXByaW50KCk7XG4gICAgYXdhaXQgYXBwQmx1ZXByaW50LmdlbmVyYXRlKGFyZ3YpO1xuICB9XG5cbn1cbiJdfQ==