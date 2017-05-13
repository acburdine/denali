"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/* tslint:disable:completed-docs no-empty no-invalid-this member-access */
const ava_1 = require("ava");
const denali_1 = require("denali");
function buildAndSave(adapter, type, data) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        let record = adapter.buildRecord(type, data);
        let model = {
            type,
            record,
            get id() {
                return this.record.id;
            }
        };
        yield adapter.saveRecord(model);
        return model;
    });
}
ava_1.default.beforeEach((t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    t.context.container = new denali_1.Container(__dirname);
    t.context.adapter = new denali_1.MemoryAdapter();
}));
ava_1.default('find returns record with given id', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let adapter = t.context.adapter;
    let model = yield buildAndSave(adapter, 'foo', { bar: true });
    let result = yield adapter.find('foo', model.record.id);
    t.deepEqual(result, model.record);
}));
ava_1.default('find returns null for non-existent id', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let adapter = t.context.adapter;
    t.is(yield adapter.find('whatever', 0), null);
}));
ava_1.default('queryOne returns the first record that matches the given query', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let adapter = t.context.adapter;
    let type = 'foo';
    let matching = yield buildAndSave(adapter, type, { number: 'one', bar: true });
    yield buildAndSave(adapter, type, { number: 'two', bar: true });
    yield buildAndSave(adapter, type, { number: 'three', bar: false });
    let result = yield adapter.queryOne(type, { bar: true });
    t.deepEqual(result, matching.record);
}));
ava_1.default('queryOne returns null if query does not match anything', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let adapter = t.context.adapter;
    t.is(yield adapter.queryOne('whatever', { whatever: true }), null);
}));
ava_1.default('all returns all records', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let adapter = t.context.adapter;
    let type = 'foo';
    let modelOne = yield buildAndSave(adapter, type, { number: 'one' });
    let modelTwo = yield buildAndSave(adapter, type, { number: 'two' });
    let result = yield adapter.all(type);
    t.deepEqual(result, [modelOne.record, modelTwo.record]);
}));
ava_1.default('query returns all records that match a given query', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let adapter = t.context.adapter;
    let type = 'foo';
    let matchingOne = yield buildAndSave(adapter, type, { number: 'one', bar: true });
    let matchingTwo = yield buildAndSave(adapter, type, { number: 'two', bar: true });
    yield buildAndSave(adapter, type, { number: 'three', bar: false });
    let result = yield adapter.query(type, { bar: true });
    t.deepEqual(result, [matchingOne.record, matchingTwo.record]);
}));
ava_1.default('get and set attributes', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let adapter = t.context.adapter;
    let record = adapter.buildRecord('foo', { bar: true });
    let model = { record };
    adapter.setAttribute(model, 'bar', false);
    adapter.setAttribute(model, 'fizz', 'buzz');
    t.is(adapter.getAttribute(model, 'bar'), false);
    t.is(adapter.getAttribute(model, 'fizz'), 'buzz');
}));
ava_1.default('getRelated returns related records', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let adapter = t.context.adapter;
    let post = yield buildAndSave(adapter, 'post', {});
    let comment = yield buildAndSave(adapter, 'comment', { text: 'great post!' });
    let descriptor = denali_1.hasMany('comment');
    adapter.setRelated(post, 'comments', descriptor, [comment]);
    let result = yield adapter.getRelated(post, 'comments', descriptor, null);
    t.deepEqual(result, [comment.record]);
}));
ava_1.default('setRelated replaces related records', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let adapter = t.context.adapter;
    let post = yield buildAndSave(adapter, 'post', {});
    let comment = yield buildAndSave(adapter, 'comment', { text: 'great post!' });
    let descriptor = denali_1.hasMany('comment');
    adapter.setRelated(post, 'comments', descriptor, [comment]);
    let sanityCheck = yield adapter.getRelated(post, 'comments', descriptor, null);
    t.deepEqual(sanityCheck, [comment.record]);
    let newComment = yield buildAndSave(adapter, 'comment', { text: 'even greater post!' });
    adapter.setRelated(post, 'comments', descriptor, [newComment]);
    let result = yield adapter.getRelated(post, 'comments', descriptor, null);
    t.deepEqual(result, [newComment.record]);
}));
ava_1.default('addRelated adds a related record to a has many relationship', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let adapter = t.context.adapter;
    let post = yield buildAndSave(adapter, 'post', {});
    let comment = yield buildAndSave(adapter, 'comment', { text: 'great post!' });
    let descriptor = denali_1.hasMany('comment');
    adapter.setRelated(post, 'comments', descriptor, [comment]);
    let sanityCheck = yield adapter.getRelated(post, 'comments', descriptor, null);
    t.deepEqual(sanityCheck, [comment.record]);
    let newComment = yield buildAndSave(adapter, 'comment', { text: 'even greater post!' });
    adapter.addRelated(post, 'comments', descriptor, newComment);
    let result = yield adapter.getRelated(post, 'comments', descriptor, null);
    t.deepEqual(result, [comment.record, newComment.record]);
}));
ava_1.default('removeRelated destroys a relationship between related records', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let adapter = t.context.adapter;
    let post = yield buildAndSave(adapter, 'post', {});
    let comment = yield buildAndSave(adapter, 'comment', { text: 'great post!' });
    let descriptor = denali_1.hasMany('comment');
    adapter.setRelated(post, 'comments', descriptor, [comment]);
    let sanityCheck = yield adapter.getRelated(post, 'comments', descriptor, null);
    t.deepEqual(sanityCheck, [comment.record]);
    adapter.removeRelated(post, 'comments', descriptor, comment);
    let result = yield adapter.getRelated(post, 'comments', descriptor, null);
    t.deepEqual(result, []);
}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVtb3J5LXRlc3QuanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL2FjYnVyZGluZS9Qcm9qZWN0cy9kZW5hbGkvZGVuYWxpLyIsInNvdXJjZXMiOlsidGVzdC91bml0L2RhdGEvbWVtb3J5LXRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsMEVBQTBFO0FBQzFFLDZCQUF1QjtBQUN2QixtQ0FBMkQ7QUFFM0Qsc0JBQTRCLE9BQXNCLEVBQUUsSUFBWSxFQUFFLElBQVM7O1FBQ3pFLElBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzdDLElBQUksS0FBSyxHQUFRO1lBQ2YsSUFBSTtZQUNKLE1BQU07WUFDTixJQUFJLEVBQUU7Z0JBQ0osTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO1lBQ3hCLENBQUM7U0FDRixDQUFDO1FBQ0YsTUFBTSxPQUFPLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2hDLE1BQU0sQ0FBQyxLQUFLLENBQUM7SUFDZixDQUFDO0NBQUE7QUFFRCxhQUFJLENBQUMsVUFBVSxDQUFDLENBQU8sQ0FBQztJQUN0QixDQUFDLENBQUMsT0FBTyxDQUFDLFNBQVMsR0FBRyxJQUFJLGtCQUFTLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDL0MsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEdBQUcsSUFBSSxzQkFBYSxFQUFFLENBQUM7QUFDMUMsQ0FBQyxDQUFBLENBQUMsQ0FBQztBQUVILGFBQUksQ0FBQyxtQ0FBbUMsRUFBRSxDQUFPLENBQUM7SUFDaEQsSUFBSSxPQUFPLEdBQWtCLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDO0lBQy9DLElBQUksS0FBSyxHQUFHLE1BQU0sWUFBWSxDQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUUsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztJQUU5RCxJQUFJLE1BQU0sR0FB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bkQsSUFBSSxPQUFPLEdBQUcsTUFBTSxZQUFZLENBQUMsT0FBTyxFQUFFLFNBQVMsRUFBRSxFQUFFLElBQUksRUFBRSxhQUFhLEVBQUUsQ0FBQyxDQUFDO0lBQzlFLElBQUksVUFBVSxHQUFHLGdCQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDcEMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxDQUFFLE9BQU8sQ0FBRSxDQUFDLENBQUM7SUFDOUQsSUFBSSxXQUFXLEdBQUcsTUFBTSxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQy9FLENBQUMsQ0FBQyxTQUFTLENBQUMsV0FBVyxFQUFFLENBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBRSxDQUFDLENBQUM7SUFFN0MsT0FBTyxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUU3RCxJQUFJLE1BQU0sR0FBRyxNQUFNLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDMUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDMUIsQ0FBQyxDQUFBLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qIHRzbGludDpkaXNhYmxlOmNvbXBsZXRlZC1kb2NzIG5vLWVtcHR5IG5vLWludmFsaWQtdGhpcyBtZW1iZXItYWNjZXNzICovXG5pbXBvcnQgdGVzdCBmcm9tICdhdmEnO1xuaW1wb3J0IHsgQ29udGFpbmVyLCBNZW1vcnlBZGFwdGVyLCBoYXNNYW55IH0gZnJvbSAnZGVuYWxpJztcblxuYXN5bmMgZnVuY3Rpb24gYnVpbGRBbmRTYXZlKGFkYXB0ZXI6IE1lbW9yeUFkYXB0ZXIsIHR5cGU6IHN0cmluZywgZGF0YTogYW55KSB7XG4gIGxldCByZWNvcmQgPSBhZGFwdGVyLmJ1aWxkUmVjb3JkKHR5cGUsIGRhdGEpO1xuICBsZXQgbW9kZWwgPSA8YW55PntcbiAgICB0eXBlLFxuICAgIHJlY29yZCxcbiAgICBnZXQgaWQoKSB7XG4gICAgICByZXR1cm4gdGhpcy5yZWNvcmQuaWQ7XG4gICAgfVxuICB9O1xuICBhd2FpdCBhZGFwdGVyLnNhdmVSZWNvcmQobW9kZWwpO1xuICByZXR1cm4gbW9kZWw7XG59XG5cbnRlc3QuYmVmb3JlRWFjaChhc3luYyAodCkgPT4ge1xuICB0LmNvbnRleHQuY29udGFpbmVyID0gbmV3IENvbnRhaW5lcihfX2Rpcm5hbWUpO1xuICB0LmNvbnRleHQuYWRhcHRlciA9IG5ldyBNZW1vcnlBZGFwdGVyKCk7XG59KTtcblxudGVzdCgnZmluZCByZXR1cm5zIHJlY29yZCB3aXRoIGdpdmVuIGlkJywgYXN5bmMgKHQpID0+IHtcbiAgbGV0IGFkYXB0ZXI6IE1lbW9yeUFkYXB0ZXIgPSB0LmNvbnRleHQuYWRhcHRlcjtcbiAgbGV0IG1vZGVsID0gYXdhaXQgYnVpbGRBbmRTYXZlKGFkYXB0ZXIsICdmb28nLCB7IGJhcjogdHJ1ZSB9KTtcblxuICBsZXQgcmVzdWx0ID0gYXdhaXQgYWRhcHRlci5maW5kKCdmb28nLCBtb2RlbC5yZWNvcmQuaWQpO1xuICB0LmRlZXBFcXVhbChyZXN1bHQsIG1vZGVsLnJlY29yZCk7XG59KTtcblxudGVzdCgnZmluZCByZXR1cm5zIG51bGwgZm9yIG5vbi1leGlzdGVudCBpZCcsIGFzeW5jICh0KSA9PiB7XG4gIGxldCBhZGFwdGVyOiBNZW1vcnlBZGFwdGVyID0gdC5jb250ZXh0LmFkYXB0ZXI7XG5cbiAgdC5pcyhhd2FpdCBhZGFwdGVyLmZpbmQoJ3doYXRldmVyJywgMCksIG51bGwpO1xufSk7XG5cbnRlc3QoJ3F1ZXJ5T25lIHJldHVybnMgdGhlIGZpcnN0IHJlY29yZCB0aGF0IG1hdGNoZXMgdGhlIGdpdmVuIHF1ZXJ5JywgYXN5bmMgKHQpID0+IHtcbiAgbGV0IGFkYXB0ZXI6IE1lbW9yeUFkYXB0ZXIgPSB0LmNvbnRleHQuYWRhcHRlcjtcbiAgbGV0IHR5cGUgPSAnZm9vJztcbiAgbGV0IG1hdGNoaW5nID0gYXdhaXQgYnVpbGRBbmRTYXZlKGFkYXB0ZXIsIHR5cGUsIHsgbnVtYmVyOiAnb25lJywgYmFyOiB0cnVlIH0pO1xuICBhd2FpdCBidWlsZEFuZFNhdmUoYWRhcHRlciwgdHlwZSwgeyBudW1iZXI6ICd0d28nLCBiYXI6IHRydWUgfSk7XG4gIGF3YWl0IGJ1aWxkQW5kU2F2ZShhZGFwdGVyLCB0eXBlLCB7IG51bWJlcjogJ3RocmVlJywgYmFyOiBmYWxzZSB9KTtcblxuICBsZXQgcmVzdWx0ID0gYXdhaXQgYWRhcHRlci5xdWVyeU9uZSh0eXBlLCB7IGJhcjogdHJ1ZSB9KTtcbiAgdC5kZWVwRXF1YWwocmVzdWx0LCBtYXRjaGluZy5yZWNvcmQpO1xufSk7XG5cbnRlc3QoJ3F1ZXJ5T25lIHJldHVybnMgbnVsbCBpZiBxdWVyeSBkb2VzIG5vdCBtYXRjaCBhbnl0aGluZycsIGFzeW5jICh0KSA9PiB7XG4gIGxldCBhZGFwdGVyOiBNZW1vcnlBZGFwdGVyID0gdC5jb250ZXh0LmFkYXB0ZXI7XG5cbiAgdC5pcyhhd2FpdCBhZGFwdGVyLnF1ZXJ5T25lKCd3aGF0ZXZlcicsIHsgd2hhdGV2ZXI6IHRydWUgfSksIG51bGwpO1xufSk7XG5cbnRlc3QoJ2FsbCByZXR1cm5zIGFsbCByZWNvcmRzJywgYXN5bmMgKHQpID0+IHtcbiAgbGV0IGFkYXB0ZXI6IE1lbW9yeUFkYXB0ZXIgPSB0LmNvbnRleHQuYWRhcHRlcjtcbiAgbGV0IHR5cGUgPSAnZm9vJztcbiAgbGV0IG1vZGVsT25lID0gYXdhaXQgYnVpbGRBbmRTYXZlKGFkYXB0ZXIsIHR5cGUsIHsgbnVtYmVyOiAnb25lJyB9KTtcbiAgbGV0IG1vZGVsVHdvID0gYXdhaXQgYnVpbGRBbmRTYXZlKGFkYXB0ZXIsIHR5cGUsIHsgbnVtYmVyOiAndHdvJyB9KTtcblxuICBsZXQgcmVzdWx0ID0gYXdhaXQgYWRhcHRlci5hbGwodHlwZSk7XG4gIHQuZGVlcEVxdWFsKHJlc3VsdCwgWyBtb2RlbE9uZS5yZWNvcmQsIG1vZGVsVHdvLnJlY29yZCBdKTtcbn0pO1xuXG50ZXN0KCdxdWVyeSByZXR1cm5zIGFsbCByZWNvcmRzIHRoYXQgbWF0Y2ggYSBnaXZlbiBxdWVyeScsIGFzeW5jICh0KSA9PiB7XG4gIGxldCBhZGFwdGVyOiBNZW1vcnlBZGFwdGVyID0gdC5jb250ZXh0LmFkYXB0ZXI7XG4gIGxldCB0eXBlID0gJ2Zvbyc7XG4gIGxldCBtYXRjaGluZ09uZSA9IGF3YWl0IGJ1aWxkQW5kU2F2ZShhZGFwdGVyLCB0eXBlLCB7IG51bWJlcjogJ29uZScsIGJhcjogdHJ1ZSB9KTtcbiAgbGV0IG1hdGNoaW5nVHdvID0gYXdhaXQgYnVpbGRBbmRTYXZlKGFkYXB0ZXIsIHR5cGUsIHsgbnVtYmVyOiAndHdvJywgYmFyOiB0cnVlIH0pO1xuICBhd2FpdCBidWlsZEFuZFNhdmUoYWRhcHRlciwgdHlwZSwgeyBudW1iZXI6ICd0aHJlZScsIGJhcjogZmFsc2UgfSk7XG5cbiAgbGV0IHJlc3VsdCA9IGF3YWl0IGFkYXB0ZXIucXVlcnkodHlwZSwgeyBiYXI6IHRydWUgfSk7XG4gIHQuZGVlcEVxdWFsKHJlc3VsdCwgWyBtYXRjaGluZ09uZS5yZWNvcmQsIG1hdGNoaW5nVHdvLnJlY29yZCBdKTtcbn0pO1xuXG50ZXN0KCdnZXQgYW5kIHNldCBhdHRyaWJ1dGVzJywgYXN5bmMgKHQpID0+IHtcbiAgbGV0IGFkYXB0ZXI6IE1lbW9yeUFkYXB0ZXIgPSB0LmNvbnRleHQuYWRhcHRlcjtcbiAgbGV0IHJlY29yZCA9IGFkYXB0ZXIuYnVpbGRSZWNvcmQoJ2ZvbycsIHsgYmFyOiB0cnVlIH0pO1xuICBsZXQgbW9kZWwgPSA8YW55PnsgcmVjb3JkIH07XG4gIGFkYXB0ZXIuc2V0QXR0cmlidXRlKG1vZGVsLCAnYmFyJywgZmFsc2UpO1xuICBhZGFwdGVyLnNldEF0dHJpYnV0ZShtb2RlbCwgJ2ZpenonLCAnYnV6eicpO1xuXG4gIHQuaXMoYWRhcHRlci5nZXRBdHRyaWJ1dGUobW9kZWwsICdiYXInKSwgZmFsc2UpO1xuICB0LmlzKGFkYXB0ZXIuZ2V0QXR0cmlidXRlKG1vZGVsLCAnZml6eicpLCAnYnV6eicpO1xufSk7XG5cbnRlc3QoJ2dldFJlbGF0ZWQgcmV0dXJucyByZWxhdGVkIHJlY29yZHMnLCBhc3luYyAodCkgPT4ge1xuICBsZXQgYWRhcHRlcjogTWVtb3J5QWRhcHRlciA9IHQuY29udGV4dC5hZGFwdGVyO1xuICBsZXQgcG9zdCA9IGF3YWl0IGJ1aWxkQW5kU2F2ZShhZGFwdGVyLCAncG9zdCcsIHt9KTtcbiAgbGV0IGNvbW1lbnQgPSBhd2FpdCBidWlsZEFuZFNhdmUoYWRhcHRlciwgJ2NvbW1lbnQnLCB7IHRleHQ6ICdncmVhdCBwb3N0IScgfSk7XG4gIGxldCBkZXNjcmlwdG9yID0gaGFzTWFueSgnY29tbWVudCcpO1xuICBhZGFwdGVyLnNldFJlbGF0ZWQocG9zdCwgJ2NvbW1lbnRzJywgZGVzY3JpcHRvciwgWyBjb21tZW50IF0pO1xuXG4gIGxldCByZXN1bHQgPSBhd2FpdCBhZGFwdGVyLmdldFJlbGF0ZWQocG9zdCwgJ2NvbW1lbnRzJywgZGVzY3JpcHRvciwgbnVsbCk7XG4gIHQuZGVlcEVxdWFsKHJlc3VsdCwgWyBjb21tZW50LnJlY29yZCBdKTtcbn0pO1xuXG50ZXN0KCdzZXRSZWxhdGVkIHJlcGxhY2VzIHJlbGF0ZWQgcmVjb3JkcycsIGFzeW5jICh0KSA9PiB7XG4gIGxldCBhZGFwdGVyOiBNZW1vcnlBZGFwdGVyID0gdC5jb250ZXh0LmFkYXB0ZXI7XG4gIGxldCBwb3N0ID0gYXdhaXQgYnVpbGRBbmRTYXZlKGFkYXB0ZXIsICdwb3N0Jywge30pO1xuICBsZXQgY29tbWVudCA9IGF3YWl0IGJ1aWxkQW5kU2F2ZShhZGFwdGVyLCAnY29tbWVudCcsIHsgdGV4dDogJ2dyZWF0IHBvc3QhJyB9KTtcbiAgbGV0IGRlc2NyaXB0b3IgPSBoYXNNYW55KCdjb21tZW50Jyk7XG4gIGFkYXB0ZXIuc2V0UmVsYXRlZChwb3N0LCAnY29tbWVudHMnLCBkZXNjcmlwdG9yLCBbIGNvbW1lbnQgXSk7XG4gIGxldCBzYW5pdHlDaGVjayA9IGF3YWl0IGFkYXB0ZXIuZ2V0UmVsYXRlZChwb3N0LCAnY29tbWVudHMnLCBkZXNjcmlwdG9yLCBudWxsKTtcbiAgdC5kZWVwRXF1YWwoc2FuaXR5Q2hlY2ssIFsgY29tbWVudC5yZWNvcmQgXSk7XG5cbiAgbGV0IG5ld0NvbW1lbnQgPSBhd2FpdCBidWlsZEFuZFNhdmUoYWRhcHRlciwgJ2NvbW1lbnQnLCB7IHRleHQ6ICdldmVuIGdyZWF0ZXIgcG9zdCEnIH0pO1xuICBhZGFwdGVyLnNldFJlbGF0ZWQocG9zdCwgJ2NvbW1lbnRzJywgZGVzY3JpcHRvciwgWyBuZXdDb21tZW50IF0pO1xuXG4gIGxldCByZXN1bHQgPSBhd2FpdCBhZGFwdGVyLmdldFJlbGF0ZWQocG9zdCwgJ2NvbW1lbnRzJywgZGVzY3JpcHRvciwgbnVsbCk7XG4gIHQuZGVlcEVxdWFsKHJlc3VsdCwgWyBuZXdDb21tZW50LnJlY29yZCBdKTtcbn0pO1xuXG50ZXN0KCdhZGRSZWxhdGVkIGFkZHMgYSByZWxhdGVkIHJlY29yZCB0byBhIGhhcyBtYW55IHJlbGF0aW9uc2hpcCcsIGFzeW5jICh0KSA9PiB7XG4gIGxldCBhZGFwdGVyOiBNZW1vcnlBZGFwdGVyID0gdC5jb250ZXh0LmFkYXB0ZXI7XG4gIGxldCBwb3N0ID0gYXdhaXQgYnVpbGRBbmRTYXZlKGFkYXB0ZXIsICdwb3N0Jywge30pO1xuICBsZXQgY29tbWVudCA9IGF3YWl0IGJ1aWxkQW5kU2F2ZShhZGFwdGVyLCAnY29tbWVudCcsIHsgdGV4dDogJ2dyZWF0IHBvc3QhJyB9KTtcbiAgbGV0IGRlc2NyaXB0b3IgPSBoYXNNYW55KCdjb21tZW50Jyk7XG4gIGFkYXB0ZXIuc2V0UmVsYXRlZChwb3N0LCAnY29tbWVudHMnLCBkZXNjcmlwdG9yLCBbIGNvbW1lbnQgXSk7XG4gIGxldCBzYW5pdHlDaGVjayA9IGF3YWl0IGFkYXB0ZXIuZ2V0UmVsYXRlZChwb3N0LCAnY29tbWVudHMnLCBkZXNjcmlwdG9yLCBudWxsKTtcbiAgdC5kZWVwRXF1YWwoc2FuaXR5Q2hlY2ssIFsgY29tbWVudC5yZWNvcmQgXSk7XG5cbiAgbGV0IG5ld0NvbW1lbnQgPSBhd2FpdCBidWlsZEFuZFNhdmUoYWRhcHRlciwgJ2NvbW1lbnQnLCB7IHRleHQ6ICdldmVuIGdyZWF0ZXIgcG9zdCEnIH0pO1xuICBhZGFwdGVyLmFkZFJlbGF0ZWQocG9zdCwgJ2NvbW1lbnRzJywgZGVzY3JpcHRvciwgbmV3Q29tbWVudCk7XG5cbiAgbGV0IHJlc3VsdCA9IGF3YWl0IGFkYXB0ZXIuZ2V0UmVsYXRlZChwb3N0LCAnY29tbWVudHMnLCBkZXNjcmlwdG9yLCBudWxsKTtcbiAgdC5kZWVwRXF1YWwocmVzdWx0LCBbIGNvbW1lbnQucmVjb3JkLCBuZXdDb21tZW50LnJlY29yZCBdKTtcbn0pO1xuXG50ZXN0KCdyZW1vdmVSZWxhdGVkIGRlc3Ryb3lzIGEgcmVsYXRpb25zaGlwIGJldHdlZW4gcmVsYXRlZCByZWNvcmRzJywgYXN5bmMgKHQpID0+IHtcbiAgbGV0IGFkYXB0ZXI6IE1lbW9yeUFkYXB0ZXIgPSB0LmNvbnRleHQuYWRhcHRlcjtcbiAgbGV0IHBvc3QgPSBhd2FpdCBidWlsZEFuZFNhdmUoYWRhcHRlciwgJ3Bvc3QnLCB7fSk7XG4gIGxldCBjb21tZW50ID0gYXdhaXQgYnVpbGRBbmRTYXZlKGFkYXB0ZXIsICdjb21tZW50JywgeyB0ZXh0OiAnZ3JlYXQgcG9zdCEnIH0pO1xuICBsZXQgZGVzY3JpcHRvciA9IGhhc01hbnkoJ2NvbW1lbnQnKTtcbiAgYWRhcHRlci5zZXRSZWxhdGVkKHBvc3QsICdjb21tZW50cycsIGRlc2NyaXB0b3IsIFsgY29tbWVudCBdKTtcbiAgbGV0IHNhbml0eUNoZWNrID0gYXdhaXQgYWRhcHRlci5nZXRSZWxhdGVkKHBvc3QsICdjb21tZW50cycsIGRlc2NyaXB0b3IsIG51bGwpO1xuICB0LmRlZXBFcXVhbChzYW5pdHlDaGVjaywgWyBjb21tZW50LnJlY29yZCBdKTtcblxuICBhZGFwdGVyLnJlbW92ZVJlbGF0ZWQocG9zdCwgJ2NvbW1lbnRzJywgZGVzY3JpcHRvciwgY29tbWVudCk7XG5cbiAgbGV0IHJlc3VsdCA9IGF3YWl0IGFkYXB0ZXIuZ2V0UmVsYXRlZChwb3N0LCAnY29tbWVudHMnLCBkZXNjcmlwdG9yLCBudWxsKTtcbiAgdC5kZWVwRXF1YWwocmVzdWx0LCBbXSk7XG59KTtcbiJdfQ==