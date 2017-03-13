import test from 'ava';
import * as sinon from 'sinon';
import {PullRequest, Review} from '../src/github';
const request = require('supertest');
const fs = require('fs');

import {app} from '../app';

const reviewSubmittedFailedPayload = JSON.parse(
    fs.readFileSync(
    'fixtures/review_submitted_failure.json'));

let req, res, sandbox;
test.beforeEach(() => {
  sandbox = sinon.sandbox.create();
});

test.afterEach(() => {
  sandbox.restore();
});

// Note: Need to run these tests serially because of the shared "PullRequest"
// stubbing state. If we don't since ava runs everything conccurently the
// `afterEach` might not have ran yet when the next test does run.

test.serial.cb('on an opened pull request, if author is not part of owner ' +
    'list and not full appproved it should set initial comment', t => {
  t.plan(2);
  const openedPayload = JSON.parse(
      fs.readFileSync(
      'fixtures/opened.json'));
  const reviewsFailed = JSON.parse(
      fs.readFileSync(
      'fixtures/reviews_failed.json'));
  const reviews = reviewsFailed.map(x => new Review(x)).sort((a, b) => {
    return b.submitted_at - a.submitted_at;
  });
  sandbox.stub(PullRequest.prototype, 'getReviews')
      .returns(Promise.resolve(reviews));
  const postCommentSpy =
    sandbox.stub(PullRequest.prototype, 'postIssuesComment')
        .returns(Promise.resolve());
  const setFailureStatusSpy = sandbox.stub(
      PullRequest.prototype, 'setFailureStatus').returns(Promise.resolve());

  request(app).post('/api/get-owners')
      .set('Content-Type', 'application/json')
      .send(openedPayload)
      .end((err, res) => {
        t.is(postCommentSpy.callCount, 1, 'Should call postIssuesComment');
        t.is(setFailureStatusSpy.callCount, 1, 'Should call setFailureStatus');
        t.end();
      });
});

test.serial.cb('on an opened pull request, if author is also part of owner ' +
    'list it should set approved right away', t => {
  t.plan(2);
  const openedPayload = JSON.parse(
      fs.readFileSync(
      'fixtures/opened.json'));
  openedPayload.pull_request.user.login = 'donttrustthisbot';
  const postCommentSpy =
    sandbox.stub(PullRequest.prototype, 'postIssuesComment')
        .returns(Promise.resolve());
  const setApprovedStatusSpy = sandbox.stub(
      PullRequest.prototype, 'setApprovedStatus').returns(Promise.resolve());

  request(app).post('/api/get-owners')
      .set('Content-Type', 'application/json')
      .send(openedPayload)
      .end((err, res) => {
        t.is(postCommentSpy.callCount, 0, 'Should not call postIssuesComment');
        t.is(setApprovedStatusSpy.callCount, 1,
            'Should call setApprovedStatus');
        t.end();
      });
});

test.serial.cb('on any review action that is not an approval, set to failed ' +
    'status right away', t => {
  t.plan(1);
  const setFailureStatusSpy = sandbox.stub(
      PullRequest.prototype, 'setFailureStatus').returns(Promise.resolve());

  request(app).post('/api/get-owners')
      .set('Content-Type', 'application/json')
      .send(reviewSubmittedFailedPayload)
      .end((err, res) => {
        t.is(setFailureStatusSpy.callCount, 1, 'Should call setFailureStatus');
        t.end();
      });
});

test.serial.cb('on a synchronize action that is not fully approved yet, if ' +
    'the last bot comment is NOT equal to the current reviewers list, post a ' +
    'comment and set it to fail status', t => {
  t.plan(2);
  const syncPayload = JSON.parse(
      fs.readFileSync(
      'fixtures/sync.json'));
  const postCommentSpy =
    sandbox.stub(PullRequest.prototype, 'postIssuesComment')
        .returns(Promise.resolve());
  const setFailureStatusSpy = sandbox.stub(
      PullRequest.prototype, 'setFailureStatus').returns(Promise.resolve());
  const lastApproversListStub = sandbox
      .stub(PullRequest.prototype, 'getLastApproversList')
      .returns(Promise.resolve([]));

  request(app).post('/api/get-owners')
      .set('Content-Type', 'application/json')
      .send(syncPayload)
      .end((err, res) => {
        t.is(postCommentSpy.callCount, 1, 'Should call postIssuesComment');
        t.is(setFailureStatusSpy.callCount, 1, 'Should call setFailureStatus');
        t.end();
      });
});

test.serial.cb('on a synchronize action that is not fully approved k