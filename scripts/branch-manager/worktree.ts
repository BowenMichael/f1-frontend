import { execSync } from 'child_process';

export interface Worktree {
  path: string;
  commit: string;
  branch: string | null;
}

export function getWorktrees(): Worktree[] {
  const output = execSync('git worktree list', { encoding: 'utf8' });
  const lines = output.trim().split('\n');

  return lines
    .map((line) => {
      // E:/~Michael Bowen/Projects/F1 Front End/f1-frontend/.worktrees/issue-1    bc1d458 [feat/issue-1]
      const match = line.match(/^(.+?)\s+([a-f0-9]+)\s+\[(.*?)\]$/);
      if (match) {
        return { path: match[1].trim(), commit: match[2], branch: match[3] };
      }

      // /path/to/repo  abc1234 (detached HEAD)
      const detachedMatch = line.match(/^(.+?)\s+([a-f0-9]+)\s+\((.*?)\)$/);
      if (detachedMatch) {
        return { path: detachedMatch[1].trim(), commit: detachedMatch[2], branch: null };
      }

      return { path: '', commit: '', branch: null };
    })
    .filter((wt) => wt.path !== '');
}
