import serverlessExpress from '@codegenie/serverless-express';
import { createApp } from './main';
import type { Handler, Context, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

let cachedServer: any;

export const handler: Handler = async (
  event: APIGatewayProxyEvent,
  context: Context,
): Promise<APIGatewayProxyResult> => {
  try {
    if (!cachedServer) {
      const app = await createApp();
      const expressApp = app.getHttpAdapter().getInstance();
      cachedServer = serverlessExpress({ app: expressApp });
    }

    return await cachedServer(event, context);
  } catch (err) {
    console.error('Error in Lambda handler:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error' }),
    };
  }
};
