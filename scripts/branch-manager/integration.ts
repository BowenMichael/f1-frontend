import { BranchInfo } from './audit';
import * as fs from 'fs';
import * as path from 'path';

export function reportUnmergedBranches(branches: BranchInfo[]) {
  const unmerged = branches.filter((b) => !b.isMerged);

  let report = '## Unmerged Branches Report\n\n';
  report +=
    'The following branches are unmerged and may need PRs, manual cleanup, or are currently active:\n\n';

  for (const branch of unmerged) {
    report += `- **${branch.name}** (Remote: ${branch.isRemote}, Worktree: ${branch.isActiveWorktree})\n`;
  }

  const reportPath = path.resolve(process.cwd(), 'unmerged_report.md');
  fs.writeFileSync(reportPath, report, 'utf8');
  console.log(`Generated ${reportPath} for review.`);
}
