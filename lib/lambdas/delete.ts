import * as AWS from 'aws-sdk';

const GENERIC_ERROR = 'There has been an error while deleting the To-Do object.';
const SUCCESS = 'To-Do object deleted successfully.';

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

    await db.delete(params).promise();
    return { statusCode: 200, body: JSON.stringify({ message: SUCCESS }) };
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ error: GENERIC_ERROR }) };
  }
};