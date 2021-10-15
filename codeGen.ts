// tslint:disable

import * as request from 'superagent';
import { SuperAgentStatic, SuperAgentRequest, Response } from 'superagent';

export type RequestHeaders = {
  [header: string]: string;
};
export type RequestHeadersHandler = (headers: RequestHeaders) => RequestHeaders;

export type ConfigureAgentHandler = (
  agent: SuperAgentStatic,
) => SuperAgentStatic;

export type ConfigureRequestHandler = (
  agent: SuperAgentRequest,
) => SuperAgentRequest;

export type CallbackHandler = (err: any, res?: request.Response) => void;

export type Logger = {
  log: (line: string) => any;
};

export interface ResponseWithBody<S extends number, T> extends Response {
  status: S;
  body: T;
}

export type QueryParameters = {
  [param: string]: any;
};

export interface CommonRequestOptions {
  $queryParameters?: QueryParameters;
  $domain?: string;
  $path?: string | ((path: string) => string);
  $retries?: number; // number of retries; see: https://github.com/visionmedia/superagent/blob/master/docs/index.md#retrying-requests
  $timeout?: number; // request timeout in milliseconds; see: https://github.com/visionmedia/superagent/blob/master/docs/index.md#timeouts
  $deadline?: number; // request deadline in milliseconds; see: https://github.com/visionmedia/superagent/blob/master/docs/index.md#timeouts
}

/**
 * Currencies base to quote
 * @class Test
 * @param {(string)} [domainOrOptions] - The project domain.
 */
export class Test {
  private domain: string = '';
  private errorHandlers: CallbackHandler[] = [];
  private requestHeadersHandler?: RequestHeadersHandler;
  private configureAgentHandler?: ConfigureAgentHandler;
  private configureRequestHandler?: ConfigureRequestHandler;

  constructor(domain?: string, private logger?: Logger) {
    if (domain) {
      this.domain = domain;
    }
  }

  getDomain() {
    return this.domain;
  }

  addErrorHandler(handler: CallbackHandler) {
    this.errorHandlers.push(handler);
  }

  setRequestHeadersHandler(handler: RequestHeadersHandler) {
    this.requestHeadersHandler = handler;
  }

  setConfigureAgentHandler(handler: ConfigureAgentHandler) {
    this.configureAgentHandler = handler;
  }

  setConfigureRequestHandler(handler: ConfigureRequestHandler) {
    this.configureRequestHandler = handler;
  }

  private request(
    method: string,
    url: string,
    body: any,
    headers: RequestHeaders,
    queryParameters: QueryParameters,
    form: any,
    reject: CallbackHandler,
    resolve: CallbackHandler,
    opts: CommonRequestOptions,
  ) {
    if (this.logger) {
      this.logger.log(`Call ${method} ${url}`);
    }

    const agent = this.configureAgentHandler
      ? this.configureAgentHandler(request.default)
      : request.default;

    let req = agent(method, url);
    if (this.configureRequestHandler) {
      req = this.configureRequestHandler(req);
    }

    req = req.query(queryParameters);

    if (this.requestHeadersHandler) {
      headers = this.requestHeadersHandler({
        ...headers,
      });
    }

    req.set(headers);

    if (body) {
      req.send(body);

      if (typeof body === 'object' && !(body.constructor.name === 'Buffer')) {
        headers['content-type'] = 'application/json';
      }
    }

    if (Object.keys(form).length > 0) {
      req.type('form');
      req.send(form);
    }

    if (opts.$retries && opts.$retries > 0) {
      req.retry(opts.$retries);
    }

    if (
      (opts.$timeout && opts.$timeout > 0) ||
      (opts.$deadline && opts.$deadline > 0)
    ) {
      req.timeout({
        deadline: opts.$deadline,
        response: opts.$timeout,
      });
    }

    req.end((error, response) => {
      // an error will also be emitted for a 4xx and 5xx status code
      // the error object will then have error.status and error.response fields
      // see superagent error handling: https://github.com/visionmedia/superagent/blob/master/docs/index.md#error-handling
      if (error) {
        reject(error);
        this.errorHandlers.forEach((handler) => handler(error));
      } else {
        resolve(response);
      }
    });
  }

  private convertParameterCollectionFormat<T>(
    param: T,
    collectionFormat: string | undefined,
  ): T | string {
    if (Array.isArray(param) && param.length >= 2) {
      switch (collectionFormat) {
        case 'csv':
          return param.join(',');
        case 'ssv':
          return param.join(' ');
        case 'tsv':
          return param.join('\t');
        case 'pipes':
          return param.join('|');
        default:
          return param;
      }
    }

    return param;
  }

  getCurrenciesURL(parameters: {} & CommonRequestOptions): string {
    let queryParameters: QueryParameters = {};
    const domain = parameters.$domain ? parameters.$domain : this.domain;
    let path = '/currencies';
    if (parameters.$path) {
      path =
        typeof parameters.$path === 'function'
          ? parameters.$path(path)
          : parameters.$path;
    }

    if (parameters.$queryParameters) {
      queryParameters = {
        ...queryParameters,
        ...parameters.$queryParameters,
      };
    }

    let keys = Object.keys(queryParameters);
    return (
      domain +
      path +
      (keys.length > 0
        ? '?' +
          keys
            .map((key) => key + '=' + encodeURIComponent(queryParameters[key]))
            .join('&')
        : '')
    );
  }

  /**
   *
   * @method
   * @name Test#getCurrencies
   */
  getCurrencies(
    parameters: {} & CommonRequestOptions,
  ): Promise<ResponseWithBody<200, void>> {
    const domain = parameters.$domain ? parameters.$domain : this.domain;
    let path = '/currencies';
    if (parameters.$path) {
      path =
        typeof parameters.$path === 'function'
          ? parameters.$path(path)
          : parameters.$path;
    }

    let body: any;
    let queryParameters: QueryParameters = {};
    let headers: RequestHeaders = {};
    let form: any = {};
    return new Promise((resolve, reject) => {
      headers['accept'] = 'application/json';
      headers['content-type'] = 'application/json';

      if (parameters.$queryParameters) {
        queryParameters = {
          ...queryParameters,
          ...parameters.$queryParameters,
        };
      }

      this.request(
        'GET',
        domain + path,
        body,
        headers,
        queryParameters,
        form,
        reject,
        resolve,
        parameters,
      );
    });
  }

  getCurrenciesGenerateObjectURL(
    parameters: {} & CommonRequestOptions,
  ): string {
    let queryParameters: QueryParameters = {};
    const domain = parameters.$domain ? parameters.$domain : this.domain;
    let path = '/currencies/generateObject';
    if (parameters.$path) {
      path =
        typeof parameters.$path === 'function'
          ? parameters.$path(path)
          : parameters.$path;
    }

    if (parameters.$queryParameters) {
      queryParameters = {
        ...queryParameters,
        ...parameters.$queryParameters,
      };
    }

    let keys = Object.keys(queryParameters);
    return (
      domain +
      path +
      (keys.length > 0
        ? '?' +
          keys
            .map((key) => key + '=' + encodeURIComponent(queryParameters[key]))
            .join('&')
        : '')
    );
  }

  /**
   *
   * @method
   * @name Test#getCurrenciesGenerateObject
   */
  getCurrenciesGenerateObject(
    parameters: {} & CommonRequestOptions,
  ): Promise<ResponseWithBody<200, void>> {
    const domain = parameters.$domain ? parameters.$domain : this.domain;
    let path = '/currencies/generateObject';
    if (parameters.$path) {
      path =
        typeof parameters.$path === 'function'
          ? parameters.$path(path)
          : parameters.$path;
    }

    let body: any;
    let queryParameters: QueryParameters = {};
    let headers: RequestHeaders = {};
    let form: any = {};
    return new Promise((resolve, reject) => {
      headers['accept'] = 'application/json';
      headers['content-type'] = 'application/json';

      if (parameters.$queryParameters) {
        queryParameters = {
          ...queryParameters,
          ...parameters.$queryParameters,
        };
      }

      this.request(
        'GET',
        domain + path,
        body,
        headers,
        queryParameters,
        form,
        reject,
        resolve,
        parameters,
      );
    });
  }
}

export default Test;
