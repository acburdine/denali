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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVtb3J5LXRlc3QuanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL2FidXJkaW5lL1Byb2plY3RzL2RlbmFsaS9tYWluLyIsInNvdXJjZXMiOlsidGVzdC91bml0L2RhdGEvbWVtb3J5LXRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsMEVBQTBFO0FBQzFFLDZCQUF1QjtBQUN2QixtQ0FBZ0Q7QUFFaEQsc0JBQTRCLE9BQXNCLEVBQUUsSUFBWSxFQUFFLElBQVM7O1FBQ3pFLElBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzdDLElBQUksS0FBSyxHQUFRO1lBQ2YsSUFBSTtZQUNKLE1BQU07WUFDTixJQUFJLEVBQUU7Z0JBQ0osTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO1lBQ3hCLENBQUM7U0FDRixDQUFDO1FBQ0YsTUFBTSxPQUFPLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2hDLE1BQU0sQ0FBQyxLQUFLLENBQUM7SUFDZixDQUFDO0NBQUE7QUFFRCxhQUFJLENBQUMsVUFBVSxDQUFDLENBQU8sQ0FBQztJQUN0QixDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sR0FBRyxJQUFJLHNCQUFhLEVBQUUsQ0FBQztBQUMxQyxDQUFDLENBQUEsQ0FBQyxDQUFDO0FBRUgsYUFBSSxDQUFDLG1DQUFtQyxFQUFFLENBQU8sQ0FBQztJQUNoRCxJQUFJLE9BQU8sR0FBa0IsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUM7SUFDL0MsSUFBSSxLQUFLLEdBQUcsTUFBTSxZQUFZLENBQUMsT0FBTyxFQUFFLEtBQUssRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0lBRTlELElBQUksTUFBTSxHQUFHLE1BQU0sT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FB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QWEsRUFBRSxDQUFDLENBQUM7SUFDOUUsSUFBSSxVQUFVLEdBQUcsZ0JBQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUNwQyxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLENBQUUsT0FBTyxDQUFFLENBQUMsQ0FBQztJQUM5RCxJQUFJLFdBQVcsR0FBRyxNQUFNLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDL0UsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxXQUFXLEVBQUUsQ0FBRSxPQUFPLENBQUMsTUFBTSxDQUFFLENBQUMsQ0FBQztJQUU3QyxPQUFPLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBRTdELElBQUksTUFBTSxHQUFHLE1BQU0sT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUMxRSxDQUFDLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsQ0FBQztBQUMxQixDQUFDLENBQUEsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyogdHNsaW50OmRpc2FibGU6Y29tcGxldGVkLWRvY3Mgbm8tZW1wdHkgbm8taW52YWxpZC10aGlzIG1lbWJlci1hY2Nlc3MgKi9cbmltcG9ydCB0ZXN0IGZyb20gJ2F2YSc7XG5pbXBvcnQgeyBNZW1vcnlBZGFwdGVyLCBoYXNNYW55IH0gZnJvbSAnZGVuYWxpJztcblxuYXN5bmMgZnVuY3Rpb24gYnVpbGRBbmRTYXZlKGFkYXB0ZXI6IE1lbW9yeUFkYXB0ZXIsIHR5cGU6IHN0cmluZywgZGF0YTogYW55KSB7XG4gIGxldCByZWNvcmQgPSBhZGFwdGVyLmJ1aWxkUmVjb3JkKHR5cGUsIGRhdGEpO1xuICBsZXQgbW9kZWwgPSA8YW55PntcbiAgICB0eXBlLFxuICAgIHJlY29yZCxcbiAgICBnZXQgaWQoKSB7XG4gICAgICByZXR1cm4gdGhpcy5yZWNvcmQuaWQ7XG4gICAgfVxuICB9O1xuICBhd2FpdCBhZGFwdGVyLnNhdmVSZWNvcmQobW9kZWwpO1xuICByZXR1cm4gbW9kZWw7XG59XG5cbnRlc3QuYmVmb3JlRWFjaChhc3luYyAodCkgPT4ge1xuICB0LmNvbnRleHQuYWRhcHRlciA9IG5ldyBNZW1vcnlBZGFwdGVyKCk7XG59KTtcblxudGVzdCgnZmluZCByZXR1cm5zIHJlY29yZCB3aXRoIGdpdmVuIGlkJywgYXN5bmMgKHQpID0+IHtcbiAgbGV0IGFkYXB0ZXI6IE1lbW9yeUFkYXB0ZXIgPSB0LmNvbnRleHQuYWRhcHRlcjtcbiAgbGV0IG1vZGVsID0gYXdhaXQgYnVpbGRBbmRTYXZlKGFkYXB0ZXIsICdmb28nLCB7IGJhcjogdHJ1ZSB9KTtcblxuICBsZXQgcmVzdWx0ID0gYXdhaXQgYWRhcHRlci5maW5kKCdmb28nLCBtb2RlbC5yZWNvcmQuaWQpO1xuICB0LmRlZXBFcXVhbChyZXN1bHQsIG1vZGVsLnJlY29yZCk7XG59KTtcblxudGVzdCgnZmluZCByZXR1cm5zIG51bGwgZm9yIG5vbi1leGlzdGVudCBpZCcsIGFzeW5jICh0KSA9PiB7XG4gIGxldCBhZGFwdGVyOiBNZW1vcnlBZGFwdGVyID0gdC5jb250ZXh0LmFkYXB0ZXI7XG5cbiAgdC5pcyhhd2FpdCBhZGFwdGVyLmZpbmQoJ3doYXRldmVyJywgMCksIG51bGwpO1xufSk7XG5cbnRlc3QoJ3F1ZXJ5T25lIHJldHVybnMgdGhlIGZpcnN0IHJlY29yZCB0aGF0IG1hdGNoZXMgdGhlIGdpdmVuIHF1ZXJ5JywgYXN5bmMgKHQpID0+IHtcbiAgbGV0IGFkYXB0ZXI6IE1lbW9yeUFkYXB0ZXIgPSB0LmNvbnRleHQuYWRhcHRlcjtcbiAgbGV0IHR5cGUgPSAnZm9vJztcbiAgbGV0IG1hdGNoaW5nID0gYXdhaXQgYnVpbGRBbmRTYXZlKGFkYXB0ZXIsIHR5cGUsIHsgbnVtYmVyOiAnb25lJywgYmFyOiB0cnVlIH0pO1xuICBhd2FpdCBidWlsZEFuZFNhdmUoYWRhcHRlciwgdHlwZSwgeyBudW1iZXI6ICd0d28nLCBiYXI6IHRydWUgfSk7XG4gIGF3YWl0IGJ1aWxkQW5kU2F2ZShhZGFwdGVyLCB0eXBlLCB7IG51bWJlcjogJ3RocmVlJywgYmFyOiBmYWxzZSB9KTtcblxuICBsZXQgcmVzdWx0ID0gYXdhaXQgYWRhcHRlci5xdWVyeU9uZSh0eXBlLCB7IGJhcjogdHJ1ZSB9KTtcbiAgdC5kZWVwRXF1YWwocmVzdWx0LCBtYXRjaGluZy5yZWNvcmQpO1xufSk7XG5cbnRlc3QoJ3F1ZXJ5T25lIHJldHVybnMgbnVsbCBpZiBxdWVyeSBkb2VzIG5vdCBtYXRjaCBhbnl0aGluZycsIGFzeW5jICh0KSA9PiB7XG4gIGxldCBhZGFwdGVyOiBNZW1vcnlBZGFwdGVyID0gdC5jb250ZXh0LmFkYXB0ZXI7XG5cbiAgdC5pcyhhd2FpdCBhZGFwdGVyLnF1ZXJ5T25lKCd3aGF0ZXZlcicsIHsgd2hhdGV2ZXI6IHRydWUgfSksIG51bGwpO1xufSk7XG5cbnRlc3QoJ2FsbCByZXR1cm5zIGFsbCByZWNvcmRzJywgYXN5bmMgKHQpID0+IHtcbiAgbGV0IGFkYXB0ZXI6IE1lbW9yeUFkYXB0ZXIgPSB0LmNvbnRleHQuYWRhcHRlcjtcbiAgbGV0IHR5cGUgPSAnZm9vJztcbiAgbGV0IG1vZGVsT25lID0gYXdhaXQgYnVpbGRBbmRTYXZlKGFkYXB0ZXIsIHR5cGUsIHsgbnVtYmVyOiAnb25lJyB9KTtcbiAgbGV0IG1vZGVsVHdvID0gYXdhaXQgYnVpbGRBbmRTYXZlKGFkYXB0ZXIsIHR5cGUsIHsgbnVtYmVyOiAndHdvJyB9KTtcblxuICBsZXQgcmVzdWx0ID0gYXdhaXQgYWRhcHRlci5hbGwodHlwZSk7XG4gIHQuZGVlcEVxdWFsKHJlc3VsdCwgWyBtb2RlbE9uZS5yZWNvcmQsIG1vZGVsVHdvLnJlY29yZCBdKTtcbn0pO1xuXG50ZXN0KCdxdWVyeSByZXR1cm5zIGFsbCByZWNvcmRzIHRoYXQgbWF0Y2ggYSBnaXZlbiBxdWVyeScsIGFzeW5jICh0KSA9PiB7XG4gIGxldCBhZGFwdGVyOiBNZW1vcnlBZGFwdGVyID0gdC5jb250ZXh0LmFkYXB0ZXI7XG4gIGxldCB0eXBlID0gJ2Zvbyc7XG4gIGxldCBtYXRjaGluZ09uZSA9IGF3YWl0IGJ1aWxkQW5kU2F2ZShhZGFwdGVyLCB0eXBlLCB7IG51bWJlcjogJ29uZScsIGJhcjogdHJ1ZSB9KTtcbiAgbGV0IG1hdGNoaW5nVHdvID0gYXdhaXQgYnVpbGRBbmRTYXZlKGFkYXB0ZXIsIHR5cGUsIHsgbnVtYmVyOiAndHdvJywgYmFyOiB0cnVlIH0pO1xuICBhd2FpdCBidWlsZEFuZFNhdmUoYWRhcHRlciwgdHlwZSwgeyBudW1iZXI6ICd0aHJlZScsIGJhcjogZmFsc2UgfSk7XG5cbiAgbGV0IHJlc3VsdCA9IGF3YWl0IGFkYXB0ZXIucXVlcnkodHlwZSwgeyBiYXI6IHRydWUgfSk7XG4gIHQuZGVlcEVxdWFsKHJlc3VsdCwgWyBtYXRjaGluZ09uZS5yZWNvcmQsIG1hdGNoaW5nVHdvLnJlY29yZCBdKTtcbn0pO1xuXG50ZXN0KCdnZXQgYW5kIHNldCBhdHRyaWJ1dGVzJywgYXN5bmMgKHQpID0+IHtcbiAgbGV0IGFkYXB0ZXI6IE1lbW9yeUFkYXB0ZXIgPSB0LmNvbnRleHQuYWRhcHRlcjtcbiAgbGV0IHJlY29yZCA9IGFkYXB0ZXIuYnVpbGRSZWNvcmQoJ2ZvbycsIHsgYmFyOiB0cnVlIH0pO1xuICBsZXQgbW9kZWwgPSA8YW55PnsgcmVjb3JkIH07XG4gIGFkYXB0ZXIuc2V0QXR0cmlidXRlKG1vZGVsLCAnYmFyJywgZmFsc2UpO1xuICBhZGFwdGVyLnNldEF0dHJpYnV0ZShtb2RlbCwgJ2ZpenonLCAnYnV6eicpO1xuXG4gIHQuaXMoYWRhcHRlci5nZXRBdHRyaWJ1dGUobW9kZWwsICdiYXInKSwgZmFsc2UpO1xuICB0LmlzKGFkYXB0ZXIuZ2V0QXR0cmlidXRlKG1vZGVsLCAnZml6eicpLCAnYnV6eicpO1xufSk7XG5cbnRlc3QoJ2dldFJlbGF0ZWQgcmV0dXJucyByZWxhdGVkIHJlY29yZHMnLCBhc3luYyAodCkgPT4ge1xuICBsZXQgYWRhcHRlcjogTWVtb3J5QWRhcHRlciA9IHQuY29udGV4dC5hZGFwdGVyO1xuICBsZXQgcG9zdCA9IGF3YWl0IGJ1aWxkQW5kU2F2ZShhZGFwdGVyLCAncG9zdCcsIHt9KTtcbiAgbGV0IGNvbW1lbnQgPSBhd2FpdCBidWlsZEFuZFNhdmUoYWRhcHRlciwgJ2NvbW1lbnQnLCB7IHRleHQ6ICdncmVhdCBwb3N0IScgfSk7XG4gIGxldCBkZXNjcmlwdG9yID0gaGFzTWFueSgnY29tbWVudCcpO1xuICBhZGFwdGVyLnNldFJlbGF0ZWQocG9zdCwgJ2NvbW1lbnRzJywgZGVzY3JpcHRvciwgWyBjb21tZW50IF0pO1xuXG4gIGxldCByZXN1bHQgPSBhd2FpdCBhZGFwdGVyLmdldFJlbGF0ZWQocG9zdCwgJ2NvbW1lbnRzJywgZGVzY3JpcHRvciwgbnVsbCk7XG4gIHQuZGVlcEVxdWFsKHJlc3VsdCwgWyBjb21tZW50LnJlY29yZCBdKTtcbn0pO1xuXG50ZXN0KCdzZXRSZWxhdGVkIHJlcGxhY2VzIHJlbGF0ZWQgcmVjb3JkcycsIGFzeW5jICh0KSA9PiB7XG4gIGxldCBhZGFwdGVyOiBNZW1vcnlBZGFwdGVyID0gdC5jb250ZXh0LmFkYXB0ZXI7XG4gIGxldCBwb3N0ID0gYXdhaXQgYnVpbGRBbmRTYXZlKGFkYXB0ZXIsICdwb3N0Jywge30pO1xuICBsZXQgY29tbWVudCA9IGF3YWl0IGJ1aWxkQW5kU2F2ZShhZGFwdGVyLCAnY29tbWVudCcsIHsgdGV4dDogJ2dyZWF0IHBvc3QhJyB9KTtcbiAgbGV0IGRlc2NyaXB0b3IgPSBoYXNNYW55KCdjb21tZW50Jyk7XG4gIGFkYXB0ZXIuc2V0UmVsYXRlZChwb3N0LCAnY29tbWVudHMnLCBkZXNjcmlwdG9yLCBbIGNvbW1lbnQgXSk7XG4gIGxldCBzYW5pdHlDaGVjayA9IGF3YWl0IGFkYXB0ZXIuZ2V0UmVsYXRlZChwb3N0LCAnY29tbWVudHMnLCBkZXNjcmlwdG9yLCBudWxsKTtcbiAgdC5kZWVwRXF1YWwoc2FuaXR5Q2hlY2ssIFsgY29tbWVudC5yZWNvcmQgXSk7XG5cbiAgbGV0IG5ld0NvbW1lbnQgPSBhd2FpdCBidWlsZEFuZFNhdmUoYWRhcHRlciwgJ2NvbW1lbnQnLCB7IHRleHQ6ICdldmVuIGdyZWF0ZXIgcG9zdCEnIH0pO1xuICBhZGFwdGVyLnNldFJlbGF0ZWQocG9zdCwgJ2NvbW1lbnRzJywgZGVzY3JpcHRvciwgWyBuZXdDb21tZW50IF0pO1xuXG4gIGxldCByZXN1bHQgPSBhd2FpdCBhZGFwdGVyLmdldFJlbGF0ZWQocG9zdCwgJ2NvbW1lbnRzJywgZGVzY3JpcHRvciwgbnVsbCk7XG4gIHQuZGVlcEVxdWFsKHJlc3VsdCwgWyBuZXdDb21tZW50LnJlY29yZCBdKTtcbn0pO1xuXG50ZXN0KCdhZGRSZWxhdGVkIGFkZHMgYSByZWxhdGVkIHJlY29yZCB0byBhIGhhcyBtYW55IHJlbGF0aW9uc2hpcCcsIGFzeW5jICh0KSA9PiB7XG4gIGxldCBhZGFwdGVyOiBNZW1vcnlBZGFwdGVyID0gdC5jb250ZXh0LmFkYXB0ZXI7XG4gIGxldCBwb3N0ID0gYXdhaXQgYnVpbGRBbmRTYXZlKGFkYXB0ZXIsICdwb3N0Jywge30pO1xuICBsZXQgY29tbWVudCA9IGF3YWl0IGJ1aWxkQW5kU2F2ZShhZGFwdGVyLCAnY29tbWVudCcsIHsgdGV4dDogJ2dyZWF0IHBvc3QhJyB9KTtcbiAgbGV0IGRlc2NyaXB0b3IgPSBoYXNNYW55KCdjb21tZW50Jyk7XG4gIGFkYXB0ZXIuc2V0UmVsYXRlZChwb3N0LCAnY29tbWVudHMnLCBkZXNjcmlwdG9yLCBbIGNvbW1lbnQgXSk7XG4gIGxldCBzYW5pdHlDaGVjayA9IGF3YWl0IGFkYXB0ZXIuZ2V0UmVsYXRlZChwb3N0LCAnY29tbWVudHMnLCBkZXNjcmlwdG9yLCBudWxsKTtcbiAgdC5kZWVwRXF1YWwoc2FuaXR5Q2hlY2ssIFsgY29tbWVudC5yZWNvcmQgXSk7XG5cbiAgbGV0IG5ld0NvbW1lbnQgPSBhd2FpdCBidWlsZEFuZFNhdmUoYWRhcHRlciwgJ2NvbW1lbnQnLCB7IHRleHQ6ICdldmVuIGdyZWF0ZXIgcG9zdCEnIH0pO1xuICBhZGFwdGVyLmFkZFJlbGF0ZWQocG9zdCwgJ2NvbW1lbnRzJywgZGVzY3JpcHRvciwgbmV3Q29tbWVudCk7XG5cbiAgbGV0IHJlc3VsdCA9IGF3YWl0IGFkYXB0ZXIuZ2V0UmVsYXRlZChwb3N0LCAnY29tbWVudHMnLCBkZXNjcmlwdG9yLCBudWxsKTtcbiAgdC5kZWVwRXF1YWwocmVzdWx0LCBbIGNvbW1lbnQucmVjb3JkLCBuZXdDb21tZW50LnJlY29yZCBdKTtcbn0pO1xuXG50ZXN0KCdyZW1vdmVSZWxhdGVkIGRlc3Ryb3lzIGEgcmVsYXRpb25zaGlwIGJldHdlZW4gcmVsYXRlZCByZWNvcmRzJywgYXN5bmMgKHQpID0+IHtcbiAgbGV0IGFkYXB0ZXI6IE1lbW9yeUFkYXB0ZXIgPSB0LmNvbnRleHQuYWRhcHRlcjtcbiAgbGV0IHBvc3QgPSBhd2FpdCBidWlsZEFuZFNhdmUoYWRhcHRlciwgJ3Bvc3QnLCB7fSk7XG4gIGxldCBjb21tZW50ID0gYXdhaXQgYnVpbGRBbmRTYXZlKGFkYXB0ZXIsICdjb21tZW50JywgeyB0ZXh0OiAnZ3JlYXQgcG9zdCEnIH0pO1xuICBsZXQgZGVzY3JpcHRvciA9IGhhc01hbnkoJ2NvbW1lbnQnKTtcbiAgYWRhcHRlci5zZXRSZWxhdGVkKHBvc3QsICdjb21tZW50cycsIGRlc2NyaXB0b3IsIFsgY29tbWVudCBdKTtcbiAgbGV0IHNhbml0eUNoZWNrID0gYXdhaXQgYWRhcHRlci5nZXRSZWxhdGVkKHBvc3QsICdjb21tZW50cycsIGRlc2NyaXB0b3IsIG51bGwpO1xuICB0LmRlZXBFcXVhbChzYW5pdHlDaGVjaywgWyBjb21tZW50LnJlY29yZCBdKTtcblxuICBhZGFwdGVyLnJlbW92ZVJlbGF0ZWQocG9zdCwgJ2NvbW1lbnRzJywgZGVzY3JpcHRvciwgY29tbWVudCk7XG5cbiAgbGV0IHJlc3VsdCA9IGF3YWl0IGFkYXB0ZXIuZ2V0UmVsYXRlZChwb3N0LCAnY29tbWVudHMnLCBkZXNjcmlwdG9yLCBudWxsKTtcbiAgdC5kZWVwRXF1YWwocmVzdWx0LCBbXSk7XG59KTsiXX0=