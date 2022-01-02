// DynamoDB

process.env.DYNAMODB_TABLE_NAME = 'email-bucket'

// Console

console.info = jest.fn()
console.log = jest.fn()
console.warn = jest.fn()
console.error = jest.fn()
