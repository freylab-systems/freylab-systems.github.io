# FreyLab.systems — my runbook

My notes on how this site works and how to run it without help. Written for
future me at 11pm when something's broken and I've forgotten everything.

Repo lives at `~/Projects/freylab.systems`. Site is Jekyll, hosted free on
GitHub Pages under the account `freylab-systems`.

---

## What this thing actually is

There's no database and no server-side code. Jekyll is a **static site
generator**: it reads markdown files, stuffs them into HTML templates, and spits
out a folder of plain HTML. GitHub Pages then serves that folder.

That's the whole model. Write markdown → build → static HTML → push → live.

Nothing to hack, nothing to patch, nothing to keep running at 3am. Which is
exactly why I picked it.

---

## The 60-second loop

Everything I do day-to-day is these four commands.

```bash
cd ~/Projects/freylab.systems

# 1. start the local preview (leave it running in its own terminal)
bundle exec jekyll serve --livereload

# 2. write. save. the browser refreshes itself.
#    → http://localhost:4000

# 3. when it's good
git add -A
git commit -m "New post: whatever it is"

# 4. ship
git push
```

Live in ~60 seconds after the push. GitHub rebuilds on its end automatically.

**`--livereload` is the good part.** Save the file, the browser updates. No
manual refresh, no rebuild command.

---

## File map

Only the things I'll actually touch.

| Path | What it is |
|---|---|
| `_posts/` | Published posts. Filename **must** be `YYYY-MM-DD-slug.md` |
| `_drafts/` | Unpublished posts. No date needed in the filename |
| `_layouts/` | Page templates. `home.html`, `post.html`, `default.html` |
| `_includes/` | Reusable chunks. `head.html`, `edit.html`, `edits.html` |
| `assets/main.scss` | **All my styling.** Colours, fonts, spacing — one file |
| `_config.yml` | Site title, description, URL, plugins |
| `about.markdown` | The About page |
| `_site/` | Build output. Generated. **Never edit, never commit** |

`_site/` is in `.gitignore` on purpose. Editing it is always a mistake — the
next build wipes it.

---

## Writing a post

Make a file in `_posts/` named `YYYY-MM-DD-some-slug.md`:

```markdown
---
layout: post
title: "Building a Proxmox cluster out of office junk"
date: 2026-08-04 09:00:00 -0400
---

Body goes here. Normal markdown.

<!--more-->

Everything above that marker is the excerpt. Everything below is the rest.
```

**Rules I keep tripping over:**

- The filename date and the front matter date should match. The **filename**
  decides the URL; the **front matter** decides the ordering.
- Always include the `-0400` timezone offset. Leave it off and Jekyll assumes
  UTC, which lands the post on the wrong day. Bit me on the task tracker too.
- A **future-dated post silently doesn't build**. No error, no warning, it just
  isn't there. If a post vanishes, check the date first.
- `layout: post` — miss it and you get unstyled raw text.

### Drafts

Two different mechanisms, and I mixed them up once already:

**For posts** → put the file in `_drafts/` (plural, it's a *directory*, not a
filename prefix). No date needed in the name. Preview with:

```bash
bundle exec jekyll serve --drafts
```

Without `--drafts`, drafts are invisible. When it's ready, move it to `_posts/`
and rename it with the date.

**For pages** (About, etc.) → `_drafts/` doesn't apply. Use front matter:

```yaml
published: false
```

That keeps it out of the built site *and* out of the nav. Flip to `true` when
it's ready. This also works on posts if I want to hide one without moving files.

---

## The "Nero's edits" panel

The collapsed box at the bottom of a post showing what Nero suggested and what I
did about it. Driven entirely by front matter — no separate file, no page.

```yaml
---
layout: post
title: "Some post"
edits_intro: >-
  I had Nero proofread this. Here's what he caught.
edits:
  - verdict: rejected
    note: |
      He wanted an excerpt plus a Read more button. I said no — that's the move
      every content farm makes right before asking you to subscribe.
    before: A truncated excerpt and a button.
    after: The whole post, inline.

  - verdict: accepted
    note: |
      Comma splice. The em dash gives the line the beat it deserves.
    before: That's not past tense, that's where I am right now.
    after: That's not past tense — that's where I am right now.
---
```

- `verdict:` is `accepted` or `rejected`. They're colour-coded — green and red.
- `note:` uses `|` so it can run multiple lines.
- `before:`/`after:` use `>-` if they need to wrap.
- **No `edits:` key = nothing renders.** Zero cost on posts where it doesn't fit.

**The point of this feature is the rejections.** A panel where I accepted
everything is an ad for the tool. The ones I turned down are what make it honest.
At least one per post or it's not worth showing.

---

## RSS — what it is and why I'm keeping it

RSS is how people followed sites before algorithms. A site publishes a machine-
readable list of its posts at a fixed URL; a reader app polls that URL and shows
you what's new.

Mine is generated automatically at **`/feed.xml`** by the `jekyll-feed` plugin.
I don't maintain it. New post → it's in the feed.

**Why it's worth having:**

- **No middleman.** No algorithm deciding whether my post gets shown. Someone
  subscribes, they get every post.
- **No account, no tracking.** I don't know who's subscribed and they don't have
  to sign up for anything.
- **My audience actually uses it.** Homelab and Linux people are the last
  serious RSS holdouts. This is exactly the crowd that will subscribe.
- **It costs me nothing.** It's already there.

**Readers worth knowing:** Feedly (hosted, easy). **FreshRSS** or **Miniflux**
(self-hosted — both run fine in a container on Necropolis, which is very much
the move). Thunderbird also reads feeds if I want it in the same place as mail.

Worth pointing at my own feed from a future post — most people don't know a
blog has one unless you tell them.

---

## Git & GitHub

The part I'm actually learning. Notes so I don't have to re-google it.

### The vocabulary

- **Repository (repo)** — a project folder that tracks its own history.
- **Commit** — a saved snapshot with a message. Local until pushed.
- **Remote / `origin`** — the copy on GitHub. `origin` is just the conventional
  nickname.
- **Push** — send local commits to the remote. **Pull** — the reverse.
- **Branch** — a line of history. Mine is `main`. Only one for now.
- **GitHub Pages** — free static hosting straight from a repo.

### Daily commands

```bash
git status          # what's changed — run this constantly, it's free
git diff            # what changed, line by line
git add -A          # stage everything
git commit -m "msg" # snapshot it
git push            # send to GitHub
git log --oneline   # history, one line each
```

`git status` is the one to lean on. It tells me what state I'm in and usually
suggests the next command.

### One-time setup

```bash
# who I am (goes into every commit, permanently, publicly)
git config --global user.name "Jake Frey"
git config --global user.email "frey.system@gmail.com"

# prove it's me — SSH beats a token, GitHub won't take a password
cat ~/.ssh/id_ed25519.pub          # copy this
# → github.com/settings/keys → New SSH key → paste
ssh -T git@github.com              # want: "successfully authenticated"

# point the local repo at GitHub
git remote add origin git@github.com:freylab-systems/freylab-systems.github.io.git
git push -u origin main            # -u only needed the first time
```

The email must be a **verified address on the GitHub account**, or commits
won't link to my profile and won't show on the contribution graph. Silent
failure, annoying to fix later.

### Repo naming

Named `freylab-systems.github.io` — exactly matching the username — so GitHub
serves it at the domain root. A repo named anything else serves at
`username.github.io/reponame/`, which means setting `baseurl` in `_config.yml`
and a class of "why is my CSS 404ing" bugs that only appear in production.

---

## Gotchas that already bit me

Every one of these cost real time.

| Symptom | Cause |
|---|---|
| Post doesn't appear | Future-dated. Jekyll skips future posts silently |
| Post is one day early/late | Missing `-0400` offset — parsed as UTC |
| `Invalid syntax for include tag` | An `include` tag broken across lines. Must be one line |
| Liquid error inside `main.scss` | That file has front matter, so Jekyll runs Liquid on it — a `{% ... %}` in a *comment* still executes |
| CSS changes do nothing | Edited `_site/`. Always edit source, never build output |
| `_config.yml` change ignored | It's the one file **not** hot-reloaded. Restart the server |
| Draft outranks the real post | Home page shows the *newest* post. A draft dated later steals the front page |
| `Permission denied (publickey)` | SSH key isn't on the GitHub account |

---

## Style

All of it lives in `assets/main.scss`. Variables at the top, before the
`@import "minima"` line — that ordering matters, Minima's own values are
`!default` so whatever's set first wins.

```scss
$background-color: #18181b;   // page
$surface-color:    #232327;   // raised: code, quotes, tables
$border-color:     #33333a;
$text-color:       #f2f2f5;
$brand-color:      #ff6b6b;   // coral — links, rules, thin things
$brand-block:      #e63946;   // deeper — solid panels with white text on them
```

**Two reds on purpose.** White text on the coral fails contrast; on the deeper
one it passes. Thin things get coral, solid blocks get the deep one.

Fonts are **Source Serif 4** for prose and **IBM Plex Mono** for metadata and
code, loaded in `_includes/head.html`.

---

## If it's really broken

```bash
cd ~/Projects/freylab.systems

git status                      # what did I actually change
git diff                        # ...and what does it look like
git checkout -- <file>          # throw away changes to one file
rm -rf _site && bundle exec jekyll build   # nuke the build, start clean
bundle exec jekyll build --trace           # full stack trace on an error
```

Last resort — everything since the last commit goes away:

```bash
git reset --hard HEAD
```

Committing often is what makes that safe. Commit before anything experimental.

---

*Started 2026-07-28. Add to this every time something breaks.*
