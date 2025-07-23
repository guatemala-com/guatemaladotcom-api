// src/handler.ts
import serverlessExpress from '@codegenie/serverless-express';
import { createApp } from './main';

let cachedServer;

export const handler = async (event, context) => {
  if (!cachedServer) {
    const app = await createApp();
    const expressApp = app.getHttpAdapter().getInstance();
    cachedServer = serverlessExpress({ app: expressApp });
  }

  return cachedServer(event, context);
};
