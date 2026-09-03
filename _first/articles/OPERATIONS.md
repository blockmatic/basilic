---
title: Operations First
status: draft
description: Decide how you will see, support, and recover the running system before production becomes a black box — a green pipeline is not verified recovery.
---

# Operations First

## Principle

Decide how you will see, support, and recover the running system before production becomes a black box.

## The Case

Shipping is not the end of engineering work. It is when the system meets reality.

I want to know what it is doing, what failed, for whom, and how to fix it — without archaeology. A product nobody can operate is a product that will fail quietly. Teams hesitate to ship systems they cannot see. Incidents stretch because nobody knows where to look. Agents cannot diagnose production issues from folklore.

Amazon's line was you build it, you run it. The people who write the service own it in production. That was an organizational answer to a visibility problem: if someone else runs it, the people who can change it never feel the 3 a.m. The useful part for a small team is the same sentence without the org chart. If you shipped it, you should be able to see it, support it, and recover it.

Charity Majors's observability argument is the other ancestor. Monitoring tells you about known-unknowns: the dashboards you thought to draw. Observability is how you ask new questions of a running system — the unknown-unknowns — without shipping a new dashboard first. Structured events, high cardinality, traces when a request crosses a boundary.

You do not need Honeycomb-scale tooling on a brochure site. Importing that stack into a marketing page is how you confuse proportional with incomplete. You do need to not be blind. A 500 with no request id is the textbook blind spot: something failed, and you cannot find the request. The next question — which user, which tool, which deploy — is what observability is for. If you cannot ask it without shipping a new log line, you only had monitoring.

The agentic delta is that production now has actors that are not humans clicking. An in-product agent needs identity, logs, retries, and a trace of what it did. A coding agent that "fixed" an incident has not finished until someone verified recovery in the running system. A green pipeline after a fix is necessary. It is not the same as the error rate coming back down.

Product analytics are a different question. Events, funnels, and activation live with Product First. A 500 rate is whether the system is broken. A drop in completed sign-in is whether the product is working. Page on the first. Put the second on the validation board. Same warehouse is fine. Same dashboard pretending to be both is how you miss the outage and the drop-off.

## Product Leverage

A product that cannot be supported is a product that trains customers to leave.

Runtime clarity is customer experience on the unhappy path. If a payment fails and nobody can find the request, the product did not merely have an engineering incident. It stranded a person mid-job. Journeys named the recovery. Operations is how you see whether recovery happened.

It preserves the ability to change. Teams that cannot see production stop shipping. Fear is a product-strategy input: you will not experiment if every deploy is a coin flip in the dark.

Time to market includes time to diagnose. A missing log field is a delay that shows up as "we are still looking." The smallest useful signal — one request id, one error code the support person can read — is a product investment.

## Engineering Leverage

Observability is a contract about what the running system will admit.

Structured logs you can search. Metrics on the failure modes that matter. Traces when work crosses services. Alerts that fire on real problems. A runbook for the recovery you have already needed once. Those are how independent services stay operable: the next engineer, or the next agent, can ask what happened without guessing.

Unix taste still applies: make systems easy to inspect. Fail noisily. Transparency is part of robustness. In production that means the failure is a record, not a screenshot in chat.

Production agents need the same seriousness as a worker process. Identity so you know who acted. Logs so you know what they called. Retries with a budget so a loop cannot become a denial of service. If the agent is infrastructure, operate it like infrastructure. A prompt change that alters what the agent does in production is a deploy. Treat it like one: see it, support it, recover it.

Verify recovery in the running system. Staging if that is what you have; production when the change is live. Pipelines got the change there. Operations confirms the plant actually improved.

A runbook is not a wiki of wishes. It is the recovery you have already needed once, written so the next person — or the next agent — does not start from chat. If the failure has never happened, do not invent a novel. If it has, do not leave the steps in someone's head.

## In an Agentic System

Agents cannot debug a black box.

Give them structured signals, not a story about "it felt slow last week." A coding agent diagnosing production should read logs, metrics, and runbooks, propose the smallest signal or fix, and wait for verification after deploy. If the only evidence is a green CI job, the agent will stop too early.

If the logs are unstructured walls of text, the agent will guess the same way a tired human guesses. Readable failures are operations work, the same way they are pipeline work. The difference is when they fire: CI is the change. Production is the plant.

In-product agents are production workload. If you cannot see which tool ran, with which inputs, for which user, you cannot support the feature and you cannot investigate abuse. That is operations, not a prompt tweak.

The loop is the point: production signal → identify the issue → workflow routes work → implementation → pipeline deploys → operations verifies recovery. An agent can participate in that loop only if the signals exist and the verification step is named.

"The tests passed" is a pipeline sentence. "The error rate came back down for the users who were failing" is an operations sentence. Do not let the first steal the second.

## What "First" Does Not Mean

Operations First is not a full SRE program for a side project. It is not fifty dashboards on day one.

It is not Pipelines First. Pipelines deliver the change. Operations runs what was delivered. A green build is not verified recovery.

It is not Security First. Security sets trust and permissions. Operations observes and recovers.

It is not Product First. Product owns whether the bet is working: events, funnels, activation. Operations owns whether the system is healthy: logs, traces, error rates, alerts, recovery. A named activation metric with no event is unfinished product work, not an ops ticket.

The smallest useful version: structured logs with a request id, one alert on the failure that would strand a user, a short note on how to recover. Add traces, SLOs, and on-call when the blast radius justifies them.

You-build-it-you-run-it does not mean every engineer carries a pager on a brochure site. It means the people who can change the system can see it. If that is one person and a log search, say so. If it is a rotating on-call, write the runbook. The principle is visibility and recovery, not a staffing model.

Do not page on a funnel. Do not treat a 500 as a growth experiment. When a drop-off and an error rate move together, look at both files: Product for the bet, Operations for the plant. The warehouse can be shared. The question cannot.

## Spec

Apply this: [principles/OPERATIONS.md](../principles/OPERATIONS.md). Return to the [factory map](../ABOUT.md).

## Further Reading

- [Charity Majors, "Observability: A Manifesto"](https://www.honeycomb.io/blog/observability-a-manifesto) — unknown-unknowns; monitoring is not the whole job.
- [Werner Vogels, ACM Queue interview (2006)](https://www.allthingsdistributed.com/2006/05/the_amazon_technology_platform.html) — you build it, you run it.
- [AI Agents are Infrastructure](https://gaboesquivel.com/blog/2026-05-ai-agents) — production agents need identity, logs, retries, and a way to see what they did.
