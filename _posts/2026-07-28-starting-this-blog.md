---
layout: post
title: "Starting This Blog"
date: 2026-07-28 09:00:00 -0400

# Everything below feeds the collapsed "Nero's edits" panel at the bottom of the
# post. Rewrite these notes in your own voice — right now they're Nero's wording.
edits_intro: >-
  I had Nero proofread this post. Here's every change he called out, and what I
  did about it.
edits:
  - verdict: accepted
    note: |
      The saying is sarcastic, but as I'd written it the second sentence read as
      a contradiction of the first instead of an explanation of it. One word
      fixed it.
    before: >-
      There was always that saying growing up: "it was on the internet, so it
      must be true." Because they always told you not to believe everything on
      the internet.
    after: >-
      There was always that sarcastic saying growing up — "it was on the
      internet, so it must be true" — because we were constantly told not to
      believe everything online.

  - verdict: accepted
    note: |
      Comma splice. The em dash isn't just more correct — it gives the line the
      beat it deserves.
    before: That's not past tense, that's where I am right now.
    after: That's not past tense — that's where I am right now.

  - verdict: accepted
    note: |
      A factual catch rather than a stylistic one, and the kind that matters
      most — I was describing someone else's project wrong, in public, to an
      audience that would check.
    before: It ships as a single self-contained skill that bundles a whole library of other skills.
    after: It ships as a full system — hooks, an algorithm, a memory layer, and a library of skills.
---

Hey, it's Jake.

I'm starting this blog because I kind of want to show off what I do. I like working with Linux systems, computers, and building and breaking stuff. Right now I'm messing around with setting up a cluster out of Dell OptiPlex 3060s and a few other spare PCs — just a learning build, so I can get hands-on with virtualization at the cluster level, managing data, and standing up services.

<!--more-->

I've never really blogged before, but I've always told myself I wanted to. Partly so I have an answer when somebody asks what I do for fun. But mostly so I can stand back and see my own progress — what I've done, what I've achieved, what I've learned. Because sometimes it just feels like I'm going nowhere. I want to change that.

I also want to get more involved with the community. My thinking is that if I share my journey, I'll get a glimpse into other people's journeys, how they think about things, and I'll have somebody to bounce ideas off of.

## Where I'm at

I'm working toward my A+ certification right now.

I have a two-year degree — an Associate of Applied Science from Lorain County Community College, where I majored in computer engineering and digital forensics. I picked up a few certificates from them along the way: A+ prep, Network+ prep, and Security+ prep.

I never went out and got the actual certifications. I fell off hard, got burned out, and didn't keep myself accountable.

I still haven't taken them. That's not past tense — that's where I am right now. Not getting myself out there is a big part of why I haven't transitioned into IT yet, and that's on me.

Which is part of why this exists. If I say I'm working toward the certs and then nothing shows up here for six months, that's on the record too.

I'd like to be held accountable, even if it's by nobody but myself.

## Nero

I'm also really into AI. I know we're in the middle of the AI boom and everybody wants AI right now — but I actually have a passion for it. It's almost like a dream come true. Everybody saw what Iron Man did with Jarvis and wants to recreate it, and yeah, I have that idea too. I know we're not 100% there. But I want to work with the technology and get as close as I can.

Which brings me to my digital assistant, Nero.

Nero is an AI agent I built. He helps me stay on task and proofreads my stuff — he's actually proofreading this post. He's been with me for a while now, and I've run him on a few different harnesses: [OpenClaw](https://openclaw.ai/), then [Hermes Agent](https://hermes-agent.nousresearch.com/), and now Daniel Miessler's [LifeOS](https://github.com/danielmiessler/LifeOS) (formerly PAI, if you've seen it written up under that name).

LifeOS is my favorite so far. It wires the model to be more personal and to actually keep you accountable. It ships as a single self-contained skill that bundles a whole library of other skills. It's technically harness-agnostic, but Miessler builds on Claude Code so that's the best-tested path, and that's where I run it.

I've also wired in [Fabric](https://github.com/danielmiessler/fabric) — that's a separate project of his, a big collection of really well-made prompt patterns you can adjust to your needs. It doesn't come bundled with LifeOS; I pulled the patterns into my own skills. That's been one of my favorite parts of the setup so far.

I want to write a lot about what I do with AI. Maybe some tutorials, maybe deeper dives into Nero — what I broke, what I fixed, what I've seen work, and what I'm working toward. I love seeing real use cases for AI and how people are actually integrating it, so I've been watching a lot of videos from people who use it seriously in their own workflows.

## On actually using this stuff

I use Nero for pen testing, for learning, and for interacting with information generally. He's kind of a study buddy — if I'm not understanding a topic, I'll have him break it down and put it into an interactive HTML page or some other format I can actually visualize. He can describe the same topic in a dozen different ways until one lands.

AI is incredible technology, as long as you're planning and you understand what it actually is. I don't want to reduce it to "just a word generator," but in a sense that's what it is, from my understanding: you give it a word and it generates what's probably next, based on what it thinks you want. It doesn't really know whether it's right or wrong. You have to keep that in mind, because not everything it spits out is true.

That's why I lean toward giving it good information up front and having it plan and lay things out with that information, rather than fully trusting whatever it pulls from training data.

It's a new era and you've got to lean into it — same as when the internet came out and nobody trusted it right away. There was always that sarcastic saying growing up — "it was on the internet, so it must be true" — because we were constantly told not to believe everything online. It's genuinely hard to decipher good sources from bad, and there's an anxiety in that. It holds me back a lot, honestly — where do I go, which route do I pick to learn a given concept. But I'm going to get it down.

## What to expect

- AI: what I'm building, what's breaking, and recent news
- The homelab and the cluster build (it's a budget build; think Mad Max vibes)
- Nero — how I use him for pen testing, for learning, and as a study buddy/mentor
- Progress toward the certs
- Linux content (currently daily driving CachyOS)
- My struggles

I'd love to hear feedback on what people want to see. Anyways, I'll see you in the next blog post — peace!
