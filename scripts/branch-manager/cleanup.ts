import { execSync } from 'child_process';
import * as fs from 'fs';
import { BranchInfo } from './audit';

export function cleanupBranches(branches: BranchInfo[], dryRun: boolean) {
  for (const branch of branches) {
    if (branch.isMerged) {
      if (branch.isActiveWorktree && !branch.isRemote) {
        if (branch.worktreePath && branch.worktreePath.includes('.worktrees')) {
          console.log(
            `[${dryRun ? 'DRY-RUN' : 'EXEC'}] Removing worktree for merged branch: ${branch.name} at ${branch.worktreePath}`
          );
          if (!dryRun) {
            try {
              fs.rmSync(branch.worktreePath, { recursive: true, force: true });
            } catch (e2) {
              console.error(`Could not physically remove worktree path`, e2);
            }
          }
        } else {
          console.log(
            `[${dryRun ? 'DRY-RUN' : 'EXEC'}] Skipping worktree removal for ${branch.name} (not a linked worktree or missing path)`
          );
        }
      }

      if (branch.isRemote) {
        const remoteName = branch.name.replace(/^origin\//, '');
        console.log(`[${dryRun ? 'DRY-RUN' : 'EXEC'}] Deleting remote branch: ${remoteName}`);
        if (!dryRun) {
          try {
            execSync(`git push origin --delete ${remoteName}`, { stdio: 'ignore', timeout: 15000 });
          } catch (e) {
            console.error(`Failed to delete remote branch: ${remoteName}`);
          }
        }
      } else {
        console.log(`[${dryRun ? 'DRY-RUN' : 'EXEC'}] Deleting local branch: ${branch.name}`);
        if (!dryRun) {
          try {
            execSync(`git branch -D ${branch.name}`, { stdio: 'ignore', timeout: 5000 });
          } catch (e) {
            console.error(`Failed to delete local branch: ${branch.name}`);
          }
        }
      }
    }
  }

  if (!dryRun) {
    console.log('Pruning worktrees...');
    try {
      execSync('git worktree prune', { stdio: 'ignore', timeout: 10000 });
    } catch (e) {}
  }
}
