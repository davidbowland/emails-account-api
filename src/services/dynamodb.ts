import { DynamoDB } from 'aws-sdk'

import { AccountPreference, Accounts } from '../types'
import { dynamodbTableName } from '../config'
import { xrayCapture } from '../utils/logging'

const dynamodb = xrayCapture(new DynamoDB({ apiVersion: '2012-08-10' }))

/* Delete item */

export const deleteDataByKey = (key: string): Promise<DynamoDB.Types.DeleteItemOutput> =>
  dynamodb
    .deleteItem({
      Key: {
        Account: {
          S: `${key}`,
        },
      },
      TableName: dynamodbTableName,
    })
    .promise()

/* Get single item */

export const getDataByKey = (key: string): Promise<AccountPreference> =>
  dynamodb
    .getItem({
      Key: {
        Account: {
          S: `${key}`,
        },
      },
      TableName: dynamodbTableName,
    })
    .promise()
    .then((response) => JSON.parse(response.Item.Data.S as string))

/* Scan for items */

const getItemsFromScan = (response: DynamoDB.Types.ScanOutput): Accounts[] | undefined =>
  response.Items?.map((item) => ({ data: JSON.parse(item.Data.S), id: item.Account.S }))

export const scanData = (): Promise<Accounts[]> =>
  dynamodb
    .scan({
      AttributesToGet: ['Data', 'Account'],
      TableName: dynamodbTableName,
    })
    .promise()
    .then((response) => getItemsFromScan(response) ?? [])

/* Set item */

export const setDataByKey = (key: string, data: AccountPreference): Promise<DynamoDB.Types.PutItemOutput> =>
  dynamodb
    .putItem({
      Item: {
        Account: {
          S: `${key}`,
        },
        Data: {
          S: JSON.stringify(data),
        },
      },
      TableName: dynamodbTableName,
    })
    .promise()
