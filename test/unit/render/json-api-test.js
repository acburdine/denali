"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/* tslint:disable:completed-docs no-empty no-invalid-this member-access */
const ava_1 = require("ava");
const lodash_1 = require("lodash");
const denali_1 = require("denali");
ava_1.default.beforeEach((t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let container = t.context.container = new denali_1.Container(__dirname);
    container.register('action:posts/show', denali_1.Action);
    container.register('action:comments/show', denali_1.Action);
    container.register('app:router', class extends denali_1.Router {
    });
    let router = container.lookup('app:router');
    router.map((router) => {
        router.get('/posts', 'posts/show');
    });
    container.register('orm-adapter:application', class extends denali_1.MemoryAdapter {
    });
}));
ava_1.default('renders models as JSON-API resource objects', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let container = t.context.container;
    container.register('serializer:post', class TestSerializer extends denali_1.JSONAPISerializer {
        constructor() {
            super(...arguments);
            this.attributes = ['title'];
            this.relationships = {};
        }
    });
    container.register('model:post', (_a = class Post extends denali_1.Model {
        },
        _a.title = denali_1.attr('string'),
        _a));
    let Post = container.factoryFor('model:post');
    let serializer = container.lookup('serializer:post');
    let payload = yield Post.create(container, { title: 'foo' }).save();
    let result = yield serializer.serialize({}, payload, {});
    t.is(result.data.attributes.title, 'foo');
    var _a;
}));
ava_1.default('renders errors according to spec', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let container = t.context.container;
    container.register('serializer:application', class TestSerializer extends denali_1.JSONAPISerializer {
        constructor() {
            super(...arguments);
            this.attributes = [];
            this.relationships = {};
        }
    });
    let serializer = container.lookup('serializer:application');
    let result = yield serializer.serialize({}, new denali_1.Errors.InternalServerError('foo'), {});
    t.is(result.errors[0].status, 500);
    t.is(result.errors[0].code, 'InternalServerError');
    t.is(result.errors[0].detail, 'foo');
}));
ava_1.default('renders validation errors with additional details', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let container = t.context.container;
    container.register('serializer:application', class TestSerializer extends denali_1.JSONAPISerializer {
        constructor() {
            super(...arguments);
            this.attributes = [];
            this.relationships = {};
        }
    });
    let serializer = container.lookup('serializer:application');
    let error = new denali_1.Errors.UnprocessableEntity('Email cannot be blank');
    error.title = 'presence';
    error.source = '/data/attributes/email';
    let result = yield serializer.serialize({}, error, {});
    t.is(result.errors[0].status, 422);
    t.is(result.errors[0].code, 'UnprocessableEntityError');
    t.is(result.errors[0].title, 'presence');
    t.is(result.errors[0].source, '/data/attributes/email');
    t.is(result.errors[0].detail, 'Email cannot be blank');
}));
ava_1.default('sideloads related records', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let container = t.context.container;
    container.register('serializer:post', class PostSerializer extends denali_1.JSONAPISerializer {
        constructor() {
            super(...arguments);
            this.attributes = ['title'];
            this.relationships = {
                comments: {
                    strategy: 'embed'
                }
            };
        }
    });
    container.register('serializer:comment', class CommentSerializer extends denali_1.JSONAPISerializer {
        constructor() {
            super(...arguments);
            this.attributes = ['text'];
            this.relationships = {};
        }
    });
    container.register('model:post', (_a = class Post extends denali_1.Model {
        },
        _a.title = denali_1.attr('string'),
        _a.comments = denali_1.hasMany('comment'),
        _a));
    container.register('model:comment', (_b = class Comment extends denali_1.Model {
        },
        _b.text = denali_1.attr('string'),
        _b));
    let Post = container.factoryFor('model:post');
    let Comment = container.factoryFor('model:comment');
    let serializer = container.lookup('serializer:post');
    let post = yield Post.create(container, { title: 'foo' }).save();
    let comment = yield Comment.create(container, { text: 'bar' }).save();
    yield post.addComment(comment);
    let result = yield serializer.serialize({}, post, {});
    t.true(lodash_1.isArray(result.included));
    t.is(result.included[0].attributes.text, 'bar');
    var _a, _b;
}));
ava_1.default.todo('dedupes sideloaded related records');
ava_1.default('embeds related records as resource linkage objects', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let container = t.context.container;
    container.register('serializer:post', class PostSerializer extends denali_1.JSONAPISerializer {
        constructor() {
            super(...arguments);
            this.attributes = ['title'];
            this.relationships = {
                comments: {
                    strategy: 'id'
                }
            };
        }
    });
    container.register('serializer:comment', class CommentSerializer extends denali_1.JSONAPISerializer {
        constructor() {
            super(...arguments);
            this.attributes = ['text'];
            this.relationships = {};
        }
    });
    container.register('model:post', (_a = class Post extends denali_1.Model {
        },
        _a.title = denali_1.attr('string'),
        _a.comments = denali_1.hasMany('comment'),
        _a));
    container.register('model:comment', (_b = class Comment extends denali_1.Model {
        },
        _b.text = denali_1.attr('string'),
        _b));
    let Post = container.factoryFor('model:post');
    let Comment = container.factoryFor('model:comment');
    let serializer = container.lookup('serializer:post');
    let post = yield Post.create(container, { title: 'foo' }).save();
    let comment = yield Comment.create(container, { text: 'bar' }).save();
    yield post.addComment(comment);
    let result = yield serializer.serialize({}, post, {});
    t.true(lodash_1.isArray(result.included));
    t.is(result.included[0].id, comment.id);
    t.is(result.included[0].type, 'comments');
    var _a, _b;
}));
ava_1.default('renders document meta', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let container = t.context.container;
    container.register('serializer:post', class TestSerializer extends denali_1.JSONAPISerializer {
        constructor() {
            super(...arguments);
            this.attributes = [];
            this.relationships = {};
        }
    });
    container.register('model:post', class Post extends denali_1.Model {
    });
    let Post = container.factoryFor('model:post');
    let serializer = container.lookup('serializer:post');
    let payload = yield Post.create(container, {}).save();
    let result = yield serializer.serialize({}, payload, { meta: { foo: true } });
    t.true(result.meta.foo);
}));
ava_1.default('renders document links', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let container = t.context.container;
    container.register('serializer:post', class TestSerializer extends denali_1.JSONAPISerializer {
        constructor() {
            super(...arguments);
            this.attributes = [];
            this.relationships = {};
        }
    });
    container.register('model:post', class Post extends denali_1.Model {
    });
    let Post = container.factoryFor('model:post');
    let serializer = container.lookup('serializer:post');
    let payload = yield Post.create(container, {}).save();
    let result = yield serializer.serialize({}, payload, { links: { foo: true } });
    t.true(result.links.foo);
}));
ava_1.default('renders jsonapi version', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let container = t.context.container;
    container.register('serializer:post', class TestSerializer extends denali_1.JSONAPISerializer {
        constructor() {
            super(...arguments);
            this.attributes = [];
            this.relationships = {};
        }
    });
    container.register('model:post', class Post extends denali_1.Model {
    });
    let Post = container.factoryFor('model:post');
    let serializer = container.lookup('serializer:post');
    let payload = yield Post.create(container, {}).save();
    let result = yield serializer.serialize({}, payload, {});
    t.is(result.jsonapi.version, '1.0');
}));
ava_1.default('renders an array of models as an array under `data`', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let container = t.context.container;
    container.register('serializer:post', class TestSerializer extends denali_1.JSONAPISerializer {
        constructor() {
            super(...arguments);
            this.attributes = ['title'];
            this.relationships = {};
        }
    });
    container.register('model:post', (_a = class Post extends denali_1.Model {
        },
        _a.title = denali_1.attr('string'),
        _a));
    let Post = container.factoryFor('model:post');
    let serializer = container.lookup('serializer:post');
    let postOne = yield Post.create(container, { title: 'foo' }).save();
    let postTwo = yield Post.create(container, { title: 'bar' }).save();
    let result = yield serializer.serialize({}, [postOne, postTwo], {});
    t.true(lodash_1.isArray(result.data));
    t.is(result.data[0].id, postOne.id);
    t.is(result.data[1].id, postTwo.id);
    var _a;
}));
ava_1.default('only renders whitelisted attributes', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let container = t.context.container;
    container.register('serializer:post', class PostSerializer extends denali_1.JSONAPISerializer {
        constructor() {
            super(...arguments);
            this.attributes = ['title'];
            this.relationships = {};
        }
    });
    container.register('model:post', (_a = class Post extends denali_1.Model {
        },
        _a.title = denali_1.attr('string'),
        _a.content = denali_1.attr('string'),
        _a));
    let Post = container.factoryFor('model:post');
    let serializer = container.lookup('serializer:post');
    let post = yield Post.create(container, { title: 'foo', content: 'bar' }).save();
    let result = yield serializer.serialize({}, post, {});
    t.is(result.data.attributes.title, 'foo');
    t.falsy(result.data.attributes.content);
    var _a;
}));
ava_1.default('only renders whitelisted relationships', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let container = t.context.container;
    container.register('serializer:post', class PostSerializer extends denali_1.JSONAPISerializer {
        constructor() {
            super(...arguments);
            this.attributes = ['title'];
            this.relationships = {
                comments: {
                    strategy: 'id'
                }
            };
        }
    });
    container.register('serializer:comment', class CommentSerializer extends denali_1.JSONAPISerializer {
        constructor() {
            super(...arguments);
            this.attributes = ['text'];
            this.relationships = {};
        }
    });
    container.register('model:post', (_a = class Post extends denali_1.Model {
        },
        _a.title = denali_1.attr('string'),
        _a.author = denali_1.hasOne('user'),
        _a.comments = denali_1.hasMany('comment'),
        _a));
    container.register('model:comment', (_b = class Comment extends denali_1.Model {
        },
        _b.text = denali_1.attr('string'),
        _b));
    container.register('model:user', class Comment extends denali_1.Model {
    });
    let Post = container.factoryFor('model:post');
    let serializer = container.lookup('serializer:post');
    let post = yield Post.create(container, { title: 'foo' }).save();
    let result = yield serializer.serialize({}, post, {});
    t.true(lodash_1.isArray(result.data.relationships.comments.data));
    t.falsy(result.data.relationships.author);
    var _a, _b;
}));
ava_1.default('uses related serializers to render related records', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let container = t.context.container;
    container.register('serializer:post', class PostSerializer extends denali_1.JSONAPISerializer {
        constructor() {
            super(...arguments);
            this.attributes = ['title'];
            this.relationships = {
                comments: {
                    strategy: 'embed'
                }
            };
        }
    });
    container.register('serializer:comment', class CommentSerializer extends denali_1.JSONAPISerializer {
        constructor() {
            super(...arguments);
            this.attributes = ['text'];
            this.relationships = {};
        }
    });
    container.register('model:post', (_a = class Post extends denali_1.Model {
        },
        _a.title = denali_1.attr('string'),
        _a.comments = denali_1.hasMany('comment'),
        _a));
    container.register('model:comment', (_b = class Comment extends denali_1.Model {
        },
        _b.text = denali_1.attr('string'),
        _b.publishedAt = denali_1.attr('string'),
        _b));
    let Post = container.factoryFor('model:post');
    let Comment = container.factoryFor('model:comment');
    let serializer = container.lookup('serializer:post');
    let post = yield Post.create(container, { title: 'foo' }).save();
    yield post.addComment(yield Comment.create(container, { text: 'bar', publishedAt: 'fizz' }).save());
    let result = yield serializer.serialize({}, post, {});
    t.true(lodash_1.isArray(result.included));
    t.is(result.included[0].attributes.text, 'bar');
    t.falsy(result.included[0].attributes.publishedAt);
    var _a, _b;
}));
ava_1.default.todo('renders resource object meta');
ava_1.default.todo('renders resource object links');
ava_1.default('dasherizes field names', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let container = t.context.container;
    container.register('serializer:post', class TestSerializer extends denali_1.JSONAPISerializer {
        constructor() {
            super(...arguments);
            this.attributes = ['publishedAt'];
            this.relationships = {};
        }
    });
    container.register('model:post', (_a = class Post extends denali_1.Model {
        },
        _a.publishedAt = denali_1.attr('string'),
        _a));
    let Post = container.factoryFor('model:post');
    let serializer = container.lookup('serializer:post');
    let payload = yield Post.create(container, { publishedAt: 'foo' }).save();
    let result = yield serializer.serialize({}, payload, {});
    t.is(result.data.attributes['published-at'], 'foo');
    var _a;
}));
ava_1.default.todo('renders relationship meta');
ava_1.default.todo('renders relationship links');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbi1hcGktdGVzdC5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvYWJ1cmRpbmUvUHJvamVjdHMvZGVuYWxpL21haW4vIiwic291cmNlcyI6WyJ0ZXN0L3VuaXQvcmVuZGVyL2pzb24tYXBpLXRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsMEVBQTBFO0FBQzFFLDZCQUF1QjtBQUN2QixtQ0FBaUM7QUFDakMsbUNBQTJIO0FBRTNILGFBQUksQ0FBQyxVQUFVLENBQUMsQ0FBTyxDQUFDO0lBQ3RCLElBQUksU0FBUyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxHQUFHLElBQUksa0JBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUMvRCxTQUFTLENBQUMsUUFBUSxDQUFDLG1CQUFtQixFQUFFLGVBQU0sQ0FBQyxDQUFDO0lBQ2hELFNBQVMsQ0FBQyxRQUFRLENBQUMsc0JBQXNCLEVBQUUsZUFBTSxDQUFDLENBQUM7SUFDbkQsU0FBUyxDQUFDLFFBQVEsQ0FBQyxZQUFZLEVBQUUsS0FBTSxTQUFRLGVBQU07S0FBRyxDQUFDLENBQUM7SUFDMUQsSUFBSSxNQUFNLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBUyxZQUFZLENBQUMsQ0FBQztJQUNwRCxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTTtRQUNoQixNQUFNLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxZQUFZLENBQUMsQ0FBQztJQUNyQyxDQUFDLENBQUMsQ0FBQztJQUNILFNBQVMsQ0FBQyxRQUFRLENBQUMseUJBQXlCLEVBQUUsS0FBTSxTQUFRLHNCQUFhO0tBQUcsQ0FBQyxDQUFDO0FBQ2hGLENBQUMsQ0FBQSxDQUFDLENBQUM7QUFFSCxhQUFJLENBQUMsNkNBQTZDLEVBQUUsQ0FBTyxDQUFDO0lBQzFELElBQUksU0FBUyxHQUFjLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDO0lBQy9DLFNBQVMsQ0FBQyxRQUFRLENBQUMsaUJBQWlCLEVBQUUsb0JBQXFCLFNB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QUFVLENBQUMsU0FBUyxDQUFNLEVBQUUsRUFBRSxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFFOUQsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQzs7QUFDdEQsQ0FBQyxDQUFBLENBQUMsQ0FBQztBQUVILGFBQUksQ0FBQyxJQUFJLENBQUMsMkJBQTJCLENBQUMsQ0FBQztBQUV2QyxhQUFJLENBQUMsSUFBSSxDQUFDLDRCQUE0QixDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiB0c2xpbnQ6ZGlzYWJsZTpjb21wbGV0ZWQtZG9jcyBuby1lbXB0eSBuby1pbnZhbGlkLXRoaXMgbWVtYmVyLWFjY2VzcyAqL1xuaW1wb3J0IHRlc3QgZnJvbSAnYXZhJztcbmltcG9ydCB7IGlzQXJyYXkgfSBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IHsgSlNPTkFQSVNlcmlhbGl6ZXIsIE1vZGVsLCBhdHRyLCBDb250YWluZXIsIE1lbW9yeUFkYXB0ZXIsIFJvdXRlciwgQWN0aW9uLCBoYXNNYW55LCBFcnJvcnMsIGhhc09uZSB9IGZyb20gJ2RlbmFsaSc7XG5cbnRlc3QuYmVmb3JlRWFjaChhc3luYyAodCkgPT4ge1xuICBsZXQgY29udGFpbmVyID0gdC5jb250ZXh0LmNvbnRhaW5lciA9IG5ldyBDb250YWluZXIoX19kaXJuYW1lKTtcbiAgY29udGFpbmVyLnJlZ2lzdGVyKCdhY3Rpb246cG9zdHMvc2hvdycsIEFjdGlvbik7XG4gIGNvbnRhaW5lci5yZWdpc3RlcignYWN0aW9uOmNvbW1lbnRzL3Nob3cnLCBBY3Rpb24pO1xuICBjb250YWluZXIucmVnaXN0ZXIoJ2FwcDpyb3V0ZXInLCBjbGFzcyBleHRlbmRzIFJvdXRlciB7fSk7XG4gIGxldCByb3V0ZXIgPSBjb250YWluZXIubG9va3VwPFJvdXRlcj4oJ2FwcDpyb3V0ZXInKTtcbiAgcm91dGVyLm1hcCgocm91dGVyKSA9PiB7XG4gICAgcm91dGVyLmdldCgnL3Bvc3RzJywgJ3Bvc3RzL3Nob3cnKTtcbiAgfSk7XG4gIGNvbnRhaW5lci5yZWdpc3Rlcignb3JtLWFkYXB0ZXI6YXBwbGljYXRpb24nLCBjbGFzcyBleHRlbmRzIE1lbW9yeUFkYXB0ZXIge30pO1xufSk7XG5cbnRlc3QoJ3JlbmRlcnMgbW9kZWxzIGFzIEpTT04tQVBJIHJlc291cmNlIG9iamVjdHMnLCBhc3luYyAodCkgPT4ge1xuICBsZXQgY29udGFpbmVyID0gPENvbnRhaW5lcj50LmNvbnRleHQuY29udGFpbmVyO1xuICBjb250YWluZXIucmVnaXN0ZXIoJ3NlcmlhbGl6ZXI6cG9zdCcsIGNsYXNzIFRlc3RTZXJpYWxpemVyIGV4dGVuZHMgSlNPTkFQSVNlcmlhbGl6ZXIge1xuICAgIGF0dHJpYnV0ZXMgPSBbICd0aXRsZScgXTtcbiAgICByZWxhdGlvbnNoaXBzID0ge307XG4gIH0pO1xuICBjb250YWluZXIucmVnaXN0ZXIoJ21vZGVsOnBvc3QnLCBjbGFzcyBQb3N0IGV4dGVuZHMgTW9kZWwge1xuICAgIHN0YXRpYyB0aXRsZSA9IGF0dHIoJ3N0cmluZycpO1xuICB9KTtcbiAgbGV0IFBvc3QgPSBjb250YWluZXIuZmFjdG9yeUZvcignbW9kZWw6cG9zdCcpO1xuICBsZXQgc2VyaWFsaXplciA9IGNvbnRhaW5lci5sb29rdXAoJ3NlcmlhbGl6ZXI6cG9zdCcpO1xuXG4gIGxldCBwYXlsb2FkID0gYXdhaXQgUG9zdC5jcmVhdGUoY29udGFpbmVyLCB7IHRpdGxlOiAnZm9vJyB9KS5zYXZlKCk7XG4gIGxldCByZXN1bHQgPSBhd2FpdCBzZXJpYWxpemVyLnNlcmlhbGl6ZSg8YW55Pnt9LCBwYXlsb2FkLCB7fSk7XG5cbiAgdC5pcyhyZXN1bHQuZGF0YS5hdHRyaWJ1dGVzLnRpdGxlLCAnZm9vJyk7XG59KTtcblxudGVzdCgncmVuZGVycyBlcnJvcnMgYWNjb3JkaW5nIHRvIHNwZWMnLCBhc3luYyAodCkgPT4ge1xuICBsZXQgY29udGFpbmVyID0gPENvbnRhaW5lcj50LmNvbnRleHQuY29udGFpbmVyO1xuICBjb250YWluZXIucmVnaXN0ZXIoJ3NlcmlhbGl6ZXI6YXBwbGljYXRpb24nLCBjbGFzcyBUZXN0U2VyaWFsaXplciBleHRlbmRzIEpTT05BUElTZXJpYWxpemVyIHtcbiAgICBhdHRyaWJ1dGVzOiBzdHJpbmdbXSA9IFtdO1xuICAgIHJlbGF0aW9uc2hpcHMgPSB7fTtcbiAgfSk7XG4gIGxldCBzZXJpYWxpemVyID0gY29udGFpbmVyLmxvb2t1cCgnc2VyaWFsaXplcjphcHBsaWNhdGlvbicpO1xuXG4gIGxldCByZXN1bHQgPSBhd2FpdCBzZXJpYWxpemVyLnNlcmlhbGl6ZSg8YW55Pnt9LCBuZXcgRXJyb3JzLkludGVybmFsU2VydmVyRXJyb3IoJ2ZvbycpLCB7fSk7XG5cbiAgdC5pcyhyZXN1bHQuZXJyb3JzWzBdLnN0YXR1cywgNTAwKTtcbiAgdC5pcyhyZXN1bHQuZXJyb3JzWzBdLmNvZGUsICdJbnRlcm5hbFNlcnZlckVycm9yJyk7XG4gIHQuaXMocmVzdWx0LmVycm9yc1swXS5kZXRhaWwsICdmb28nKTtcbn0pO1xuXG50ZXN0KCdyZW5kZXJzIHZhbGlkYXRpb24gZXJyb3JzIHdpdGggYWRkaXRpb25hbCBkZXRhaWxzJywgYXN5bmMgKHQpID0+IHtcbiAgbGV0IGNvbnRhaW5lciA9IDxDb250YWluZXI+dC5jb250ZXh0LmNvbnRhaW5lcjtcbiAgY29udGFpbmVyLnJlZ2lzdGVyKCdzZXJpYWxpemVyOmFwcGxpY2F0aW9uJywgY2xhc3MgVGVzdFNlcmlhbGl6ZXIgZXh0ZW5kcyBKU09OQVBJU2VyaWFsaXplciB7XG4gICAgYXR0cmlidXRlczogc3RyaW5nW10gPSBbXTtcbiAgICByZWxhdGlvbnNoaXBzID0ge307XG4gIH0pO1xuICBsZXQgc2VyaWFsaXplciA9IGNvbnRhaW5lci5sb29rdXAoJ3NlcmlhbGl6ZXI6YXBwbGljYXRpb24nKTtcblxuICBsZXQgZXJyb3IgPSA8YW55Pm5ldyBFcnJvcnMuVW5wcm9jZXNzYWJsZUVudGl0eSgnRW1haWwgY2Fubm90IGJlIGJsYW5rJyk7XG4gIGVycm9yLnRpdGxlID0gJ3ByZXNlbmNlJztcbiAgZXJyb3Iuc291cmNlID0gJy9kYXRhL2F0dHJpYnV0ZXMvZW1haWwnO1xuICBsZXQgcmVzdWx0ID0gYXdhaXQgc2VyaWFsaXplci5zZXJpYWxpemUoPGFueT57fSwgZXJyb3IsIHt9KTtcblxuICB0LmlzKHJlc3VsdC5lcnJvcnNbMF0uc3RhdHVzLCA0MjIpO1xuICB0LmlzKHJlc3VsdC5lcnJvcnNbMF0uY29kZSwgJ1VucHJvY2Vzc2FibGVFbnRpdHlFcnJvcicpO1xuICB0LmlzKHJlc3VsdC5lcnJvcnNbMF0udGl0bGUsICdwcmVzZW5jZScpO1xuICB0LmlzKHJlc3VsdC5lcnJvcnNbMF0uc291cmNlLCAnL2RhdGEvYXR0cmlidXRlcy9lbWFpbCcpO1xuICB0LmlzKHJlc3VsdC5lcnJvcnNbMF0uZGV0YWlsLCAnRW1haWwgY2Fubm90IGJlIGJsYW5rJyk7XG59KTtcblxudGVzdCgnc2lkZWxvYWRzIHJlbGF0ZWQgcmVjb3JkcycsIGFzeW5jICh0KSA9PiB7XG4gIGxldCBjb250YWluZXIgPSA8Q29udGFpbmVyPnQuY29udGV4dC5jb250YWluZXI7XG4gIGNvbnRhaW5lci5yZWdpc3Rlcignc2VyaWFsaXplcjpwb3N0JywgY2xhc3MgUG9zdFNlcmlhbGl6ZXIgZXh0ZW5kcyBKU09OQVBJU2VyaWFsaXplciB7XG4gICAgYXR0cmlidXRlcyA9IFsgJ3RpdGxlJyBdO1xuICAgIHJlbGF0aW9uc2hpcHMgPSB7XG4gICAgICBjb21tZW50czoge1xuICAgICAgICBzdHJhdGVneTogJ2VtYmVkJ1xuICAgICAgfVxuICAgIH07XG4gIH0pO1xuICBjb250YWluZXIucmVnaXN0ZXIoJ3NlcmlhbGl6ZXI6Y29tbWVudCcsIGNsYXNzIENvbW1lbnRTZXJpYWxpemVyIGV4dGVuZHMgSlNPTkFQSVNlcmlhbGl6ZXIge1xuICAgIGF0dHJpYnV0ZXMgPSBbICd0ZXh0JyBdO1xuICAgIHJlbGF0aW9uc2hpcHMgPSB7fTtcbiAgfSk7XG4gIGNvbnRhaW5lci5yZWdpc3RlcignbW9kZWw6cG9zdCcsIGNsYXNzIFBvc3QgZXh0ZW5kcyBNb2RlbCB7XG4gICAgc3RhdGljIHRpdGxlID0gYXR0cignc3RyaW5nJyk7XG4gICAgc3RhdGljIGNvbW1lbnRzID0gaGFzTWFueSgnY29tbWVudCcpO1xuICB9KTtcbiAgY29udGFpbmVyLnJlZ2lzdGVyKCdtb2RlbDpjb21tZW50JywgY2xhc3MgQ29tbWVudCBleHRlbmRzIE1vZGVsIHtcbiAgICBzdGF0aWMgdGV4dCA9IGF0dHIoJ3N0cmluZycpO1xuICB9KTtcbiAgbGV0IFBvc3QgPSBjb250YWluZXIuZmFjdG9yeUZvcignbW9kZWw6cG9zdCcpO1xuICBsZXQgQ29tbWVudCA9IGNvbnRhaW5lci5mYWN0b3J5Rm9yKCdtb2RlbDpjb21tZW50Jyk7XG4gIGxldCBzZXJpYWxpemVyID0gY29udGFpbmVyLmxvb2t1cCgnc2VyaWFsaXplcjpwb3N0Jyk7XG5cbiAgbGV0IHBvc3QgPSBhd2FpdCBQb3N0LmNyZWF0ZShjb250YWluZXIsIHsgdGl0bGU6ICdmb28nIH0pLnNhdmUoKTtcbiAgbGV0IGNvbW1lbnQgPSBhd2FpdCBDb21tZW50LmNyZWF0ZShjb250YWluZXIsIHsgdGV4dDogJ2JhcicgfSkuc2F2ZSgpO1xuICBhd2FpdCBwb3N0LmFkZENvbW1lbnQoY29tbWVudCk7XG4gIGxldCByZXN1bHQgPSBhd2FpdCBzZXJpYWxpemVyLnNlcmlhbGl6ZSg8YW55Pnt9LCBwb3N0LCB7fSk7XG5cbiAgdC50cnVlKGlzQXJyYXkocmVzdWx0LmluY2x1ZGVkKSk7XG4gIHQuaXMocmVzdWx0LmluY2x1ZGVkWzBdLmF0dHJpYnV0ZXMudGV4dCwgJ2JhcicpO1xufSk7XG5cbnRlc3QudG9kbygnZGVkdXBlcyBzaWRlbG9hZGVkIHJlbGF0ZWQgcmVjb3JkcycpO1xuXG50ZXN0KCdlbWJlZHMgcmVsYXRlZCByZWNvcmRzIGFzIHJlc291cmNlIGxpbmthZ2Ugb2JqZWN0cycsIGFzeW5jICh0KSA9PiB7XG4gIGxldCBjb250YWluZXIgPSA8Q29udGFpbmVyPnQuY29udGV4dC5jb250YWluZXI7XG4gIGNvbnRhaW5lci5yZWdpc3Rlcignc2VyaWFsaXplcjpwb3N0JywgY2xhc3MgUG9zdFNlcmlhbGl6ZXIgZXh0ZW5kcyBKU09OQVBJU2VyaWFsaXplciB7XG4gICAgYXR0cmlidXRlcyA9IFsgJ3RpdGxlJyBdO1xuICAgIHJlbGF0aW9uc2hpcHMgPSB7XG4gICAgICBjb21tZW50czoge1xuICAgICAgICBzdHJhdGVneTogJ2lkJ1xuICAgICAgfVxuICAgIH07XG4gIH0pO1xuICBjb250YWluZXIucmVnaXN0ZXIoJ3NlcmlhbGl6ZXI6Y29tbWVudCcsIGNsYXNzIENvbW1lbnRTZXJpYWxpemVyIGV4dGVuZHMgSlNPTkFQSVNlcmlhbGl6ZXIge1xuICAgIGF0dHJpYnV0ZXMgPSBbICd0ZXh0JyBdO1xuICAgIHJlbGF0aW9uc2hpcHMgPSB7fTtcbiAgfSk7XG4gIGNvbnRhaW5lci5yZWdpc3RlcignbW9kZWw6cG9zdCcsIGNsYXNzIFBvc3QgZXh0ZW5kcyBNb2RlbCB7XG4gICAgc3RhdGljIHRpdGxlID0gYXR0cignc3RyaW5nJyk7XG4gICAgc3RhdGljIGNvbW1lbnRzID0gaGFzTWFueSgnY29tbWVudCcpO1xuICB9KTtcbiAgY29udGFpbmVyLnJlZ2lzdGVyKCdtb2RlbDpjb21tZW50JywgY2xhc3MgQ29tbWVudCBleHRlbmRzIE1vZGVsIHtcbiAgICBzdGF0aWMgdGV4dCA9IGF0dHIoJ3N0cmluZycpO1xuICB9KTtcbiAgbGV0IFBvc3QgPSBjb250YWluZXIuZmFjdG9yeUZvcignbW9kZWw6cG9zdCcpO1xuICBsZXQgQ29tbWVudCA9IGNvbnRhaW5lci5mYWN0b3J5Rm9yKCdtb2RlbDpjb21tZW50Jyk7XG4gIGxldCBzZXJpYWxpemVyID0gY29udGFpbmVyLmxvb2t1cCgnc2VyaWFsaXplcjpwb3N0Jyk7XG5cbiAgbGV0IHBvc3QgPSBhd2FpdCBQb3N0LmNyZWF0ZShjb250YWluZXIsIHsgdGl0bGU6ICdmb28nIH0pLnNhdmUoKTtcbiAgbGV0IGNvbW1lbnQgPSBhd2FpdCBDb21tZW50LmNyZWF0ZShjb250YWluZXIsIHsgdGV4dDogJ2JhcicgfSkuc2F2ZSgpO1xuICBhd2FpdCBwb3N0LmFkZENvbW1lbnQoY29tbWVudCk7XG4gIGxldCByZXN1bHQgPSBhd2FpdCBzZXJpYWxpemVyLnNlcmlhbGl6ZSg8YW55Pnt9LCBwb3N0LCB7fSk7XG5cbiAgdC50cnVlKGlzQXJyYXkocmVzdWx0LmluY2x1ZGVkKSk7XG4gIHQuaXMocmVzdWx0LmluY2x1ZGVkWzBdLmlkLCBjb21tZW50LmlkKTtcbiAgdC5pcyhyZXN1bHQuaW5jbHVkZWRbMF0udHlwZSwgJ2NvbW1lbnRzJyk7XG59KTtcblxudGVzdCgncmVuZGVycyBkb2N1bWVudCBtZXRhJywgYXN5bmMgKHQpID0+IHtcbiAgbGV0IGNvbnRhaW5lciA9IDxDb250YWluZXI+dC5jb250ZXh0LmNvbnRhaW5lcjtcbiAgY29udGFpbmVyLnJlZ2lzdGVyKCdzZXJpYWxpemVyOnBvc3QnLCBjbGFzcyBUZXN0U2VyaWFsaXplciBleHRlbmRzIEpTT05BUElTZXJpYWxpemVyIHtcbiAgICBhdHRyaWJ1dGVzOiBzdHJpbmdbXSA9IFtdO1xuICAgIHJlbGF0aW9uc2hpcHMgPSB7fTtcbiAgfSk7XG4gIGNvbnRhaW5lci5yZWdpc3RlcignbW9kZWw6cG9zdCcsIGNsYXNzIFBvc3QgZXh0ZW5kcyBNb2RlbCB7fSk7XG4gIGxldCBQb3N0ID0gY29udGFpbmVyLmZhY3RvcnlGb3IoJ21vZGVsOnBvc3QnKTtcbiAgbGV0IHNlcmlhbGl6ZXIgPSBjb250YWluZXIubG9va3VwKCdzZXJpYWxpemVyOnBvc3QnKTtcblxuICBsZXQgcGF5bG9hZCA9IGF3YWl0IFBvc3QuY3JlYXRlKGNvbnRhaW5lciwge30pLnNhdmUoKTtcbiAgbGV0IHJlc3VsdCA9IGF3YWl0IHNlcmlhbGl6ZXIuc2VyaWFsaXplKDxhbnk+e30sIHBheWxvYWQsIHsgbWV0YTogeyBmb286IHRydWUgfX0pO1xuXG4gIHQudHJ1ZShyZXN1bHQubWV0YS5mb28pO1xufSk7XG5cbnRlc3QoJ3JlbmRlcnMgZG9jdW1lbnQgbGlua3MnLCBhc3luYyAodCkgPT4ge1xuICBsZXQgY29udGFpbmVyID0gPENvbnRhaW5lcj50LmNvbnRleHQuY29udGFpbmVyO1xuICBjb250YWluZXIucmVnaXN0ZXIoJ3NlcmlhbGl6ZXI6cG9zdCcsIGNsYXNzIFRlc3RTZXJpYWxpemVyIGV4dGVuZHMgSlNPTkFQSVNlcmlhbGl6ZXIge1xuICAgIGF0dHJpYnV0ZXM6IHN0cmluZ1tdID0gW107XG4gICAgcmVsYXRpb25zaGlwcyA9IHt9O1xuICB9KTtcbiAgY29udGFpbmVyLnJlZ2lzdGVyKCdtb2RlbDpwb3N0JywgY2xhc3MgUG9zdCBleHRlbmRzIE1vZGVsIHt9KTtcbiAgbGV0IFBvc3QgPSBjb250YWluZXIuZmFjdG9yeUZvcignbW9kZWw6cG9zdCcpO1xuICBsZXQgc2VyaWFsaXplciA9IGNvbnRhaW5lci5sb29rdXAoJ3NlcmlhbGl6ZXI6cG9zdCcpO1xuXG4gIGxldCBwYXlsb2FkID0gYXdhaXQgUG9zdC5jcmVhdGUoY29udGFpbmVyLCB7fSkuc2F2ZSgpO1xuICBsZXQgcmVzdWx0ID0gYXdhaXQgc2VyaWFsaXplci5zZXJpYWxpemUoPGFueT57fSwgcGF5bG9hZCwgeyBsaW5rczogeyBmb286IHRydWUgfX0pO1xuXG4gIHQudHJ1ZShyZXN1bHQubGlua3MuZm9vKTtcbn0pO1xuXG50ZXN0KCdyZW5kZXJzIGpzb25hcGkgdmVyc2lvbicsIGFzeW5jICh0KSA9PiB7XG4gIGxldCBjb250YWluZXIgPSA8Q29udGFpbmVyPnQuY29udGV4dC5jb250YWluZXI7XG4gIGNvbnRhaW5lci5yZWdpc3Rlcignc2VyaWFsaXplcjpwb3N0JywgY2xhc3MgVGVzdFNlcmlhbGl6ZXIgZXh0ZW5kcyBKU09OQVBJU2VyaWFsaXplciB7XG4gICAgYXR0cmlidXRlczogc3RyaW5nW10gPSBbXTtcbiAgICByZWxhdGlvbnNoaXBzID0ge307XG4gIH0pO1xuICBjb250YWluZXIucmVnaXN0ZXIoJ21vZGVsOnBvc3QnLCBjbGFzcyBQb3N0IGV4dGVuZHMgTW9kZWwge30pO1xuICBsZXQgUG9zdCA9IGNvbnRhaW5lci5mYWN0b3J5Rm9yKCdtb2RlbDpwb3N0Jyk7XG4gIGxldCBzZXJpYWxpemVyID0gY29udGFpbmVyLmxvb2t1cCgnc2VyaWFsaXplcjpwb3N0Jyk7XG5cbiAgbGV0IHBheWxvYWQgPSBhd2FpdCBQb3N0LmNyZWF0ZShjb250YWluZXIsIHt9KS5zYXZlKCk7XG4gIGxldCByZXN1bHQgPSBhd2FpdCBzZXJpYWxpemVyLnNlcmlhbGl6ZSg8YW55Pnt9LCBwYXlsb2FkLCB7fSk7XG5cbiAgdC5pcyhyZXN1bHQuanNvbmFwaS52ZXJzaW9uLCAnMS4wJyk7XG59KTtcblxudGVzdCgncmVuZGVycyBhbiBhcnJheSBvZiBtb2RlbHMgYXMgYW4gYXJyYXkgdW5kZXIgYGRhdGFgJywgYXN5bmMgKHQpID0+IHtcbiAgbGV0IGNvbnRhaW5lciA9IDxDb250YWluZXI+dC5jb250ZXh0LmNvbnRhaW5lcjtcbiAgY29udGFpbmVyLnJlZ2lzdGVyKCdzZXJpYWxpemVyOnBvc3QnLCBjbGFzcyBUZXN0U2VyaWFsaXplciBleHRlbmRzIEpTT05BUElTZXJpYWxpemVyIHtcbiAgICBhdHRyaWJ1dGVzID0gWyAndGl0bGUnIF07XG4gICAgcmVsYXRpb25zaGlwcyA9IHt9O1xuICB9KTtcbiAgY29udGFpbmVyLnJlZ2lzdGVyKCdtb2RlbDpwb3N0JywgY2xhc3MgUG9zdCBleHRlbmRzIE1vZGVsIHtcbiAgICBzdGF0aWMgdGl0bGUgPSBhdHRyKCdzdHJpbmcnKTtcbiAgfSk7XG4gIGxldCBQb3N0ID0gY29udGFpbmVyLmZhY3RvcnlGb3IoJ21vZGVsOnBvc3QnKTtcbiAgbGV0IHNlcmlhbGl6ZXIgPSBjb250YWluZXIubG9va3VwKCdzZXJpYWxpemVyOnBvc3QnKTtcblxuICBsZXQgcG9zdE9uZSA9IGF3YWl0IFBvc3QuY3JlYXRlKGNvbnRhaW5lciwgeyB0aXRsZTogJ2ZvbycgfSkuc2F2ZSgpO1xuICBsZXQgcG9zdFR3byA9IGF3YWl0IFBvc3QuY3JlYXRlKGNvbnRhaW5lciwgeyB0aXRsZTogJ2JhcicgfSkuc2F2ZSgpO1xuICBsZXQgcmVzdWx0ID0gYXdhaXQgc2VyaWFsaXplci5zZXJpYWxpemUoPGFueT57fSwgWyBwb3N0T25lLCBwb3N0VHdvIF0sIHt9KTtcblxuICB0LnRydWUoaXNBcnJheShyZXN1bHQuZGF0YSkpO1xuICB0LmlzKHJlc3VsdC5kYXRhWzBdLmlkLCBwb3N0T25lLmlkKTtcbiAgdC5pcyhyZXN1bHQuZGF0YVsxXS5pZCwgcG9zdFR3by5pZCk7XG59KTtcblxudGVzdCgnb25seSByZW5kZXJzIHdoaXRlbGlzdGVkIGF0dHJpYnV0ZXMnLCBhc3luYyAodCkgPT4ge1xuICBsZXQgY29udGFpbmVyID0gPENvbnRhaW5lcj50LmNvbnRleHQuY29udGFpbmVyO1xuICBjb250YWluZXIucmVnaXN0ZXIoJ3NlcmlhbGl6ZXI6cG9zdCcsIGNsYXNzIFBvc3RTZXJpYWxpemVyIGV4dGVuZHMgSlNPTkFQSVNlcmlhbGl6ZXIge1xuICAgIGF0dHJpYnV0ZXMgPSBbICd0aXRsZScgXTtcbiAgICByZWxhdGlvbnNoaXBzID0ge307XG4gIH0pO1xuICBjb250YWluZXIucmVnaXN0ZXIoJ21vZGVsOnBvc3QnLCBjbGFzcyBQb3N0IGV4dGVuZHMgTW9kZWwge1xuICAgIHN0YXRpYyB0aXRsZSA9IGF0dHIoJ3N0cmluZycpO1xuICAgIHN0YXRpYyBjb250ZW50ID0gYXR0cignc3RyaW5nJyk7XG4gIH0pO1xuICBsZXQgUG9zdCA9IGNvbnRhaW5lci5mYWN0b3J5Rm9yKCdtb2RlbDpwb3N0Jyk7XG4gIGxldCBzZXJpYWxpemVyID0gY29udGFpbmVyLmxvb2t1cCgnc2VyaWFsaXplcjpwb3N0Jyk7XG5cbiAgbGV0IHBvc3QgPSBhd2FpdCBQb3N0LmNyZWF0ZShjb250YWluZXIsIHsgdGl0bGU6ICdmb28nLCBjb250ZW50OiAnYmFyJyB9KS5zYXZlKCk7XG4gIGxldCByZXN1bHQgPSBhd2FpdCBzZXJpYWxpemVyLnNlcmlhbGl6ZSg8YW55Pnt9LCBwb3N0LCB7fSk7XG5cbiAgdC5pcyhyZXN1bHQuZGF0YS5hdHRyaWJ1dGVzLnRpdGxlLCAnZm9vJyk7XG4gIHQuZmFsc3kocmVzdWx0LmRhdGEuYXR0cmlidXRlcy5jb250ZW50KTtcbn0pO1xuXG50ZXN0KCdvbmx5IHJlbmRlcnMgd2hpdGVsaXN0ZWQgcmVsYXRpb25zaGlwcycsIGFzeW5jICh0KSA9PiB7XG4gIGxldCBjb250YWluZXIgPSA8Q29udGFpbmVyPnQuY29udGV4dC5jb250YWluZXI7XG4gIGNvbnRhaW5lci5yZWdpc3Rlcignc2VyaWFsaXplcjpwb3N0JywgY2xhc3MgUG9zdFNlcmlhbGl6ZXIgZXh0ZW5kcyBKU09OQVBJU2VyaWFsaXplciB7XG4gICAgYXR0cmlidXRlcyA9IFsgJ3RpdGxlJyBdO1xuICAgIHJlbGF0aW9uc2hpcHMgPSB7XG4gICAgICBjb21tZW50czoge1xuICAgICAgICBzdHJhdGVneTogJ2lkJ1xuICAgICAgfVxuICAgIH07XG4gIH0pO1xuICBjb250YWluZXIucmVnaXN0ZXIoJ3NlcmlhbGl6ZXI6Y29tbWVudCcsIGNsYXNzIENvbW1lbnRTZXJpYWxpemVyIGV4dGVuZHMgSlNPTkFQSVNlcmlhbGl6ZXIge1xuICAgIGF0dHJpYnV0ZXMgPSBbICd0ZXh0JyBdO1xuICAgIHJlbGF0aW9uc2hpcHMgPSB7fTtcbiAgfSk7XG4gIGNvbnRhaW5lci5yZWdpc3RlcignbW9kZWw6cG9zdCcsIGNsYXNzIFBvc3QgZXh0ZW5kcyBNb2RlbCB7XG4gICAgc3RhdGljIHRpdGxlID0gYXR0cignc3RyaW5nJyk7XG4gICAgc3RhdGljIGF1dGhvciA9IGhhc09uZSgndXNlcicpO1xuICAgIHN0YXRpYyBjb21tZW50cyA9IGhhc01hbnkoJ2NvbW1lbnQnKTtcbiAgfSk7XG4gIGNvbnRhaW5lci5yZWdpc3RlcignbW9kZWw6Y29tbWVudCcsIGNsYXNzIENvbW1lbnQgZXh0ZW5kcyBNb2RlbCB7XG4gICAgc3RhdGljIHRleHQgPSBhdHRyKCdzdHJpbmcnKTtcbiAgfSk7XG4gIGNvbnRhaW5lci5yZWdpc3RlcignbW9kZWw6dXNlcicsIGNsYXNzIENvbW1lbnQgZXh0ZW5kcyBNb2RlbCB7fSk7XG4gIGxldCBQb3N0ID0gY29udGFpbmVyLmZhY3RvcnlGb3IoJ21vZGVsOnBvc3QnKTtcbiAgbGV0IHNlcmlhbGl6ZXIgPSBjb250YWluZXIubG9va3VwKCdzZXJpYWxpemVyOnBvc3QnKTtcblxuICBsZXQgcG9zdCA9IGF3YWl0IFBvc3QuY3JlYXRlKGNvbnRhaW5lciwgeyB0aXRsZTogJ2ZvbycgfSkuc2F2ZSgpO1xuICBsZXQgcmVzdWx0ID0gYXdhaXQgc2VyaWFsaXplci5zZXJpYWxpemUoPGFueT57fSwgcG9zdCwge30pO1xuXG4gIHQudHJ1ZShpc0FycmF5KHJlc3VsdC5kYXRhLnJlbGF0aW9uc2hpcHMuY29tbWVudHMuZGF0YSkpO1xuICB0LmZhbHN5KHJlc3VsdC5kYXRhLnJlbGF0aW9uc2hpcHMuYXV0aG9yKTtcbn0pO1xuXG50ZXN0KCd1c2VzIHJlbGF0ZWQgc2VyaWFsaXplcnMgdG8gcmVuZGVyIHJlbGF0ZWQgcmVjb3JkcycsIGFzeW5jICh0KSA9PiB7XG4gIGxldCBjb250YWluZXIgPSA8Q29udGFpbmVyPnQuY29udGV4dC5jb250YWluZXI7XG4gIGNvbnRhaW5lci5yZWdpc3Rlcignc2VyaWFsaXplcjpwb3N0JywgY2xhc3MgUG9zdFNlcmlhbGl6ZXIgZXh0ZW5kcyBKU09OQVBJU2VyaWFsaXplciB7XG4gICAgYXR0cmlidXRlcyA9IFsgJ3RpdGxlJyBdO1xuICAgIHJlbGF0aW9uc2hpcHMgPSB7XG4gICAgICBjb21tZW50czoge1xuICAgICAgICBzdHJhdGVneTogJ2VtYmVkJ1xuICAgICAgfVxuICAgIH07XG4gIH0pO1xuICBjb250YWluZXIucmVnaXN0ZXIoJ3NlcmlhbGl6ZXI6Y29tbWVudCcsIGNsYXNzIENvbW1lbnRTZXJpYWxpemVyIGV4dGVuZHMgSlNPTkFQSVNlcmlhbGl6ZXIge1xuICAgIGF0dHJpYnV0ZXMgPSBbICd0ZXh0JyBdO1xuICAgIHJlbGF0aW9uc2hpcHMgPSB7fTtcbiAgfSk7XG4gIGNvbnRhaW5lci5yZWdpc3RlcignbW9kZWw6cG9zdCcsIGNsYXNzIFBvc3QgZXh0ZW5kcyBNb2RlbCB7XG4gICAgc3RhdGljIHRpdGxlID0gYXR0cignc3RyaW5nJyk7XG4gICAgc3RhdGljIGNvbW1lbnRzID0gaGFzTWFueSgnY29tbWVudCcpO1xuICB9KTtcbiAgY29udGFpbmVyLnJlZ2lzdGVyKCdtb2RlbDpjb21tZW50JywgY2xhc3MgQ29tbWVudCBleHRlbmRzIE1vZGVsIHtcbiAgICBzdGF0aWMgdGV4dCA9IGF0dHIoJ3N0cmluZycpO1xuICAgIHN0YXRpYyBwdWJsaXNoZWRBdCA9IGF0dHIoJ3N0cmluZycpO1xuICB9KTtcbiAgbGV0IFBvc3QgPSBjb250YWluZXIuZmFjdG9yeUZvcignbW9kZWw6cG9zdCcpO1xuICBsZXQgQ29tbWVudCA9IGNvbnRhaW5lci5mYWN0b3J5Rm9yKCdtb2RlbDpjb21tZW50Jyk7XG4gIGxldCBzZXJpYWxpemVyID0gY29udGFpbmVyLmxvb2t1cCgnc2VyaWFsaXplcjpwb3N0Jyk7XG5cbiAgbGV0IHBvc3QgPSBhd2FpdCBQb3N0LmNyZWF0ZShjb250YWluZXIsIHsgdGl0bGU6ICdmb28nIH0pLnNhdmUoKTtcbiAgYXdhaXQgcG9zdC5hZGRDb21tZW50KGF3YWl0IENvbW1lbnQuY3JlYXRlKGNvbnRhaW5lciwgeyB0ZXh0OiAnYmFyJywgcHVibGlzaGVkQXQ6ICdmaXp6JyB9KS5zYXZlKCkpO1xuICBsZXQgcmVzdWx0ID0gYXdhaXQgc2VyaWFsaXplci5zZXJpYWxpemUoPGFueT57fSwgcG9zdCwge30pO1xuXG4gIHQudHJ1ZShpc0FycmF5KHJlc3VsdC5pbmNsdWRlZCkpO1xuICB0LmlzKHJlc3VsdC5pbmNsdWRlZFswXS5hdHRyaWJ1dGVzLnRleHQsICdiYXInKTtcbiAgdC5mYWxzeShyZXN1bHQuaW5jbHVkZWRbMF0uYXR0cmlidXRlcy5wdWJsaXNoZWRBdCk7XG59KTtcblxudGVzdC50b2RvKCdyZW5kZXJzIHJlc291cmNlIG9iamVjdCBtZXRhJyk7XG5cbnRlc3QudG9kbygncmVuZGVycyByZXNvdXJjZSBvYmplY3QgbGlua3MnKTtcblxudGVzdCgnZGFzaGVyaXplcyBmaWVsZCBuYW1lcycsIGFzeW5jICh0KSA9PiB7XG4gIGxldCBjb250YWluZXIgPSA8Q29udGFpbmVyPnQuY29udGV4dC5jb250YWluZXI7XG4gIGNvbnRhaW5lci5yZWdpc3Rlcignc2VyaWFsaXplcjpwb3N0JywgY2xhc3MgVGVzdFNlcmlhbGl6ZXIgZXh0ZW5kcyBKU09OQVBJU2VyaWFsaXplciB7XG4gICAgYXR0cmlidXRlcyA9IFsgJ3B1Ymxpc2hlZEF0JyBdO1xuICAgIHJlbGF0aW9uc2hpcHMgPSB7fTtcbiAgfSk7XG4gIGNvbnRhaW5lci5yZWdpc3RlcignbW9kZWw6cG9zdCcsIGNsYXNzIFBvc3QgZXh0ZW5kcyBNb2RlbCB7XG4gICAgc3RhdGljIHB1Ymxpc2hlZEF0ID0gYXR0cignc3RyaW5nJyk7XG4gIH0pO1xuICBsZXQgUG9zdCA9IGNvbnRhaW5lci5mYWN0b3J5Rm9yKCdtb2RlbDpwb3N0Jyk7XG4gIGxldCBzZXJpYWxpemVyID0gY29udGFpbmVyLmxvb2t1cCgnc2VyaWFsaXplcjpwb3N0Jyk7XG5cbiAgbGV0IHBheWxvYWQgPSBhd2FpdCBQb3N0LmNyZWF0ZShjb250YWluZXIsIHsgcHVibGlzaGVkQXQ6ICdmb28nIH0pLnNhdmUoKTtcbiAgbGV0IHJlc3VsdCA9IGF3YWl0IHNlcmlhbGl6ZXIuc2VyaWFsaXplKDxhbnk+e30sIHBheWxvYWQsIHt9KTtcblxuICB0LmlzKHJlc3VsdC5kYXRhLmF0dHJpYnV0ZXNbJ3B1Ymxpc2hlZC1hdCddLCAnZm9vJyk7XG59KTtcblxudGVzdC50b2RvKCdyZW5kZXJzIHJlbGF0aW9uc2hpcCBtZXRhJyk7XG5cbnRlc3QudG9kbygncmVuZGVycyByZWxhdGlvbnNoaXAgbGlua3MnKTtcbiJdfQ==