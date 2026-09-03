---
title: Security First
status: draft
description: Identify what you are trusting, protecting, exposing, and allowing — including the agent as a principal — before architecture buries those decisions.
---

# Security First

## Principle

Identify what you are trusting, protecting, exposing, and allowing — proportionally to actual risk — before architecture makes security assumptions expensive to change.

## The Case

Security debt compounds quietly. Auth rules drift between handlers. Secrets land in logs. External input is trusted too early. Agents get broad tool access by default because it is convenient. A breach or a leaked key costs more than the hour it would have taken to name the trust boundary while it was still movable.

That is not a new observation. Microsoft's Security Development Lifecycle put threat modeling and security requirements in the development process instead of at the end. DevSecOps later named the same move for continuous delivery: if you only scan after the release train has left, you are auditing an accident. Shift-left security is the slogan. The useful part is earlier: identify what you are trusting, protecting, exposing, and allowing while those decisions can still change the architecture.

The agentic delta is a new principal, not a new slogan. A coding agent with file access, network, and deploy credentials is a service account that talks. An in-product agent with tools is a caller on your API. Treat either one like a trusted colleague and you have granted standing that no human reviewer would give a contractor on day one.

Least privilege still applies: the smallest access that can do the job. Least agency is the extra constraint agents need. Access is what you can reach. Agency is what you are allowed to do without asking. An agent that can read the production database is already a risk. An agent that can drop it because the prompt said "clean up" is a different class of risk. High-impact actions wait for a human. That is not ceremony. That is the only recovery story that still works when the actor is fast and confident.

At Wink I was Lead Engineer for Costa Rica's first neobank. The product sat on partner-bank APIs and biometrics. The interesting decisions were not "add auth later." They were who is allowed to move money-shaped state, and what the mobile app was allowed to see. That class of constraint does not get cheaper after the architecture is set. A payments product and a marketing site do not share a bar. Pretending they do either slows the site down or under-protects the money.

Prompt injection is a real surface on LLM products — untrusted text steering tools. I have written about it as a concrete attack, not as a vibe. It is one surface, not the whole principle. Most of the work is still ordinary: authentication, authorization, secret handling, input validation, dependency hygiene, least privilege. Agents add a new actor with tools. Narrow the tools. Validate the inputs. Log the actions. Gate anything destructive. Do not put secrets in the prompt or the transcript.

Do not reprint a generic top-ten list and call it the trust model. The project's actual exposure is the input: public internet, partner APIs, money-shaped state, documents a model can retrieve, credentials in the environment. Name those. The rest of the catalog is reference, not the decision.

## Product Leverage

Trust is a product feature. People use a product that holds money, documents, or identity because they believe the wrong person cannot act.

Naming who may do what is how you keep that belief true across surfaces. If the web app checks a role and the API does not, the product rule is the weaker of the two. Customers do not experience "the UI was careful." They experience the transfer that went through.

Proportional rigor is also a product decision. An internal admin used by three operators does not need the same control set as regulated account opening. Over-securing a brochure site delays a launch that had almost no blast radius. Under-securing a money path is how you ship a product you cannot stand behind.

Optionality follows the same split API First uses for capabilities. A capability with a trust boundary can be exposed to a partner, a mobile client, or an agent without cloning ad-hoc checks. A capability whose permission lives in one handler cannot.

Time to market improves when you stop discovering auth in production. You still ship a thin path. You ship it with a named gate, not with a comment that says TODO.

An in-product agent that can retrieve documents is a reader with a new interface. The permission is still "who may see this case." Do not invent a second authorization story because the caller is a model.

## Engineering Leverage

Security assumptions that live only in code are architecture you cannot review.

Auth at the boundary, not scattered per handler, is the same move as a consistent error model: one place to change the rule, one place to test it. Secrets in the environment, not in the repo and not in logs, are how you keep credentials from becoming folklore in a transcript. Input validation on the edge is cheaper than sanitizing after a tool has already run.

An agent permission list is an interface. Name the tools, the files, the networks, and the destructive commands. If the list is "whatever the session inherited," you do not have a permission model. You have a default.

Independent evolution of services only works if the trust model is shared. Two services that disagree about who may read a customer record will disagree in production.

Scanning is a signal, not a substitute for the decision. A dependency audit that nobody reads is the security version of a pipeline nobody trusts. The scan belongs in the project's existing checks. The decision belongs in a file: what is sensitive, who may touch it, what waits for a human. If those three are only in a scanner dashboard, the next session will not see them.

## In an Agentic System

The agent is a principal.

A coding agent can read secrets from env files, commit them, log them, or paste them into chat. It can run a destructive command because the prompt said "clean up." It can widen a permission because the feature was easier that way. None of that requires malice. It requires a missing rule.

Give the agent a role: prefer read-only inspection, no unnecessary secrets, human approval for trust-boundary edits and destructive operations. That is least agency. The agent can propose a permission change. It should not merge one.

That role has to be in the project's instructions, not only in this essay. If the session inherits admin credentials because that was convenient for local development, the written rule lost. Treat the agent like a service account you would actually issue: named, narrow, logged, revocable.

In-product agents are the same pattern with a product surface. A tool is an API call with a name. If the model can be steered by untrusted content into calling that tool, you have an injection surface on top of an authorization surface. Fix both. Do not treat the injection writeup as the whole security program.

Stop for a human when the change is a trust-boundary edit, a secret, or a destructive operation. Propose the rule. Do not merge it. That is the same gate Workflow names. This station is why the gate exists.

## What "First" Does Not Mean

Security First is not AI security theater. It is not threat-modeling every button. A low-risk prototype does not need a full threat model to ship.

It does not mean blocking a launch on perfect security. It means the controls match the blast radius, and the gaps are named.

It does not replace Operations First. Security defines trust and protection. Operations is how you see and recover at runtime. You need both. They are not the same file.

It does not replace API First. The contract is the shape of the call. Who may invoke it, and what they may see, is a trust decision.

It does not replace Workflow First. Human gates for secrets and destructive work live on the conveyor. This station names what those gates are protecting.

The smallest useful version: name what is public, what is authenticated, what is admin, what is secret, and what an agent may not do. Write that down. Enforce it at the boundary. Scale the rest to the actual risk.

A prototype on a private URL is not "no security." It is a smaller bar: secrets still stay out of git, the agent still does not get production credentials, and destructive commands still wait. The bar grows with exposure. It does not start at zero.

Do not confuse secrecy with authorization. Hiding a route is not a permission model. A client that is "internal" still calls an API. The agent that can see the handler still needs a rule. Write who may invoke, not only who may know the URL.

## Spec

Apply this: [principles/SECURITY.md](../principles/SECURITY.md). Return to the [factory map](../ABOUT.md).

## Further Reading

- [Microsoft, Security Development Lifecycle](https://www.microsoft.com/en-us/securityengineering/sdl) — security requirements and threat modeling inside the development process, not after.
- [OWASP, DevSecOps Guideline](https://owasp.org/www-project-devsecops-guideline/) — shift-left as continuous security in the delivery loop.
- [Prompt Injection](https://gaboesquivel.com/blog/2025-06-prompt-injection) — untrusted text steering tools. One surface. Not the whole principle.
