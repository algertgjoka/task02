import * as AWS from 'aws-sdk';

const GENERIC_ERROR = 'There was an error while updating the To-Do object.';
const SUCCESS = 'To-Do object updated successfully';

const db = new AWS.DynamoDB.DocumentClient();

export const handler = async (event: any = {}): Promise<any> => {

  try {
    const { id, title, description } = JSON.parse(event.body);
    if (!id || !title || !description) {
      return { statusCode: 400, body: JSON.stringify({ error: GENERIC_ERROR }) };
    }
    const todo = {
      id,
      title,
      description
    }
    const params = {
      TableName: 'todo',
      Item: todo,
      ConditionExpression: 'attribute_not_exists(id)'
    };

    await db.put(params).promise();
    return { statusCode: 200, body: JSON.stringify({ message: SUCCESS }) };
  } catch (error) {
    return { statusCode: 400, body: JSON.stringify({ error: GENERIC_ERROR }) };
  }
};