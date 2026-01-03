# Claude Code as a Personal Assistant

Some context: I'm [Fabrizio](https://fabrizio.so), [@linuz90 on X](https://x.com/linuz90), co-founder and designer of [Typefully](https://typefully.com).

At Typefully, we fully embraced AI coding early on, and we use Claude Code (and Codex) extensively. But I also like to optimize and automate parts of my personal life.

Especially since the introduction of the Sonnet/Opus 4.5 models, [Claude Code](https://claude.com/product/claude-code) has become my AI coding assistant of choice.

I quickly realized that these models are actually very capable **general-purpose agents** when given the right instructions, context, and tools.

After seeing my co-founder [Francesco](https://x.com/frankdilo) use Claude Code to handle tasks and emails, I started **using it as a personal assistant, especially through Telegram** (which is what this project is about).

After some iteration, I landed on this system/setup:

1. **I've created a `fab-dev` folder** with a CLAUDE.md that teaches Claude about me, my preferences, where my notes live, my workflows.
2. _OPTIONAL_: I've asked Claude to **[symlink](https://en.wikipedia.org/wiki/Symbolic_link) configuration files** into this new central folder, so I can edit them easily and improve my dev setup. For example, I symlinked ~/.claude/commands here, so I can ask Claude to add new commands which will be available everywhere. I also symlinked ~/.zshrc into this folder, so I can ask Claude to edit and improve my shell configuration too.
3. _OPTIONAL_: **I've tracked the folder as a Git repository** so I can also easily version control it, or share it on multiple Macs in the future if I need it.
4. **I set this "fab-dev" folder as the working directory** for this bot (via `CLAUDE_WORKING_DIR`).

**To keep CLAUDE.md lean**, I reference my personal notes system there rather than embedding everything directly.

The main "Notes" folder referenced in `CLAUDE.md` is an iCloud folder that I added to [Ulysses](https://ulysses.app/) and [iA Writer](https://ia.net/writer), so I can see changes made by my assistant live, wherever I am. iCloud is insanely good at this, pushing updates live to all devices in the background.

Also, I've extended its capabilities by installing [MCPs](https://code.claude.com/docs/en/mcp), adding [commands](https://code.claude.com/docs/en/slash-commands), and sometimes [skills](https://code.claude.com/docs/en/skills) (but I don't use them much).

**The magical part: when I need a new capability, I just ask Claude to build it.** Even via the Telegram bot, on the go.

For example, I wanted my assistant to summarize videos, so I asked it to create scripts for fetching YouTube subtitles (with fallback to downloading and transcribing locally). Now I can request video summaries from anywhere via Telegram.

![Video summary example](../assets/demo-video-summary.gif)

## CLAUDE.md is the Assistant's Brain

The `CLAUDE.md` file in my personal assistant `fab-dev` folder is the centerpiece of the setup.

Since Claude runs by default with prompt permissions bypassed (more on this in [SECURITY.md](../SECURITY.md)), it can browse other folders, read and write files, and execute commands quite freely within the allowed paths (more on scripts and commands below).

Here's a template based on my own setup:

```
# CLAUDE.md

This file provides guidance to Claude Code so it can act as [Your Name]'s personal assistant.

## Quick Reference

**Key paths:**
- Notes: `~/Documents/Notes/`
- Personal docs: `~/Documents/Personal/`
- Downloads: `~/Downloads/`
- iCloud: `~/Library/Mobile Documents/com~apple~CloudDocs/`

**This folder:**
- `scripts/` - Utility scripts Claude can run
- `claude/commands/` - Custom slash commands
- `claude/skills/` - Auto-triggered skills

## About [Your Name]

[Your Name] is a [age]yo [profession] based in [City].

[Brief context about work, lifestyle, hobbies, etc.]

**Personal context**: For detailed personal information (family, friends, preferences, etc.), read `~/Documents/Notes/Me/personal-context.md`. Reference this file when answering personal questions.

**Life goals**: For high-level objectives and long-term goals, read `~/Documents/Notes/life-goals.md`.

**Keeping context fresh**: When new personal information emerges during conversations (new friends, places, habits, preferences, life updates), proactively update `Me/personal-context.md`. When new life goals emerge, update `life-goals.md`.

## How to Assist

- **Always check the date**: For time-sensitive questions, run `date` first
- **Communication style**: [e.g., "Balanced and friendly, not too terse, use emojis sparingly"]
- **Autonomy**: Handle routine tasks independently, ask before significant actions
- **Proactive**: Suggest next steps after completing work
- **Formatting**: Prefer bullet lists over markdown tables

## Task Management

Use the [Things/Todoist/etc.] MCP/script to read and write tasks.

**When I ask "what's on my plate"**: Check both tasks AND calendar automatically.

**Creating tasks:**
- Check existing projects first to route tasks correctly
- Unless specified, schedule new tasks for Today
- Include relevant context in task description

**Task routing** (if your task manager supports IDs/UUIDs):
- Work tasks → Work area or specific project ID
- Personal tasks → appropriate project (Health, Shopping, etc.)
- [Hobby] tasks → dedicated project

## Calendar

Use `scripts/calendar.sh` to check my calendar.

## Email

Use `scripts/gmail.sh` (or similar) to read and manage email:

gmail.sh inbox [--unread]     # List inbox
gmail.sh read <id>            # Read email
gmail.sh search <query>       # Search emails
gmail.sh archive <id>         # Archive email

**Email → Task workflow**: Route to correct project, set deadline if mentioned, include email link in task description, archive after task created.

## Notes

`~/Documents/Notes/` contains:

- `pulse.md` - Daily life digest auto-generated via the `/life-pulse` command
- `life-goals.md` - Long-term objectives (separate from pulse)
- `Me/` - Personal context, measurements, home info
- `Research/` - Research files and comparisons
- `Health/` - Health tracking, workouts
- `[Hobby]/` - Notes for specific interests

## Research

When I ask to research something:

1. Check existing research in `~/Documents/Notes/Research/`
2. Search thoroughly using web search
3. Save findings to `~/Documents/Notes/Research/YYYY-MM-DD-topic.md`
4. Include sources and a clear recommendation

## Personal Documents

Important documents in `~/Documents/Personal/` - identity docs, medical records, receipts, etc.

## Health

Use `scripts/health.sh` for Apple Health data (requires Health Auto Export app).

When I ask for a workout:

1. Check my training plan in `Health/training.md`
2. Look at recent workout logs
3. Suggest appropriate workout and create the log file

## Media

Scripts for working with video/media:

- `video-download.sh <url>` - Download videos (YouTube, etc.)
- `video-transcript.sh <url>` - Get YouTube transcripts
- `video-to-gif.sh <video>` - Convert to GIF

## Telegram Bot

Claude Code can run in this folder via a Telegram bot (code located at `~/dev/claude-telegram-bot/`).

**Voice transcription keywords**: To add terms for recognition, edit `TRANSCRIPTION_CONTEXT` in `.env`.

**MCP servers**: Edit `~/dev/claude-telegram-bot/mcp-config.ts` to add new servers.

**Restart:** Use `/restart` in Telegram, or `cbot-restart` alias.

```

The _"keeping context fresh"_ instruction creates a sort of file-based memory system, since Claude automatically reads and updates context files (notes) as it learns new things about me.

I also occasionally ask Claude to check my Notes folder, Things projects, etc., and update the `CLAUDE.md` file with the latest information, so it's fine to hardcode some information there since it's quite easy to let it update itself.

## Example: Claude as a Personal Trainer / Health Coach

One of my favorite uses of this setup is having Claude act as a personal trainer that knows my diet, my training plan, and my recent activity.

I recorded demos on my Mac, but this is what I normally do on the go, from my iPhone:

![Workout example](../assets/demo-workout.gif)

The setup is simple:

1. **[Health Auto Export](https://www.healthyapps.dev/)** - An iOS app that syncs Apple Health data to iCloud as daily JSON files
2. **A script** that reads those files and returns structured health data
3. **CLAUDE.md instructions** that tell Claude where my training plan lives and how to create workout logs
4. **A Notes folder** (synced via iCloud) where workout logs are saved as markdown

I asked Claude to create the `health.sh` script, which parses Health Auto Export's JSON files and returns my current health metrics plus historical trends for comparison.

Here's what it returns:

```json
{
  "current": {
    "sleep": {
      "duration": "8h 6m",
      "deep": "2h 4m",
      "rem": "2h 4m",
      "bedtime": "1:18 AM",
      "wakeTime": "9:27 AM"
    },
    "activity": {
      "steps": 6599,
      "distance": "5.1km",
      "activeCalories": 582,
      "exerciseTime": 20
    },
    "vitals": {
      "restingHR": 48,
      "hrv": 70.6,
      "avgHR": 61
    }
  },
  "trends": {
    "last7days": { "avgSleep": "7h 40m", "avgRestingHR": 56.6, "avgHRV": 68.8 },
    "30daysAgo": { "avgSleep": "7h 21m", "avgRestingHR": 55.1, "avgHRV": 66.4 },
    "3monthsAgo": { "avgSleep": "7h 29m", "avgRestingHR": 51.3, "avgHRV": 77.5 }
  },
  "recovery": {
    "score": 80,
    "status": "optimal"
  }
}
```

Now I can ask things like "how did I sleep?" or "how's my recovery looking?" from anywhere.

In `CLAUDE.md`, I've added this instruction:

```markdown
## Workouts

Use `scripts/health.sh` for Apple Health data.
Use `scripts/workouts.sh` for workout history.

**Workout requests** - when I ask for a workout:

1. Read training plan (`Health/training.md`) - from my PT, always the basis
2. Check recent logs in `Health/Workouts/` to see what I did last
3. Propose a workout that makes sense (if last was upper body → suggest lower or full body)
4. **ALWAYS create the log file immediately** as `Health/Workouts/YYYY-MM-DD-workout.md`
```

When I message "give me a workout", Claude:

1. Checks my training plan from my PT
2. Looks at what I did in recent workouts
3. Considers my recovery score from `health.sh`
4. Creates a workout log file like this:

```markdown
# Workout - 29 Dec 2025

**Type:** Full Body
**Location:** Gym

## Exercises

3 sets, 10-12 reps, 1 min rest

1. **Leg Extension** - [video](https://youtu.be/...)
2. **Leg Curl** - [video](https://youtu.be/...)
3. **Lat Machine** - [video](https://youtu.be/...)
4. **Shoulder Press** - [video](https://youtu.be/...)
5. **Triceps Pushdown + Bicep Curl**

## Notes

Light workout during vacation, ~45-50 min.
```

Since my Notes folder syncs via iCloud, I open [Ulysses](https://ulysses.app/) on my iPhone at the gym and the workout is right there.

I can message Claude mid-workout asking to tweak something, like "swap the shoulder press for lateral raises", and the file updates. I see the change live in Ulysses within seconds.

It's like having a personal trainer in my pocket who knows my training history, my recovery status, and can adjust on the fly.

As usual, the better the context, the better the results. So if you have a training plan or training history, make sure those notes are available to Claude.

## Example: Life Pulse Command with Subagents

[Commands](https://code.claude.com/docs/en/slash-commands) let you define reusable prompts with dynamic context. They live in `~/.claude/commands/` (global) or `your-project/claude/commands/`.

[Subagents](https://code.claude.com/docs/en/sub-agents) on the other hand are specialized agents that Claude can delegate tasks to. They're defined as markdown files in `.claude/agents/` and each runs with its own context window, which keeps the main conversation lean.

My personal assistant "fab-dev" folder contains both commands and subagents. Commands are symlinked from `~/.claude/commands/` so they're available everywhere, and they can use MCPs and invoke subagents defined in this folder.

I always liked the idea of reading a sort of **executive summary of what's on my plate** every morning, so I asked Claude to create a `/life-pulse` command, with a set of specialized subagents, and also to set it up to run automatically every morning.

### Why Subagents?

A complex command like `/life-pulse` needs to gather data from many sources: email, work issues, finances, health metrics, racing stats, web news. If the main agent does all this directly, the context window fills up fast with raw data, and can lead to poor results or missing information.\*

So my pulse command uses **6 subagents** that run in parallel:

| Subagent            | Job                            | Returns                                   |
| ------------------- | ------------------------------ | ----------------------------------------- |
| `gmail-digest`      | Analyze inbox & recent emails  | Unread needing attention, orders, threads |
| `linear-digest`     | Analyze work issues            | In-progress, blockers, up next            |
| `finance-digest`    | Analyze net worth & allocation | Financial snapshot, time-sensitive items  |
| `health-digest`     | Analyze Apple Health data      | Brief health check-in                     |
| `sim-racing-digest` | Analyze race results           | Performance insights                      |
| `for-you-digest`    | Curate web & Reddit content    | 10-15 interesting items                   |

The main agent then just handles lightweight data (Things tasks, calendar, journal) and **assembles** the subagent outputs into the final digest.

### Subagent Example

Here's what a digest subagent looks like (simplified):

```
---
name: health-digest
description: Analyzes health metrics and provides a brief check-in. Use for pulse or when user asks about health.
tools: Bash, Read
model: haiku
---

You are a health-conscious friend giving a quick check-in on health metrics.

## Data Gathering

Run the health script:
~/scripts/health.sh

## Analysis

Look for what's actually notable:

- Sleep significantly better/worse than usual
- Resting HR trending up (stress) or down (fitness)
- HRV changes over the past month

## Output

Return a brief check-in (3-5 lines). Write like a friend, not a medical report.

Example: "Sleep's been solid at 7.2h — up from 6.8h last month. Resting HR holding at 54bpm. Activity a bit low this week, might want to get some walks in."
```

### The Main Pulse Command

Here's a simplified version of the `/life-pulse` command:

````
---
description: Generate executive life digest
allowed-tools: Bash, Read, Write, mcp__things__*, Task
---

# Generate Life Pulse

## Context

- Current time: !`date "+%A, %Y-%m-%d %H:%M"`

## Implementation

1. **Gather Data** (run in parallel):

- Things: `get_today`, `get_upcoming`, `get_projects` (lightweight, main agent handles)
- Calendar: `~/scripts/calendar.sh range <today> <today+28>`
- Journal: Read 2-3 recent entries
- **Email**: Invoke `gmail-digest` subagent (do NOT run in background)
- **Work**: Invoke `linear-digest` subagent (do NOT run in background)
- **Finances**: Invoke `finance-digest` subagent (do NOT run in background)
- **Health**: Invoke `health-digest` subagent (do NOT run in background)
- **Racing**: Invoke `sim-racing-digest` subagent (do NOT run in background)
- **For You**: Invoke `for-you-digest` subagent (do NOT run in background)

2. **Synthesize** the outputs into sections:

- **TL;DR**: Bullet points (max 400 chars each) capturing essential state of life. Each bullet starts with a relevant emoji. Include financial snapshot, email highlights, upcoming events.
  - For items with a clear next action, add a follow-up line:
    ```
    💰 **Item description here.**
    ↳ **Clear next action here**
    ```
- **Now**: Very concise list of what needs attention. 3-6 items max, no fluff.
- **For You**: Curated content from for-you-digest. Brief bullets with emojis and links.
- **Top of Mind**: What's occupying mental bandwidth. Use emoji at the start of each paragraph.
- **Health**: From health-digest. Can be bullets, each with a relevant emoji.
- **Next**: Near-term priorities combined with longer-term goals.

3. **Formatting Rules**:
- NO TABLES — use natural prose and bullet points
- Use **bold** for emphasis on key terms
- Keep it scannable but warm, like a personal briefing
- Make links clickable (Linear issues, Things tasks, emails)

4. **Write** to `~/Documents/Notes/life-pulse.md`

5. Open the file when done: `open ~/Documents/Notes/life-pulse.md`
````

All the raw data stays contained in fast and cheap subagent runs (they use `haiku`). The main agent only sees the synthesized summaries and assembles everything into a coherent, readable digest.

And because each subagent is a standalone file, I can invoke them directly to answer questions like "how's my health?" or "check my email".

I've been reading my life pulse digest on my iPad every morning while sipping coffee for a while now, and it's been a great way to start the day.

## Example: Dynamic Calendars

Another cool pattern I use is having Claude **manage calendars that sync to my phone**. I use this for both real-world track days and sim racing leagues.

```
YAML config → sync.py → .ics file → GitHub Gist → Google/Apple Calendar
```

[GitHub Gist](https://gist.github.com/) URLs are stable, so calendar apps that subscribe to them auto-refresh when the content changes (with some delay).

I wanted to know about track days at circuits near me (Estoril, Portimão in Portugal). The problem: event info is scattered across multiple organizer websites, often in PDF flyers or image-based pages.

So I asked Claude to build a scraper. It grew into a 36,000-line Python script (`racing-events.py`) that:

1. **Scrapes multiple sources** - EuropaTrackdays, Driven.pt, Motor Sponsor, CRM Caterham
2. **Uses Playwright** for JavaScript-heavy sites
3. **Uses OCR and Claude Vision** for PDF flyers and image-based calendars
4. **Outputs YAML** with structured event data

YAML is a good format for this since it's easy to read and write, and I can also easily spot mistakes and manually edit it.

```yaml
# calendars/track-days.yaml (auto-generated)
gist:
  id: 12344asdasd257be07871234asddfg123
  filename: track_days.ics
calendar:
  name: "Fab • Track Days"
  timezone: Europe/Lisbon
events:
  - date: "2026-01-11"
    time: "09:00"
    title: "Portimão - Gedlich Racing"
    duration_minutes: 540
    description: "Endless Summer | €3,290 | Open Pit Lane..."
    url: https://en.europatrackdays.com/trackday/29919/...
```

The YAML is then synced to a Gist that my calendar subscribes to.

When I ask "update my track day calendar", Claude runs the scraper, updates the YAML, and syncs to the gist. My calendar refreshes automatically.

In fact, I asked Claude to create a `sync.py` script that converts YAML to iCalendar format and pushes to GitHub:

```bash
# List available calendars
calendars/sync.py list

# Preview upcoming events
calendars/sync.py preview sim-racing

# Sync to gist (uses `gh` CLI)
calendars/sync.py sync sim-racing
```

I subscribed to these Gist URLs once in Google Calendar and Apple Calendar:

```
https://gist.githubusercontent.com/linuz90/.../raw/sim_racing.ics
https://gist.githubusercontent.com/linuz90/.../raw/track_days.ics
```

Now when I message "add the Belgium race to my sim racing calendar for next Thursday", Claude:

1. Edits `sim-racing.yaml`
2. Runs `sync.py sync sim-racing`
3. The gist updates
4. My phone calendar refreshes within minutes

I can manage my racing calendars from anywhere in the world, via Telegram.

## Example: Claude as a Researcher

Another pattern I use all the time is having Claude do thorough research for me. Whether I'm comparing products, investigating a topic, or making a purchase decision, Claude searches multiple sources and synthesizes findings into a clear recommendation.

![Research example](../assets/demo-research.gif)

The setup looks like this:

1. **A Research folder** in my Notes where findings are saved as markdown files
2. **CLAUDE.md instructions** that tell Claude how to research and where to save results
3. **Optional scripts** for specialized sources (like Reddit)

And in `CLAUDE.md`, I've added this instruction:

```markdown
## Doing Research

**IMPORTANT: Every research task MUST end with saving results to `~/Documents/Notes/Research/`. This is not optional.**

When I ask to research, compare, or investigate something:

1. **Check existing research first** in `~/Documents/Notes/Research/`
2. **Search thoroughly** using web search
3. **Synthesize findings** - actionable insights with pros/cons and clear recommendation
4. **Save to file (MANDATORY)** - `~/Documents/Notes/Research/yyyy-mm-dd-{brief-topic}.md`
   - Do this BEFORE responding to the user
5. **Update if exists** - same topic → update existing file

**File format:**

\`\`\`markdown

# {Topic Title}

**Date:** {YYYY-MM-DD}
**Context:** {Brief note on why this research was needed}

## Summary

{1-3 sentence recommendation}

{other sections as needed}

## Sources

- [Source Title](url)
  \`\`\`
```

Reddit is an amazing source for real-world opinions and experiences, and I've discovered that you can just append `.json` to Reddit URLs to get the raw JSON data, so I asked Claude to build a Reddit scraper that returns top posts and comments from relevant subreddits:

```bash
# Top recent posts from specific subreddits
reddit.sh top iRacing,simracing --time week --limit 10 --preview

# Search for specific topics
reddit.sh search "BMW M2 front splitter" --time all --limit 20 --preview

# Product recommendations
reddit.sh search "best racing wheel 2025" --time year --limit 15 --preview
```

The `--preview` flag includes the full post content and top comments, which is where the real insights are.

So, when I message something like "research upgrade options for my sim racing rig", Claude:

1. **Checks existing research** - looks in `Research/` for any previous files on sim racing or related topics
2. **Searches the web** - uses web search for product reviews, comparisons, and expert opinions
3. **Searches Reddit** - finds community discussions with real-world experiences and recommendations
4. **Synthesizes everything** - combines official specs, reviews, and community feedback into actionable insights
5. **Saves the research** - creates a dated file like `2025-12-30-sim-racing-rig-upgrade.md`

The result is a comprehensive research document with clear recommendations and links to all sources. I love that I can trigger this anywhere and anytime.
