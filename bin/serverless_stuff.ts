#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ServerlessStuffStack } from '../lib/serverless_stuff-stack';

const app = new cdk.App();
new ServerlessStuffStack(app, 'ServerlessStuffStack', {});
new ServerlessStuffStack(app, 'ServerlessStuffStack2', {});
