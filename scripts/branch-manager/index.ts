import { auditBranches } from './audit';
import { cleanupBranches } from './cleanup';
import { reportUnmergedBranches } from './integration';

const args = process.argv.slice(2);
const dryRun = !args.includes('--execute');

console.log(`Starting Branch Manager... (Dry Run: ${dryRun})`);

const branches = auditBranches();
console.log(`Audited ${branches.length} branches.`);

cleanupBranches(branches, dryRun);
reportUnmergedBranches(branches);

console.log('Done.');
