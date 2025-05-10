import { APIGatewayProxyResult } from 'aws-lambda';

export const formatJSONResponse = (
  statusCode: number,
  response: Record<string, any>
): APIGatewayProxyResult => {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify(response)
  };
}; 