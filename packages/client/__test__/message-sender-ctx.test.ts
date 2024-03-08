import { JsonrpcRequestBody, MessageSender, RequestInterceptor } from '@cec/jsonrpc-core';
import { MessageSenderCtx } from '../src/message-sender-ctx';
import { describe, it } from 'vitest';
import { stringify } from 'flatted';

describe.todo('MessageSenderCtx normal', () => {
  let sendMessage = '';
  const messageSender: MessageSender = (message: string) => (sendMessage = message);
  const messageSenderCtx = new MessageSenderCtx(messageSender);
  const messageBody: JsonrpcRequestBody = {
    jsonrpc: '2.0',
    method: 'xxxxx',
    params: [],
    id: 'qwertyu',
  };
  messageSenderCtx.send(messageBody);

  it('MessageSenderCtx normal 01', ({ expect }) => expect(stringify(messageBody)).toStrictEqual(sendMessage));
});

describe('MessageSenderCtx RequestInterceptor', async () => {
  const interceptor01: RequestInterceptor = (requestBody) => {
    return {
      ...requestBody,
      params: [1, 2, 3],
    };
  };
  const interceptor02: RequestInterceptor = (requestBody) => {
    return requestBody;
  };
  const interceptor03: RequestInterceptor = () => {
    throw new Error('error coming');
  };
  const interceptor04: RequestInterceptor = () => {};

  const messageBody: JsonrpcRequestBody = {
    jsonrpc: '2.0',
    method: 'xxx',
    id: 'qwe',
  };
  const messageBodyFilted: JsonrpcRequestBody = { jsonrpc: '2.0', method: 'xxx', id: 'qwe', params: [1, 2, 3] };

  let sendMessage01: string = '';
  const messageSenderCtx01 = new MessageSenderCtx((requestBody) => (sendMessage01 = requestBody), {
    requestInterceptors: [interceptor01, interceptor02],
  });
  messageSenderCtx01.send(messageBody);
  it('MessageSenderCtx RequestInterceptor change value', ({ expect }) => {
    expect(stringify(messageBodyFilted)).toStrictEqual(sendMessage01);
  });

  let sendMessage03: string = '';
  const messageSenderCtx03 = new MessageSenderCtx(() => {}, {
    requestInterceptors: [interceptor01, interceptor02, interceptor04],
  });
  messageSenderCtx03.send(messageBody);
  it('MessageSenderCtx RequestInterceptor in void', async ({ expect }) => {
    await expect(sendMessage03).toEqual('');
  });

  const messageSenderCtx02 = new MessageSenderCtx(() => {}, {
    requestInterceptors: [interceptor01, interceptor02, interceptor03],
  });
  it('MessageSenderCtx RequestInterceptor occur error 01', async ({ expect }) => {
    await expect(messageSenderCtx02.send(messageBody)).rejects.toThrowError();
  });

  const messageSenderCtx04 = new MessageSenderCtx(() => {});
  it('MessageSenderCtx RequestInterceptor occur error 02', ({ expect }) => {
    expect(
      messageSenderCtx04.send({
        jsonrpc: '2.0',
        method: 'xxx',
        id: 'qwe',
        params: [BigInt(9007199254740991)],
      }),
    ).rejects.toThrowError();
  });
});
