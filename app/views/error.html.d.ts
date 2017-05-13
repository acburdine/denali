/// <reference types="node" />
import { ServerResponse } from 'http';
import Action, { RenderOptions } from '../../lib/runtime/action';
import View from '../../lib/render/view';
export default class ErrorView extends View {
    render(action: Action, response: ServerResponse, error: any, options: RenderOptions): Promise<void>;
}
