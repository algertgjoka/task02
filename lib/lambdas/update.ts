import * as AWS from 'aws-sdk';

const GENERIC_ERROR = 'There was an error while updating the To-Do object.';
const SUCCESS = 'To-Do object updated successfully';

const db = new AWS.DynamoDB.DocumentClient();

export const handler = async (event: any = {}): Promise<any> => {
  try {

    const id = event.pathParameters.id;
    if (!id) {
      return { statusCode: 400, body: JSON.stringify({ error: GENERIC_ERROR }) };
    }

    const todo = JSON.parse(event.body);
    if (todo['id']) {
      if (todo['id'] !== id) {
        return { statusCode: 400, body: JSON.stringify({ error: GENERIC_ERROR }) };
      }
    }
    for (const key in todo) {
      if (!['title', 'description'].includes(key)) {
        delete todo[key];
      }
    }
    const todo_properties = Object.keys(todo);
    if (!todo || todo_properties.length < 1) {
      return { statusCode: 400, body: JSON.stringify({ error: GENERIC_ERROR }) };
    }

    const firstProperty = todo_properties.splice(0, 1);
    const params: any = {
      TableName: 'todo',
      Key: {
        id
      },
      UpdateExpression: `set ${firstProperty} = :${firstProperty}`,
      ExpressionAttributeValues: {},
      ConditionExpression: 'attribute_exists(id)',
      ReturnValues: 'UPDATED_NEW'
    }
    params.ExpressionAttributeValues[`:${firstProperty}`] = todo[`${firstProperty}`];

    todo_properties.forEach(property => {
      params.UpdateExpression += `, ${property} = :${property}`;
      params.ExpressionAttributeValues[`:${property}`] = todo[property];
    });

    await db.update(params).promise();
    return { statusCode: 200, body: JSON.stringify({ message: SUCCESS }) };
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ error: GENERIC_ERROR }) };
  }
};