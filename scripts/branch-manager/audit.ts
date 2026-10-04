import { execSync } from 'child_process';
import { getWorktrees } from './worktree';

export interface BranchInfo {
  name: string;
  isRemote: boolean;
  isMerged: boolean;
  isActiveWorktree: boolean;
  worktreePath?: string;
}

export function auditBranches(): BranchInfo[] {
  const worktrees = getWorktrees();
  const activeBranchesMap = new Map<string, string>();
  for (const wt of worktrees) {
    if (wt.branch) activeBranchesMap.set(wt.branch, wt.path);
  }

  const localOutput = execSync('git branch', { encoding: 'utf8' });
  const localBranches = localOutput
    .trim()
    .split('\n')
    .map((b) => b.replace(/^[\s*+]+/, '').trim())
    .filter((b) => b);

  const mergedLocalOutput = execSync('git branch --merged master', { encoding: 'utf8' });
  const mergedLocal = new Set(
    mergedLocalOutput
      .trim()
      .split('\n')
      .map((b) => b.replace(/^[\s*+]+/, '').trim())
      .filter((b) => b)
  );

  const remoteOutput = execSync('git branch -r', { encoding: 'utf8' });
  const remoteBranches = remoteOutput
    .trim()
    .split('\n')
    .map((b) => b.trim())
    .filter((b) => b && !b.includes('->'));

  const mergedRemoteOutput = execSync('git branch -r --merged origin/master', { encoding: 'utf8' });
  const mergedRemote = new Set(
    mergedRemoteOutput
      .trim()
      .split('\n')
      .map((b) => b.trim())
      .filter((b) => b && !b.includes('->'))
  );

  const allBranches: BranchInfo[] = [];

  for (const branch of localBranches) {
    if (branch === 'master' || branch === 'feat/issue-40') continue;
    allBranches.push({
      name: branch,
      isRemote: false,
      isMerged: mergedLocal.has(branch),
      isActiveWorktree: activeBranchesMap.has(branch),
      worktreePath: activeBranchesMap.get(branch),
    });
  }

  for (const branch of remoteBranches) {
    if (branch === 'origin/master' || branch === 'origin/feat/issue-40') continue;
    const localName = branch.replace(/^origin\//, '');
    allBranches.push({
      name: branch,
      isRemote: true,
      isMerged: mergedRemote.has(branch),
      isActiveWorktree: activeBranchesMap.has(localName),
      worktreePath: activeBranchesMap.get(localName),
    });
  }

  return allBranches;
}
