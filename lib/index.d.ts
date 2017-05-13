/**
 *
 * This is the main module exported by Denali when it is loaded via
 * `require/import`.
 *
 * This exports convenient shortcuts to other modules within Denali.
 * Rather than having to `import Addon from 'denali/lib/runtime/addon'`,
 * you can just `import { Addon } from 'denali'`.
 *
 */
import { attr, hasMany, hasOne, RelationshipDescriptor, AttributeDescriptor } from './data/descriptors';
import Model from './data/model';
import ORMAdapter from './data/orm-adapter';
import MemoryAdapter from './data/memory';
import DatabaseService from './data/database';
import Serializer from './render/serializer';
import FlatSerializer from './render/flat';
import RawSerializer from './render/raw';
import JSONAPISerializer from './render/json-api';
import View from './render/view';
import Parser from './parse/parser';
import RawParser from './parse/raw';
import FlatParser from './parse/flat';
import JSONAPIParser from './parse/json-api';
import Instrumentation from './metal/instrumentation';
import mixin, { createMixin, MixinFactory, MixinApplicator } from './metal/mixin';
import eachPrototype from './metal/each-prototype';
import Container from './metal/container';
import Resolver from './metal/resolver';
import inject from './metal/inject';
import Action, { RenderOptions, ResponderParams } from './runtime/action';
import Addon from './runtime/addon';
import Application from './runtime/application';
import Errors from './runtime/errors';
import Logger from './runtime/logger';
import Request from './runtime/request';
import Router from './runtime/router';
import Service from './runtime/service';
import appAcceptanceTest, { AppAcceptance } from './test/app-acceptance';
import MockRequest from './test/mock-request';
import MockResponse from './test/mock-response';
export { attr, hasMany, hasOne, RelationshipDescriptor, AttributeDescriptor, Model, ORMAdapter, MemoryAdapter, DatabaseService, View, Serializer, RawSerializer, FlatSerializer, JSONAPISerializer, Parser, RawParser, FlatParser, JSONAPIParser, Instrumentation, mixin, createMixin, MixinFactory, MixinApplicator, eachPrototype, Container, Resolver, inject, Action, Addon, Application, Errors, Logger, Request, Router, Service, RenderOptions, ResponderParams, AppAcceptance, appAcceptanceTest, MockRequest, MockResponse };
