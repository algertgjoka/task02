import * as AWS from 'aws-sdk';

const db = new AWS.DynamoDB.DocumentClient();
const GENERIC_ERROR = 'There was an error loading the To-Do objects.'

export const handler = async (): Promise<any> => {

  try {
    const response = await db.scan({
      TableName: 'todo'
    }).promise();
    return { statusCode: 200, body: JSON.stringify(response.Items) };
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ error: GENERIC_ERROR }) };
  }
};