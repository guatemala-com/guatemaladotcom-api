// src/handler.ts
import serverlessExpress from '@codegenie/serverless-express';
import { createApp } from './main';
import type { Handler, Context, APIGatewayProxyEvent } from 'aws-lambda';

let cachedServer: ReturnType<typeof serverlessExpress> | null = null;

export const handler: Handler = async (event: APIGatewayProxyEvent, context: Context) => {
  if (!cachedServer) {
    const app = await createApp();
    const expressApp = app.getHttpAdapter().getInstance();
    cachedServer = serverlessExpress({ app: expressApp });
  }

  return cachedServer(event, context);
};
