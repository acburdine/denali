"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/* tslint:disable:completed-docs no-empty no-invalid-this member-access */
const ava_1 = require("ava");
const lodash_1 = require("lodash");
const denali_1 = require("denali");
ava_1.default.beforeEach((t) => {
    t.context.container = new denali_1.Container(__dirname);
    t.context.container.register('orm-adapter:application', denali_1.MemoryAdapter);
});
ava_1.default('renders models as flat json structures', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let container = t.context.container;
    container.register('serializer:application', class TestSerializer extends denali_1.FlatSerializer {
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
    let serializer = container.lookup('serializer:application');
    let Post = container.factoryFor('model:post');
    let post = yield Post.create({ title: 'foo' }).save();
    let result = yield serializer.serialize({}, post, {});
    t.is(result.title, 'foo');
    var _a;
}));
ava_1.default('renders related records as embedded objects', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let container = t.context.container;
    container.register('serializer:post', class PostSerializer extends denali_1.FlatSerializer {
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
    container.register('serializer:comment', class CommentSerializer extends denali_1.FlatSerializer {
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
    let post = yield Post.create({ title: 'foo' }).save();
    yield post.addComment(yield Comment.create({ text: 'bar' }).save());
    let result = yield serializer.serialize({}, post, {});
    t.true(lodash_1.isArray(result.comments));
    t.is(result.comments[0].text, 'bar');
    var _a, _b;
}));
ava_1.default('renders related records as embedded ids', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let container = t.context.container;
    container.register('serializer:post', class PostSerializer extends denali_1.FlatSerializer {
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
    container.register('serializer:comment', class CommentSerializer extends denali_1.FlatSerializer {
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
    let post = yield Post.create({ title: 'foo' }).save();
    let comment = yield Comment.create({ text: 'bar' }).save();
    yield post.addComment(comment);
    let result = yield serializer.serialize({}, post, {});
    t.true(lodash_1.isArray(result.comments));
    t.is(result.comments[0], comment.id);
    var _a, _b;
}));
ava_1.default('renders errors', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let container = t.context.container;
    container.register('serializer:application', class PostSerializer extends denali_1.FlatSerializer {
        constructor() {
            super(...arguments);
            this.attributes = [];
            this.relationships = {};
        }
    });
    let serializer = container.lookup('serializer:application');
    let result = yield serializer.serialize({}, new denali_1.Errors.InternalServerError('foo'), {});
    t.is(result.status, 500);
    t.is(result.code, 'InternalServerError');
    t.is(result.message, 'foo');
}));
ava_1.default('only renders whitelisted attributes', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let container = t.context.container;
    container.register('serializer:post', class PostSerializer extends denali_1.FlatSerializer {
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
    let post = yield Post.create({ title: 'foo', content: 'bar' }).save();
    let result = yield serializer.serialize({}, post, {});
    t.is(result.title, 'foo');
    t.falsy(result.content);
    var _a;
}));
ava_1.default('only renders whitelisted relationships', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let container = t.context.container;
    container.register('serializer:post', class PostSerializer extends denali_1.FlatSerializer {
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
    container.register('serializer:comment', class CommentSerializer extends denali_1.FlatSerializer {
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
    let post = yield Post.create({ title: 'foo' }).save();
    let result = yield serializer.serialize({}, post, {});
    t.true(lodash_1.isArray(result.comments));
    t.falsy(result.author);
    var _a, _b;
}));
ava_1.default('uses related serializers to render related records', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let container = t.context.container;
    container.register('serializer:post', class PostSerializer extends denali_1.FlatSerializer {
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
    container.register('serializer:comment', class CommentSerializer extends denali_1.FlatSerializer {
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
    let post = yield Post.create({ title: 'foo' }).save();
    yield post.addComment(yield Comment.create({ text: 'bar', publishedAt: 'fizz' }).save());
    let result = yield serializer.serialize({}, post, {});
    t.true(lodash_1.isArray(result.comments));
    t.is(result.comments[0].text, 'bar');
    t.falsy(result.comments[0].publishedAt);
    var _a, _b;
}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmxhdC10ZXN0LmpzIiwic291cmNlUm9vdCI6Ii9Vc2Vycy9hY2J1cmRpbmUvUHJvamVjdHMvZGVuYWxpL2RlbmFsaS8iLCJzb3VyY2VzIjpbInRlc3QvdW5pdC9yZW5kZXIvZmxhdC10ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDBFQUEwRTtBQUMxRSw2QkFBdUI7QUFDdkIsbUNBQWlDO0FBQ2pDLG1DQUF3RztBQUV4RyxhQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztJQUNoQixDQUFDLENBQUMsT0FBTyxDQUFDLFNBQVMsR0FBRyxJQUFJLGtCQUFTLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDL0MsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLHlCQUF5QixFQUFFLHNCQUFhLENBQUMsQ0FBQztBQUN6RSxDQUFDLENBQUMsQ0FBQztBQUVILGFBQUksQ0FBQyx3Q0FBd0MsRUFBRSxDQUFPLENBQUM7SUFDckQsSUFBSSxTQUFTLEdBQWMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUM7SUFDL0MsU0FBUyxDQUFDLFFBQVEsQ0FBQyx3QkFBd0IsRUFBRSxvQkFBcUIsU0FBUSx1QkFBYztRQUEzQzs7WUFDM0MsZUFBVSxHQUFHLENBQUUsT0FBTyxDQUFFLENBQUM7WUFDekIsa0JBQWEsR0FBRyxFQUFFLENBQUM7UUFDckIsQ0FBQztLQUFBLENBQUMsQ0FBQztJQUNILFNBQVMsQ0FBQyxRQUFRLENBQUMsWUFBWSxRQUFFLFVBQVcsU0FBUSxjQUFLO1NBRXhEO1FBRFEsUUFBSyxHQUFHLGFBQUksQ0FBQyxRQUFRLENBQUU7WUFDOUIsQ0FBQztJQUNILElBQUksVUFBVSxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsd0JBQXdCLENBQUMsQ0FBQztJQUM1RCxJQUFJLElBQUksR0FBRyxTQUFTLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQzlDLElBQUksSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFD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QUM5QyxJQUFJLE9BQU8sR0FBRyxTQUFTLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBQ3BELElBQUksVUFBVSxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQztJQUVyRCxJQUFJLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUN0RCxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO0lBQ3pGLElBQUksTUFBTSxHQUFHLE1BQU0sVUFBVSxDQUFDLFNBQVMsQ0FBTSxFQUFFLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBRTNELENBQUMsQ0FBQyxJQUFJLENBQUMsZ0JBQU8sQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztJQUNqQyxDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3JDLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQzs7QUFDMUMsQ0FBQyxDQUFBLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qIHRzbGludDpkaXNhYmxlOmNvbXBsZXRlZC1kb2NzIG5vLWVtcHR5IG5vLWludmFsaWQtdGhpcyBtZW1iZXItYWNjZXNzICovXG5pbXBvcnQgdGVzdCBmcm9tICdhdmEnO1xuaW1wb3J0IHsgaXNBcnJheSB9IGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgeyBGbGF0U2VyaWFsaXplciwgTW9kZWwsIGF0dHIsIENvbnRhaW5lciwgTWVtb3J5QWRhcHRlciwgaGFzTWFueSwgRXJyb3JzLCBoYXNPbmUgfSBmcm9tICdkZW5hbGknO1xuXG50ZXN0LmJlZm9yZUVhY2goKHQpID0+IHtcbiAgdC5jb250ZXh0LmNvbnRhaW5lciA9IG5ldyBDb250YWluZXIoX19kaXJuYW1lKTtcbiAgdC5jb250ZXh0LmNvbnRhaW5lci5yZWdpc3Rlcignb3JtLWFkYXB0ZXI6YXBwbGljYXRpb24nLCBNZW1vcnlBZGFwdGVyKTtcbn0pO1xuXG50ZXN0KCdyZW5kZXJzIG1vZGVscyBhcyBmbGF0IGpzb24gc3RydWN0dXJlcycsIGFzeW5jICh0KSA9PiB7XG4gIGxldCBjb250YWluZXIgPSA8Q29udGFpbmVyPnQuY29udGV4dC5jb250YWluZXI7XG4gIGNvbnRhaW5lci5yZWdpc3Rlcignc2VyaWFsaXplcjphcHBsaWNhdGlvbicsIGNsYXNzIFRlc3RTZXJpYWxpemVyIGV4dGVuZHMgRmxhdFNlcmlhbGl6ZXIge1xuICAgIGF0dHJpYnV0ZXMgPSBbICd0aXRsZScgXTtcbiAgICByZWxhdGlvbnNoaXBzID0ge307XG4gIH0pO1xuICBjb250YWluZXIucmVnaXN0ZXIoJ21vZGVsOnBvc3QnLCBjbGFzcyBQb3N0IGV4dGVuZHMgTW9kZWwge1xuICAgIHN0YXRpYyB0aXRsZSA9IGF0dHIoJ3N0cmluZycpO1xuICB9KTtcbiAgbGV0IHNlcmlhbGl6ZXIgPSBjb250YWluZXIubG9va3VwKCdzZXJpYWxpemVyOmFwcGxpY2F0aW9uJyk7XG4gIGxldCBQb3N0ID0gY29udGFpbmVyLmZhY3RvcnlGb3IoJ21vZGVsOnBvc3QnKTtcbiAgbGV0IHBvc3QgPSBhd2FpdCBQb3N0LmNyZWF0ZSh7IHRpdGxlOiAnZm9vJyB9KS5zYXZlKCk7XG4gIGxldCByZXN1bHQgPSBhd2FpdCBzZXJpYWxpemVyLnNlcmlhbGl6ZSg8YW55Pnt9LCBwb3N0LCB7fSk7XG5cbiAgdC5pcyhyZXN1bHQudGl0bGUsICdmb28nKTtcbn0pO1xuXG50ZXN0KCdyZW5kZXJzIHJlbGF0ZWQgcmVjb3JkcyBhcyBlbWJlZGRlZCBvYmplY3RzJywgYXN5bmMgKHQpID0+IHtcbiAgbGV0IGNvbnRhaW5lciA9IDxDb250YWluZXI+dC5jb250ZXh0LmNvbnRhaW5lcjtcbiAgY29udGFpbmVyLnJlZ2lzdGVyKCdzZXJpYWxpemVyOnBvc3QnLCBjbGFzcyBQb3N0U2VyaWFsaXplciBleHRlbmRzIEZsYXRTZXJpYWxpemVyIHtcbiAgICBhdHRyaWJ1dGVzID0gWyAndGl0bGUnIF07XG4gICAgcmVsYXRpb25zaGlwcyA9IHtcbiAgICAgIGNvbW1lbnRzOiB7XG4gICAgICAgIHN0cmF0ZWd5OiAnZW1iZWQnXG4gICAgICB9XG4gICAgfTtcbiAgfSk7XG4gIGNvbnRhaW5lci5yZWdpc3Rlcignc2VyaWFsaXplcjpjb21tZW50JywgY2xhc3MgQ29tbWVudFNlcmlhbGl6ZXIgZXh0ZW5kcyBGbGF0U2VyaWFsaXplciB7XG4gICAgYXR0cmlidXRlcyA9IFsgJ3RleHQnIF07XG4gICAgcmVsYXRpb25zaGlwcyA9IHt9O1xuICB9KTtcbiAgY29udGFpbmVyLnJlZ2lzdGVyKCdtb2RlbDpwb3N0JywgY2xhc3MgUG9zdCBleHRlbmRzIE1vZGVsIHtcbiAgICBzdGF0aWMgdGl0bGUgPSBhdHRyKCdzdHJpbmcnKTtcbiAgICBzdGF0aWMgY29tbWVudHMgPSBoYXNNYW55KCdjb21tZW50Jyk7XG4gIH0pO1xuICBjb250YWluZXIucmVnaXN0ZXIoJ21vZGVsOmNvbW1lbnQnLCBjbGFzcyBDb21tZW50IGV4dGVuZHMgTW9kZWwge1xuICAgIHN0YXRpYyB0ZXh0ID0gYXR0cignc3RyaW5nJyk7XG4gIH0pO1xuICBsZXQgUG9zdCA9IGNvbnRhaW5lci5mYWN0b3J5Rm9yKCdtb2RlbDpwb3N0Jyk7XG4gIGxldCBDb21tZW50ID0gY29udGFpbmVyLmZhY3RvcnlGb3IoJ21vZGVsOmNvbW1lbnQnKTtcbiAgbGV0IHNlcmlhbGl6ZXIgPSBjb250YWluZXIubG9va3VwKCdzZXJpYWxpemVyOnBvc3QnKTtcblxuICBsZXQgcG9zdCA9IGF3YWl0IFBvc3QuY3JlYXRlKHsgdGl0bGU6ICdmb28nIH0pLnNhdmUoKTtcbiAgYXdhaXQgcG9zdC5hZGRDb21tZW50KGF3YWl0IENvbW1lbnQuY3JlYXRlKHsgdGV4dDogJ2JhcicgfSkuc2F2ZSgpKTtcbiAgbGV0IHJlc3VsdCA9IGF3YWl0IHNlcmlhbGl6ZXIuc2VyaWFsaXplKDxhbnk+e30sIHBvc3QsIHt9KTtcblxuICB0LnRydWUoaXNBcnJheShyZXN1bHQuY29tbWVudHMpKTtcbiAgdC5pcyhyZXN1bHQuY29tbWVudHNbMF0udGV4dCwgJ2JhcicpO1xufSk7XG5cbnRlc3QoJ3JlbmRlcnMgcmVsYXRlZCByZWNvcmRzIGFzIGVtYmVkZGVkIGlkcycsIGFzeW5jICh0KSA9PiB7XG4gIGxldCBjb250YWluZXIgPSA8Q29udGFpbmVyPnQuY29udGV4dC5jb250YWluZXI7XG4gIGNvbnRhaW5lci5yZWdpc3Rlcignc2VyaWFsaXplcjpwb3N0JywgY2xhc3MgUG9zdFNlcmlhbGl6ZXIgZXh0ZW5kcyBGbGF0U2VyaWFsaXplciB7XG4gICAgYXR0cmlidXRlcyA9IFsgJ3RpdGxlJyBdO1xuICAgIHJlbGF0aW9uc2hpcHMgPSB7XG4gICAgICBjb21tZW50czoge1xuICAgICAgICBzdHJhdGVneTogJ2lkJ1xuICAgICAgfVxuICAgIH07XG4gIH0pO1xuICBjb250YWluZXIucmVnaXN0ZXIoJ3NlcmlhbGl6ZXI6Y29tbWVudCcsIGNsYXNzIENvbW1lbnRTZXJpYWxpemVyIGV4dGVuZHMgRmxhdFNlcmlhbGl6ZXIge1xuICAgIGF0dHJpYnV0ZXMgPSBbICd0ZXh0JyBdO1xuICAgIHJlbGF0aW9uc2hpcHMgPSB7fTtcbiAgfSk7XG4gIGNvbnRhaW5lci5yZWdpc3RlcignbW9kZWw6cG9zdCcsIGNsYXNzIFBvc3QgZXh0ZW5kcyBNb2RlbCB7XG4gICAgc3RhdGljIHRpdGxlID0gYXR0cignc3RyaW5nJyk7XG4gICAgc3RhdGljIGNvbW1lbnRzID0gaGFzTWFueSgnY29tbWVudCcpO1xuICB9KTtcbiAgY29udGFpbmVyLnJlZ2lzdGVyKCdtb2RlbDpjb21tZW50JywgY2xhc3MgQ29tbWVudCBleHRlbmRzIE1vZGVsIHtcbiAgICBzdGF0aWMgdGV4dCA9IGF0dHIoJ3N0cmluZycpO1xuICB9KTtcbiAgbGV0IFBvc3QgPSBjb250YWluZXIuZmFjdG9yeUZvcignbW9kZWw6cG9zdCcpO1xuICBsZXQgQ29tbWVudCA9IGNvbnRhaW5lci5mYWN0b3J5Rm9yKCdtb2RlbDpjb21tZW50Jyk7XG4gIGxldCBzZXJpYWxpemVyID0gY29udGFpbmVyLmxvb2t1cCgnc2VyaWFsaXplcjpwb3N0Jyk7XG5cbiAgbGV0IHBvc3QgPSBhd2FpdCBQb3N0LmNyZWF0ZSh7IHRpdGxlOiAnZm9vJyB9KS5zYXZlKCk7XG4gIGxldCBjb21tZW50ID0gYXdhaXQgQ29tbWVudC5jcmVhdGUoeyB0ZXh0OiAnYmFyJyB9KS5zYXZlKCk7XG4gIGF3YWl0IHBvc3QuYWRkQ29tbWVudChjb21tZW50KTtcbiAgbGV0IHJlc3VsdCA9IGF3YWl0IHNlcmlhbGl6ZXIuc2VyaWFsaXplKDxhbnk+e30sIHBvc3QsIHt9KTtcblxuICB0LnRydWUoaXNBcnJheShyZXN1bHQuY29tbWVudHMpKTtcbiAgdC5pcyhyZXN1bHQuY29tbWVudHNbMF0sIGNvbW1lbnQuaWQpO1xufSk7XG5cbnRlc3QoJ3JlbmRlcnMgZXJyb3JzJywgYXN5bmMgKHQpID0+IHtcbiAgbGV0IGNvbnRhaW5lciA9IDxDb250YWluZXI+dC5jb250ZXh0LmNvbnRhaW5lcjtcbiAgY29udGFpbmVyLnJlZ2lzdGVyKCdzZXJpYWxpemVyOmFwcGxpY2F0aW9uJywgY2xhc3MgUG9zdFNlcmlhbGl6ZXIgZXh0ZW5kcyBGbGF0U2VyaWFsaXplciB7XG4gICAgYXR0cmlidXRlczogc3RyaW5nW10gPSBbXTtcbiAgICByZWxhdGlvbnNoaXBzID0ge307XG4gIH0pO1xuICBsZXQgc2VyaWFsaXplciA9IGNvbnRhaW5lci5sb29rdXAoJ3NlcmlhbGl6ZXI6YXBwbGljYXRpb24nKTtcblxuICBsZXQgcmVzdWx0ID0gYXdhaXQgc2VyaWFsaXplci5zZXJpYWxpemUoPGFueT57fSwgbmV3IEVycm9ycy5JbnRlcm5hbFNlcnZlckVycm9yKCdmb28nKSwge30pO1xuICB0LmlzKHJlc3VsdC5zdGF0dXMsIDUwMCk7XG4gIHQuaXMocmVzdWx0LmNvZGUsICdJbnRlcm5hbFNlcnZlckVycm9yJyk7XG4gIHQuaXMocmVzdWx0Lm1lc3NhZ2UsICdmb28nKTtcbn0pO1xuXG50ZXN0KCdvbmx5IHJlbmRlcnMgd2hpdGVsaXN0ZWQgYXR0cmlidXRlcycsIGFzeW5jICh0KSA9PiB7XG4gIGxldCBjb250YWluZXIgPSA8Q29udGFpbmVyPnQuY29udGV4dC5jb250YWluZXI7XG4gIGNvbnRhaW5lci5yZWdpc3Rlcignc2VyaWFsaXplcjpwb3N0JywgY2xhc3MgUG9zdFNlcmlhbGl6ZXIgZXh0ZW5kcyBGbGF0U2VyaWFsaXplciB7XG4gICAgYXR0cmlidXRlcyA9IFsgJ3RpdGxlJyBdO1xuICAgIHJlbGF0aW9uc2hpcHMgPSB7fTtcbiAgfSk7XG4gIGNvbnRhaW5lci5yZWdpc3RlcignbW9kZWw6cG9zdCcsIGNsYXNzIFBvc3QgZXh0ZW5kcyBNb2RlbCB7XG4gICAgc3RhdGljIHRpdGxlID0gYXR0cignc3RyaW5nJyk7XG4gICAgc3RhdGljIGNvbnRlbnQgPSBhdHRyKCdzdHJpbmcnKTtcbiAgfSk7XG4gIGxldCBQb3N0ID0gY29udGFpbmVyLmZhY3RvcnlGb3IoJ21vZGVsOnBvc3QnKTtcbiAgbGV0IHNlcmlhbGl6ZXIgPSBjb250YWluZXIubG9va3VwKCdzZXJpYWxpemVyOnBvc3QnKTtcblxuICBsZXQgcG9zdCA9IGF3YWl0IFBvc3QuY3JlYXRlKHsgdGl0bGU6ICdmb28nLCBjb250ZW50OiAnYmFyJyB9KS5zYXZlKCk7XG4gIGxldCByZXN1bHQgPSBhd2FpdCBzZXJpYWxpemVyLnNlcmlhbGl6ZSg8YW55Pnt9LCBwb3N0LCB7fSk7XG5cbiAgdC5pcyhyZXN1bHQudGl0bGUsICdmb28nKTtcbiAgdC5mYWxzeShyZXN1bHQuY29udGVudCk7XG59KTtcblxudGVzdCgnb25seSByZW5kZXJzIHdoaXRlbGlzdGVkIHJlbGF0aW9uc2hpcHMnLCBhc3luYyAodCkgPT4ge1xuICBsZXQgY29udGFpbmVyID0gPENvbnRhaW5lcj50LmNvbnRleHQuY29udGFpbmVyO1xuICBjb250YWluZXIucmVnaXN0ZXIoJ3NlcmlhbGl6ZXI6cG9zdCcsIGNsYXNzIFBvc3RTZXJpYWxpemVyIGV4dGVuZHMgRmxhdFNlcmlhbGl6ZXIge1xuICAgIGF0dHJpYnV0ZXMgPSBbICd0aXRsZScgXTtcbiAgICByZWxhdGlvbnNoaXBzID0ge1xuICAgICAgY29tbWVudHM6IHtcbiAgICAgICAgc3RyYXRlZ3k6ICdpZCdcbiAgICAgIH1cbiAgICB9O1xuICB9KTtcbiAgY29udGFpbmVyLnJlZ2lzdGVyKCdzZXJpYWxpemVyOmNvbW1lbnQnLCBjbGFzcyBDb21tZW50U2VyaWFsaXplciBleHRlbmRzIEZsYXRTZXJpYWxpemVyIHtcbiAgICBhdHRyaWJ1dGVzID0gWyAndGV4dCcgXTtcbiAgICByZWxhdGlvbnNoaXBzID0ge307XG4gIH0pO1xuICBjb250YWluZXIucmVnaXN0ZXIoJ21vZGVsOnBvc3QnLCBjbGFzcyBQb3N0IGV4dGVuZHMgTW9kZWwge1xuICAgIHN0YXRpYyB0aXRsZSA9IGF0dHIoJ3N0cmluZycpO1xuICAgIHN0YXRpYyBhdXRob3IgPSBoYXNPbmUoJ3VzZXInKTtcbiAgICBzdGF0aWMgY29tbWVudHMgPSBoYXNNYW55KCdjb21tZW50Jyk7XG4gIH0pO1xuICBjb250YWluZXIucmVnaXN0ZXIoJ21vZGVsOmNvbW1lbnQnLCBjbGFzcyBDb21tZW50IGV4dGVuZHMgTW9kZWwge1xuICAgIHN0YXRpYyB0ZXh0ID0gYXR0cignc3RyaW5nJyk7XG4gIH0pO1xuICBjb250YWluZXIucmVnaXN0ZXIoJ21vZGVsOnVzZXInLCBjbGFzcyBDb21tZW50IGV4dGVuZHMgTW9kZWwge30pO1xuICBsZXQgUG9zdCA9IGNvbnRhaW5lci5mYWN0b3J5Rm9yKCdtb2RlbDpwb3N0Jyk7XG4gIGxldCBzZXJpYWxpemVyID0gY29udGFpbmVyLmxvb2t1cCgnc2VyaWFsaXplcjpwb3N0Jyk7XG5cbiAgbGV0IHBvc3QgPSBhd2FpdCBQb3N0LmNyZWF0ZSh7IHRpdGxlOiAnZm9vJyB9KS5zYXZlKCk7XG4gIGxldCByZXN1bHQgPSBhd2FpdCBzZXJpYWxpemVyLnNlcmlhbGl6ZSg8YW55Pnt9LCBwb3N0LCB7fSk7XG5cbiAgdC50cnVlKGlzQXJyYXkocmVzdWx0LmNvbW1lbnRzKSk7XG4gIHQuZmFsc3kocmVzdWx0LmF1dGhvcik7XG59KTtcblxudGVzdCgndXNlcyByZWxhdGVkIHNlcmlhbGl6ZXJzIHRvIHJlbmRlciByZWxhdGVkIHJlY29yZHMnLCBhc3luYyAodCkgPT4ge1xuICBsZXQgY29udGFpbmVyID0gPENvbnRhaW5lcj50LmNvbnRleHQuY29udGFpbmVyO1xuICBjb250YWluZXIucmVnaXN0ZXIoJ3NlcmlhbGl6ZXI6cG9zdCcsIGNsYXNzIFBvc3RTZXJpYWxpemVyIGV4dGVuZHMgRmxhdFNlcmlhbGl6ZXIge1xuICAgIGF0dHJpYnV0ZXMgPSBbICd0aXRsZScgXTtcbiAgICByZWxhdGlvbnNoaXBzID0ge1xuICAgICAgY29tbWVudHM6IHtcbiAgICAgICAgc3RyYXRlZ3k6ICdlbWJlZCdcbiAgICAgIH1cbiAgICB9O1xuICB9KTtcbiAgY29udGFpbmVyLnJlZ2lzdGVyKCdzZXJpYWxpemVyOmNvbW1lbnQnLCBjbGFzcyBDb21tZW50U2VyaWFsaXplciBleHRlbmRzIEZsYXRTZXJpYWxpemVyIHtcbiAgICBhdHRyaWJ1dGVzID0gWyAndGV4dCcgXTtcbiAgICByZWxhdGlvbnNoaXBzID0ge307XG4gIH0pO1xuICBjb250YWluZXIucmVnaXN0ZXIoJ21vZGVsOnBvc3QnLCBjbGFzcyBQb3N0IGV4dGVuZHMgTW9kZWwge1xuICAgIHN0YXRpYyB0aXRsZSA9IGF0dHIoJ3N0cmluZycpO1xuICAgIHN0YXRpYyBjb21tZW50cyA9IGhhc01hbnkoJ2NvbW1lbnQnKTtcbiAgfSk7XG4gIGNvbnRhaW5lci5yZWdpc3RlcignbW9kZWw6Y29tbWVudCcsIGNsYXNzIENvbW1lbnQgZXh0ZW5kcyBNb2RlbCB7XG4gICAgc3RhdGljIHRleHQgPSBhdHRyKCdzdHJpbmcnKTtcbiAgICBzdGF0aWMgcHVibGlzaGVkQXQgPSBhdHRyKCdzdHJpbmcnKTtcbiAgfSk7XG4gIGxldCBQb3N0ID0gY29udGFpbmVyLmZhY3RvcnlGb3IoJ21vZGVsOnBvc3QnKTtcbiAgbGV0IENvbW1lbnQgPSBjb250YWluZXIuZmFjdG9yeUZvcignbW9kZWw6Y29tbWVudCcpO1xuICBsZXQgc2VyaWFsaXplciA9IGNvbnRhaW5lci5sb29rdXAoJ3NlcmlhbGl6ZXI6cG9zdCcpO1xuXG4gIGxldCBwb3N0ID0gYXdhaXQgUG9zdC5jcmVhdGUoeyB0aXRsZTogJ2ZvbycgfSkuc2F2ZSgpO1xuICBhd2FpdCBwb3N0LmFkZENvbW1lbnQoYXdhaXQgQ29tbWVudC5jcmVhdGUoeyB0ZXh0OiAnYmFyJywgcHVibGlzaGVkQXQ6ICdmaXp6JyB9KS5zYXZlKCkpO1xuICBsZXQgcmVzdWx0ID0gYXdhaXQgc2VyaWFsaXplci5zZXJpYWxpemUoPGFueT57fSwgcG9zdCwge30pO1xuXG4gIHQudHJ1ZShpc0FycmF5KHJlc3VsdC5jb21tZW50cykpO1xuICB0LmlzKHJlc3VsdC5jb21tZW50c1swXS50ZXh0LCAnYmFyJyk7XG4gIHQuZmFsc3kocmVzdWx0LmNvbW1lbnRzWzBdLnB1Ymxpc2hlZEF0KTtcbn0pO1xuIl19