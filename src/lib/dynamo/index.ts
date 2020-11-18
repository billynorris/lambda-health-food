// eslint-disable-next-line import/no-extraneous-dependencies
import DynamoDB from 'aws-sdk/clients/dynamodb';
import log from '@dazn/lambda-powertools-logger';

const https = require('https');

type UserDetails = {
  userId: string;

  myFitnessPal: {
    username: string;
  }
};

export default class DynamoClient {
  private client: DynamoDB;

  constructor() {
    log.debug('Building new DynamoDb Client');

    const agent = new https.Agent({
      keepAlive: true,
      maxSockets: Infinity,
    });

    this.client = new DynamoDB({
      region: process.env.AWS_REGION,
      httpOptions: {
        agent,
      },
    });
  }

  getUserAsync = async (
    userId: string,
  ): Promise<UserDetails> => {
    const result = await this.client.getItem({
      Key: DynamoDB.Converter.marshall({
        userId,
      }),
      TableName: process.env.USER_TABLE_NAME,
    }).promise();

    return DynamoDB.Converter.unmarshall(result.Item) as UserDetails;
  };
}
