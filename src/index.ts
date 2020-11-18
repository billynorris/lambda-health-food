import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import log from '@dazn/lambda-powertools-logger';
import MyFitnessPalDataExporter from './lib/my-fitness-pal';
import ListFoodEntriesResponseV1 from './models/ListFoodEntriesResponseV1';
import DynamoClient from './lib/dynamo';

let exporter: MyFitnessPalDataExporter;
let dynamo: DynamoClient;

export default async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  if (!exporter) {
    exporter = new MyFitnessPalDataExporter();
    dynamo = new DynamoClient();
  }

  const from = event.queryStringParameters?.from ?? new Date((new Date().setDate(new Date().getDate() - 7))).toISOString().split('T')[0];
  const to = event.queryStringParameters?.to ?? new Date().toISOString().split('T')[0];
  const { userId } = event.pathParameters;

  const user = await dynamo.getUserAsync(event.pathParameters.userId);

  log.debug('Fetching MyFitnessPal food data for user', {
    userId,
    fromDate: from,
    toDate: to,
  });

  const foodEntries = await exporter.getDataAsync(user.myFitnessPal.username, from, to);

  const result: ListFoodEntriesResponseV1 = {
    entries: foodEntries,
  };

  return {
    statusCode: 200,
    body: JSON.stringify(result),
  };
};
