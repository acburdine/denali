"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const lodash_1 = require("lodash");
const view_1 = require("../../lib/render/view");
let template = lodash_1.template(`
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
        <%= data.error.message %>
      </h1>
      <div class='details'>
        <% if (data.error.action) { %>
          <h2 class='source'>from <%= data.error.action %></h2>
        <% } %>
        <h5>Stacktrace:</h5>
        <pre><code><%= data.error.stack %></code></pre>
      </div>
    </body>
  </html>
`, {
    variable: 'data'
});
class ErrorView extends view_1.default {
    render(action, response, error, options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            response.setHeader('Content-type', 'text/html');
            response.write(template({ error }));
            response.end();
        });
    }
}
exports.default = ErrorView;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3IuaHRtbC5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvYWJ1cmRpbmUvUHJvamVjdHMvZGVuYWxpL21haW4vIiwic291cmNlcyI6WyJhcHAvdmlld3MvZXJyb3IuaHRtbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxtQ0FFZ0I7QUFHaEIsZ0RBQXlDO0FBRXpDLElBQUksUUFBUSxHQUFHLGlCQUFlLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBK0M5QixFQUFFO0lBQ0QsUUFBUSxFQUFFLE1BQU07Q0FDakIsQ0FBQyxDQUFDO0FBRUgsZUFBK0IsU0FBUSxjQUFJO0lBRW5DLE1BQU0sQ0FBQyxNQUFjLEVBQUUsUUFBd0IsRUFBRSxLQUFVLEVBQUUsT0FBc0I7O1lBQ3ZGLFFBQVEsQ0FBQyxTQUFTLENBQUMsY0FBYyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBQ2hELFFBQVEsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3BDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUNqQixDQUFDO0tBQUE7Q0FFRjtBQVJELDRCQVFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgdGVtcGxhdGUgYXMgY29tcGlsZVRlbXBsYXRlXG59IGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgeyBTZXJ2ZXJSZXNwb25zZSB9IGZyb20gJ2h0dHAnO1xuaW1wb3J0IEFjdGlvbiwgeyBSZW5kZXJPcHRpb25zIH0gZnJvbSAnLi4vLi4vbGliL3J1bnRpbWUvYWN0aW9uJztcbmltcG9ydCBWaWV3IGZyb20gJy4uLy4uL2xpYi9yZW5kZXIvdmlldyc7XG5cbmxldCB0ZW1wbGF0ZSA9IGNvbXBpbGVUZW1wbGF0ZShgXG4gIDxodG1sPlxuICAgIDxoZWFkPlxuICAgICAgPHN0eWxlPlxuICAgICAgICBib2R5IHtcbiAgICAgICAgICBmb250LWZhbWlseTogQXJpYWwsIEhlbHZldGljYSwgc2Fucy1zZXJpZjtcbiAgICAgICAgICBiYWNrZ3JvdW5kOiAjZjdmN2Y3O1xuICAgICAgICAgIG1hcmdpbjogMDtcbiAgICAgICAgfVxuICAgICAgICBwcmUge1xuICAgICAgICAgIGZvbnQtZmFtaWx5OiBJbmNvbnNvbGF0YSwgTW9uYWNvLCBNZW5sbywgbW9ub3NwYWNlO1xuICAgICAgICB9XG4gICAgICAgIC5oZWFkbGluZSB7XG4gICAgICAgICAgYmFja2dyb3VuZDogI2ZmZjtcbiAgICAgICAgICBwYWRkaW5nOiAzMHB4O1xuICAgICAgICAgIGNvbG9yOiAjREM0QjRCO1xuICAgICAgICAgIGZvbnQtZmFtaWx5OiBJbmNvbnNvbGF0YSwgTW9uYWNvLCBNZW5sbywgbW9ub3NwYWNlO1xuICAgICAgICAgIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCAjZGRkO1xuICAgICAgICAgIG1hcmdpbi1ib3R0b206IDA7XG4gICAgICAgIH1cbiAgICAgICAgLmxlYWQge1xuICAgICAgICAgIGRpc3BsYXk6IGJsb2NrO1xuICAgICAgICAgIG1hcmdpbi1ib3R0b206IDdweDtcbiAgICAgICAgICBjb2xvcjogI2FhYTtcbiAgICAgICAgICBmb250LXNpemU6IDE0cHg7XG4gICAgICAgICAgZm9udC1mYW1pbHk6IEFyaWFsLCBIZWx2ZXRpY2EsIHNhbnMtc2VyaWY7XG4gICAgICAgICAgZm9udC13ZWlnaHQ6IDMwMDtcbiAgICAgICAgfVxuICAgICAgICAuZGV0YWlscyB7XG4gICAgICAgICAgcGFkZGluZzogMzBweDtcbiAgICAgICAgfVxuICAgICAgPC9zdHlsZT5cbiAgICA8L2hlYWQ+XG4gICAgPGJvZHk+XG4gICAgICA8aDEgY2xhc3M9J2hlYWRsaW5lJz5cbiAgICAgICAgPHNtYWxsIGNsYXNzPSdsZWFkJz5UaGVyZSB3YXMgYW4gZXJyb3Igd2l0aCB0aGlzIHJlcXVlc3Q6PC9zbWFsbD5cbiAgICAgICAgPCU9IGRhdGEuZXJyb3IubWVzc2FnZSAlPlxuICAgICAgPC9oMT5cbiAgICAgIDxkaXYgY2xhc3M9J2RldGFpbHMnPlxuICAgICAgICA8JSBpZiAoZGF0YS5lcnJvci5hY3Rpb24pIHsgJT5cbiAgICAgICAgICA8aDIgY2xhc3M9J3NvdXJjZSc+ZnJvbSA8JT0gZGF0YS5lcnJvci5hY3Rpb24gJT48L2gyPlxuICAgICAgICA8JSB9ICU+XG4gICAgICAgIDxoNT5TdGFja3RyYWNlOjwvaDU+XG4gICAgICAgIDxwcmU+PGNvZGU+PCU9IGRhdGEuZXJyb3Iuc3RhY2sgJT48L2NvZGU+PC9wcmU+XG4gICAgICA8L2Rpdj5cbiAgICA8L2JvZHk+XG4gIDwvaHRtbD5cbmAsIHtcbiAgdmFyaWFibGU6ICdkYXRhJ1xufSk7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEVycm9yVmlldyBleHRlbmRzIFZpZXcge1xuXG4gIGFzeW5jIHJlbmRlcihhY3Rpb246IEFjdGlvbiwgcmVzcG9uc2U6IFNlcnZlclJlc3BvbnNlLCBlcnJvcjogYW55LCBvcHRpb25zOiBSZW5kZXJPcHRpb25zKSB7XG4gICAgcmVzcG9uc2Uuc2V0SGVhZGVyKCdDb250ZW50LXR5cGUnLCAndGV4dC9odG1sJyk7XG4gICAgcmVzcG9uc2Uud3JpdGUodGVtcGxhdGUoeyBlcnJvciB9KSk7XG4gICAgcmVzcG9uc2UuZW5kKCk7XG4gIH1cblxufVxuIl19