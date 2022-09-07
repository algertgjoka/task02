import * as AWS from 'aws-sdk';

const GENERIC_ERROR = 'There was an error loading the To-Do objects.'

const db = new AWS.DynamoDB.DocumentClient();

export const handler = async (event: any = {}): Promise<any> => {
  try {

    const id = event.pathParameters.id;

    const params = {
      TableName: 'todo',
      Key: {
        id
      }
    };

    const response = await db.get(params).promise();
    if (response.Item) {
      return { statusCode: 200, body: JSON.stringify(response.Item) };
    } else {
      return { statusCode: 400, body: JSON.stringify({ error: GENERIC_ERROR }) };
    }
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ error: GENERIC_ERROR }) };
  }
};