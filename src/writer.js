import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

/**
 * Build a compact text summary of the raw git activity for the prompt.
 */
function buildActivityText(activity) {
  if (!activity.repos || activity.repos.length === 0) {
    return 'No commits found for this period.';
  }

  const lines = [];

  lines.push(`Total: ${activity.totals.commits} commits across ${activity.totals.repos} repo(s)`);
  lines.push(
    `Lines: +${activity.totals.insertions} insertions, -${activity.totals.deletions} deletions`
  );
  lines.push(`Files changed: ${activity.totals.filesChanged}`);
  lines.push('');

  for (const repo of activity.repos) {
    lines.push(`Repo: ${repo.repo}`);
    lines.push(`  ${repo.commitCount} commit(s), +${repo.insertions}/-${repo.deletions} lines`);

    if (repo.topExtensions.length > 0) {
      lines.push(`  File types: ${repo.topExtensions.join(', ')}`);
    }

    if (repo.topFiles.length > 0) {
      lines.push(`  Files: ${repo.topFiles.slice(0, 6).join(', ')}`);
    }

    const commitMessages = repo.commits
      .slice(0, 10)
      .map((c) => `  - ${c.subject}`)
      .join('\n');
    lines.push(`  Commits:\n${commitMessages}`);
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Generate a journal entry for a single day via Anthropic API.
 */
export async function writeJournalEntry(activity, date) {
  const activityText = buildActivityText(activity);
  const dateStr = date || new Date().toISOString().split('T')[0];

  const hasActivity = activity.totals && activity.totals.commits > 0;

  if (!hasActivity) {
    return `# Dev Journal — ${dateStr}\n\n*No commits recorded for this period.*\n`;
  }

  const prompt = `You are a developer journaling assistant. Given raw git activity data, write a concise, natural-language developer journal entry.

Style:
- First-person, past tense ("worked on", "fixed", "implemented")
- Technical but readable — like a senior dev's own notes
- No filler phrases like "I'm excited to share" or "It's worth noting"
- Specific and concrete — mention actual file names, features, bug types when clear from the data
- Sections: Summary (2-3 sentences), Projects Touched (bullet per repo), Key Changes (3-6 bullets of the most significant work), Stats

Format as markdown. Keep the whole entry under 400 words. Do not invent details not supported by the commit messages.

Date: ${dateStr}

Git activity:
${activityText}

Write the journal entry:`;

  const message = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 600,
    messages: [{ role: 'user', content: prompt }],
  });

  return message.content[0].text.trim();
}

/**
 * Generate a weekly summary from multiple days or raw weekly activity.
 */
export async function writeWeeklySummary(activity, weekStart, weekEnd) {
  const activityText = buildActivityText(activity);
  const hasActivity = activity.totals && activity.totals.commits > 0;

  if (!hasActivity) {
    return `# Weekly Dev Summary — ${weekStart} to ${weekEnd}\n\n*No commits recorded this week.*\n`;
  }

  const prompt = `You are a developer journaling assistant. Given a week of git activity, write a concise weekly summary.

Style:
- First-person, past tense
- Highlight the most significant themes/projects across the week
- Identify what got shipped vs what's still in progress (infer from commit messages)
- No fluff, no motivational language

Sections:
## Week of ${weekStart}
### Highlights (3-5 bullet points of most impactful work)
### Projects (one line per repo: what was done)
### Stats
### Next Week (1-2 inferred next steps based on in-progress work — prefix with "→")

Keep the whole summary under 500 words. Format as markdown.

Week: ${weekStart} to ${weekEnd}

Git activity:
${activityText}

Write the weekly summary:`;

  const message = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 700,
    messages: [{ role: 'user', content: prompt }],
  });

  return message.content[0].text.trim();
}

/**
 * Generate a standup-formatted update from yesterday + today activity.
 */
export async function writeStandup(yesterdayActivity, todayActivity) {
  const yesterdayText = buildActivityText(yesterdayActivity);
  const todayText = buildActivityText(todayActivity);

  const hasYesterday = yesterdayActivity.totals && yesterdayActivity.totals.commits > 0;
  const hasToday = todayActivity.totals && todayActivity.totals.commits > 0;

  if (!hasYesterday && !hasToday) {
    return `**Standup Update**\n\n**Yesterday:** No commits recorded\n**Today:** No commits yet\n**Blockers:** None\n`;
  }

  const prompt = `You are a developer standup assistant. Given git activity from yesterday and today, write a clean standup update.

Format strictly as:
**Yesterday:** [what was done — 2-4 bullets max]
**Today:** [what's planned — infer from in-progress work or early today commits — 2-3 bullets]
**Blockers:** [say "None" unless commit messages clearly indicate a blocker/issue]

Rules:
- Bullet points only, no paragraphs
- Technical and specific (use actual feature/file names where clear)
- "Today" section = inferred next steps if no today commits yet
- Keep entire update under 150 words

Yesterday's git activity:
${hasYesterday ? yesterdayText : 'No commits.'}

Today's git activity (so far):
${hasToday ? todayText : 'No commits yet today.'}

Write the standup:`;

  const message = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 300,
    messages: [{ role: 'user', content: prompt }],
  });

  return message.content[0].text.trim();
}
