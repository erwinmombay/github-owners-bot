/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import test from 'ava';
import * as sinon from 'sinon';
import {PullRequest} from '../src/github';

const fs = require('fs');

let pr, sandbox;
const payload = JSON.parse(fs.readFileSync(
    'fixtures/overlapping-comments.json'));
const issuesPayload = JSON.parse(
    fs.readFileSync(
    'fixtures/overlapping-comments-issues.json'));
const pullsPayload = JSON.parse(
    fs.readFileSync(
    'fixtures/overlapping-comments-pulls.json'));

test.beforeEach(() => {
  sandbox = sinon.sandbox.create();
  const byType = sandbox.stub(PullRequest.prototype, 'getCommentByType_')
  byType.withArgs('pulls').returns(Promise.resolve(pullsPayload));
  byType.withArgs('issues').returns(Promise.resolve(issuesPayload));
  pr = new PullRequest(payload.pull_request);
});

test('find the approvers comment', t => {
  t.plan(1);
  return pr.getLastApproversList('ampprojectbot').then(approvers => {
    t.deepEqual(approvers, [['donttrustthisbot'], ['person1', 'person2']]);
  });
});
