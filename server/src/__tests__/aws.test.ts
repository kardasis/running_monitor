import * as AWSMock from "aws-sdk-mock";
import * as AWS from "aws-sdk";
import { PutObjectRequest } from 'aws-sdk/clients/s3'

import { putToS3 } from '../aws'

jest.mock('aws-sdk')

describe('putToS3', () => {
  // it('should construct the right file', (done) => {
    // AWSMock.setSDKInstance(AWS);

    // AWSMock.mock('S3', 'upload', (params: PutObjectRequest, callback: Function) => {
    //   console.log('mock upload called');
    //   callback();
    // })

    // putToS3('dummyName', {ab: 2}, 'my-bucket', () => {
    //   console.log('done with it')
    //   done()
    //   AWSMock.restore('S3');
    // })
  // })
})