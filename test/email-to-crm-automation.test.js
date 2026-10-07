const { test } = require('node:test');
const assert = require('node:assert');
const { EmailToCrmEngine } = require('../src/index.js');

test('EmailToCrmEngine: parses structured entities from raw email', () => {
  const engine = new EmailToCrmEngine();
  const rawEmail = "Hi team, We are looking to implement a custom webhook pipeline with a budget of $12,500 ASAP. You can reach my mobile at 512-555-0199.";
  const res = engine.parseEmail(rawEmail, 'David Miller <david@enterprisecloud.com>');

  assert.strictEqual(res.senderEmail, 'david@enterprisecloud.com');
  assert.strictEqual(res.senderName, 'David Miller');
  assert.strictEqual(res.company, 'ENTERPRISECLOUD');
  assert.strictEqual(res.estimatedBudget, 12500);
  assert.strictEqual(res.urgency, 'HIGH');
  assert.strictEqual(res.phone, '512-555-0199');
  assert.strictEqual(res.crmPayload.deal_value, 12500);
});

test('EmailToCrmEngine: handles missing budget and free email providers', () => {
  const engine = new EmailToCrmEngine();
  const rawEmail = "Can we schedule a demo of your CRM integration tool next Tuesday?";
  const res = engine.parseEmail(rawEmail, 'sarah_jones@gmail.com');

  assert.strictEqual(res.senderEmail, 'sarah_jones@gmail.com');
  assert.strictEqual(res.company, 'Private Individual');
  assert.strictEqual(res.intent, 'SCHEDULE_DEMO');
  assert.ok(res.suggestedReply.includes('schedule a brief walkthrough'));
});
