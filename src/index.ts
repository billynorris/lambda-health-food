import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import log from '@dazn/lambda-powertools-logger';

import MyFitnessPalDataExporter from './lib/my-fitness-pal';
import ListFoodEntriesResponseV1 from './models/ListFoodEntriesResponseV1';

// eslint-disable-next-line import/no-extraneous-dependencies
const middy = require('middy');

let exporter: MyFitnessPalDataExporter;

export const handlerLogic = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  if (!exporter) {
    exporter = new MyFitnessPalDataExporter();
  }

  const username = event.pathParameters.myFitnessPalUsername;
  const from = event.queryStringParameters?.from;
  const to = event.queryStringParameters?.to;

  log.debug('Fetching MyFitnessPal food data for user', {
    username: event.pathParameters.myFitnessPalUsername,
    fromDate: from,
    toDate: to,
  });

  const foodEntries = await exporter.getDataAsync(username, from, to);

  const result: ListFoodEntriesResponseV1 = {
    entries: foodEntries,
  };

  return {
    statusCode: 200,
    body: JSON.stringify(result),
  };
};

// eslint-disable-next-line import/prefer-default-export
export const handler = middy(handlerLogic, 'AWS_PROXY');
