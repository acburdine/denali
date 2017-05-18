import {
  template as compileTemplate
} from 'lodash';
import Action, { RenderOptions } from '../../lib/runtime/action';
import { ServerResponse } from 'http';
import View from '../../lib/render/view';

let template = compileTemplate(`
  <html>
    <head>
      <style>
        body {
          font-family: Arial, Helvetica, sans-serif;
          background: #f7f7f7;
          margin: 0;
        }
        pre {
          font-family: Inconsolata, Monaco, Menlo, monospace;
        }
        .headline {
          background: #fff;
          padding: 30px;
          color: #DC4B4B;
          font-family: Inconsolata, Monaco, Menlo, monospace;
          border-bottom: 1px solid #ddd;
          margin-bottom: 0;
        }
        .lead {
          display: block;
          margin-bottom: 7px;
          color: #aaa;
          font-size: 14px;
          font-family: Arial, Helvetica, sans-serif;
          font-weight: 300;
        }
        .details {
          padding: 30px;
        }
      </style>
    </head>
    <body>
      <h1 class='headline'>
        <small class='lead'>There was an error with this request:</small>
        <%= message %>
      </h1>
      <div class='details'>
        <% if (action) { %>
          <h2 class='source'>from <%= action %></h2>
        <% } %>
        <h5>Stacktrace:</h5>
        <pre><code><%= stack %></code></pre>
      </div>
    </body>
  </html>
`);

export default class ErrorView extends View {

  async render(action: Action, response: ServerResponse, error: any, options: RenderOptions) {
    // Action must be defined, or lodash's template will throw an error
    error.action = error.action || null;

    response.setHeader('Content-type', 'text/html');
    response.write(template(error));
    response.end();
  }

}
