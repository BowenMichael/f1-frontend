#!/usr/bin/env node
/**
 * Agent Template Synchronization CLI
 * 
 * Synchronizes autonomous agent governance files, workflows, and rules
 * between downstream repositories and the upstream template repository.
 * 
 * Usage:
 *   node scripts/agent-sync.js --status
 *   node scripts/agent-sync.js --pull
 *   node scripts/agent-sync.js --push [--direct]
 *   node scripts/agent-sync.js --help
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

const DEFAULT_UPSTREAM = 'BowenMichael/agent-starter-template';
const DEFAULT_BRANCH = 'main';

// Tracked files representing the agent operating system blueprint
const TRACKED_FILES = [
  'AGENTS.md',
  '.github/ISSUE_TEMPLATE/agent_task.md',
  '.github/pull_request_template.md',
  '.github/workflows/agent-task-dispatcher.yml',
  '.github/workflows/agent-template-sync.yml',
  'mcp_config.template.json',
  'agent-manager.json',
  'scripts/agent-sync.js',
  'docs/TEMPLATE_SYNC_GUIDE.md',
  'docs/AGENT_MANAGER_INTEGRATION.md'
];

// CLI Argument Parsing
const args = process.argv.slice(2);
let mode = 'status';
let upstreamRepo = DEFAULT_UPSTREAM;
let upstreamBranch = DEFAULT_BRANCH;
let isDirect = false;

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === '--status' || arg === 'status') mode = 'status';
  else if (arg === '--pull' || arg === 'pull') mode = 'pull';
  else if (arg === '--push' || arg === 'push') mode = 'push';
  else if (arg === '--direct') isDirect = true;
  else if (arg === '--upstream' && args[i + 1]) {
    upstreamRepo = args[++i];
  } else if (arg === '--branch' && args[i + 1]) {
    upstreamBranch = args[++i];
  } else if (arg === '--help' || arg === '-h') {
    printHelp();
    process.exit(0);
  }
}

function printHelp() {
  console.log(`
🔄 Agent Template Synchronization CLI

Commands:
  --status              Check sync status across all tracked files against upstream
  --pull                Download newer template files from upstream into current repo
  --push                Create a branch & PR proposing current changes back to upstream
  --push --direct       Commit directly to upstream (requires push access)

Options:
  --upstream <repo>     Upstream repository (default: ${DEFAULT_UPSTREAM})
  --branch <branch>     Upstream default branch (default: ${DEFAULT_BRANCH})
  --help, -h            Show this help dialog
  `);
}

function getGitHubToken() {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN;
  if (process.env.GITHUB_PERSONAL_ACCESS_TOKEN) return process.env.GITHUB_PERSONAL_ACCESS_TOKEN;
  
  // Check global MCP config
  try {
    const home = process.env.HOME || process.env.USERPROFILE;
    const mcpConfigPath = path.join(home, '.gemini', 'config', 'mcp_config.json');
    if (fs.existsSync(mcpConfigPath)) {
      const config = JSON.parse(fs.readFileSync(mcpConfigPath, 'utf8'));
      const token = config?.mcpServers?.github?.env?.GITHUB_PERSONAL_ACCESS_TOKEN;
      if (token) return token;
    }
  } catch (err) {
    // ignore
  }

  // Fallback to git credential helper
  try {
    const stdout = execSync('git config --get github.token || echo ""', { encoding: 'utf8' }).trim();
    if (stdout) return stdout;
  } catch (e) {
    // ignore
  }

  return null;
}

function fetchUpstreamFile(filePath, repo, branch, token) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'raw.githubusercontent.com',
      path: `/${repo}/${branch}/${filePath}`,
      method: 'GET',
      headers: {
        'User-Agent': 'Agent-Sync-Runner',
        ...(token ? { 'Authorization': `token ${token}` } : {})
      }
    };

    const req = https.request(options, (res) => {
      if (res.statusCode === 404) {
        return resolve({ found: false, content: null, sha: null });
      }
      if (res.statusCode !== 200) {
        return resolve({ found: false, error: `HTTP ${res.statusCode}` });
      }

      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ found: true, content: data });
      });
    });

    req.on('error', (err) => resolve({ found: false, error: err.message }));
    req.end();
  });
}

function fetchUpstreamSha(filePath, repo, branch, token) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${repo}/contents/${filePath}?ref=${branch}`,
      method: 'GET',
      headers: {
        'User-Agent': 'Agent-Sync-Runner',
        'Accept': 'application/vnd.github.v3+json',
        ...(token ? { 'Authorization': `token ${token}` } : {})
      }
    };

    const req = https.request(options, (res) => {
      if (res.statusCode === 404) {
        return resolve(null);
      }
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve(json.sha || null);
        } catch {
          resolve(null);
        }
      });
    });

    req.on('error', () => resolve(null));
    req.end();
  });
}

function normalizeNewlines(str) {
  return (str || '').replace(/\r\n/g, '\n').trim();
}

async function checkStatus(token) {
  console.log(`\n🔍 Checking synchronization with upstream [${upstreamRepo}@${upstreamBranch}]...\n`);
  const results = [];

  for (const relPath of TRACKED_FILES) {
    const localExists = fs.existsSync(relPath);
    const localContent = localExists ? fs.readFileSync(relPath, 'utf8') : null;
    const upstreamRes = await fetchUpstreamFile(relPath, upstreamRepo, upstreamBranch, token);

    let status = 'Unknown';
    let action = 'None';

    if (!localExists && !upstreamRes.found) {
      status = '⚪ Missing Both';
      action = 'Initialize file';
    } else if (!localExists && upstreamRes.found) {
      status = '🔵 Upstream Only';
      action = 'Run --pull to adopt';
    } else if (localExists && !upstreamRes.found) {
      status = '🟡 Local Only';
      action = 'Run --push to share upstream';
    } else if (normalizeNewlines(localContent) === normalizeNewlines(upstreamRes.content)) {
      status = '🟢 In Sync';
      action = 'Up to date';
    } else {
      status = '🟠 Diverged';
      action = 'Review diff / pull or push';
    }

    results.push({ file: relPath, status, action });
  }

  // Display Table
  console.log('='.repeat(78));
  console.log(`${'File'.padEnd(45)} ${'Status'.padEnd(19)} ${'Action Needed'}`);
  console.log('-'.repeat(78));
  results.forEach(r => {
    console.log(`${r.file.padEnd(45)} ${r.status.padEnd(19)} ${r.action}`);
  });
  console.log('='.repeat(78));

  const divergedCount = results.filter(r => r.status.includes('Diverged') || r.status.includes('Local Only')).length;
  if (divergedCount > 0) {
    console.log(`\n💡 ${divergedCount} file(s) have local improvements ready to push upstream.`);
    console.log(`   Run: node scripts/agent-sync.js --push`);
  } else {
    console.log('\n✨ All agent governance files are fully synchronized with upstream template!');
  }
}

async function pullUpdates(token) {
  console.log(`\n📥 Pulling latest templates from [${upstreamRepo}@${upstreamBranch}]...\n`);
  let updatedCount = 0;

  for (const relPath of TRACKED_FILES) {
    const upstreamRes = await fetchUpstreamFile(relPath, upstreamRepo, upstreamBranch, token);
    if (!upstreamRes.found) continue;

    const localExists = fs.existsSync(relPath);
    const localContent = localExists ? fs.readFileSync(relPath, 'utf8') : '';

    if (!localExists || normalizeNewlines(localContent) !== normalizeNewlines(upstreamRes.content)) {
      fs.mkdirSync(path.dirname(relPath), { recursive: true });
      fs.writeFileSync(relPath, upstreamRes.content, 'utf8');
      console.log(`   ✅ Updated: ${relPath}`);
      updatedCount++;
    } else {
      console.log(`   🟢 Current: ${relPath}`);
    }
  }

  console.log(`\n✨ Pull complete. ${updatedCount} file(s) updated.`);
}

async function pushUpdates(token) {
  if (!token) {
    console.error('❌ Error: A GitHub token (GITHUB_TOKEN or GITHUB_PERSONAL_ACCESS_TOKEN) is required to push upstream.');
    process.exit(1);
  }

  console.log(`\n🚀 Preparing to push template improvements to [${upstreamRepo}]...\n`);

  // Detect which files actually have differences or are new
  const changedFiles = [];
  for (const relPath of TRACKED_FILES) {
    if (!fs.existsSync(relPath)) continue;
    const localContent = fs.readFileSync(relPath, 'utf8');
    const upstreamRes = await fetchUpstreamFile(relPath, upstreamRepo, upstreamBranch, token);

    if (!upstreamRes.found || normalizeNewlines(localContent) !== normalizeNewlines(upstreamRes.content)) {
      changedFiles.push(relPath);
    }
  }

  if (changedFiles.length === 0) {
    console.log('✨ No local divergences found. Upstream is already up to date!');
    return;
  }

  console.log(`Detected changes in ${changedFiles.length} file(s):`);
  changedFiles.forEach(f => console.log(` - ${f}`));

  const timestamp = Math.floor(Date.now() / 1000);
  const syncBranch = `template-sync-${timestamp}`;
  const tmpDir = path.join(process.cwd(), '.agent-sync-tmp');

  try {
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }

    console.log(`\nCloning upstream [${upstreamRepo}]...`);
    const cloneUrl = `https://x-access-token:${token}@github.com/${upstreamRepo}.git`;
    execSync(`git clone --depth 1 --branch ${upstreamBranch} "${cloneUrl}" "${tmpDir}"`, { stdio: 'pipe' });

    // Copy changed files to tmp clone
    for (const relPath of changedFiles) {
      const destPath = path.join(tmpDir, relPath);
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      fs.copyFileSync(relPath, destPath);
    }

    // Git operations inside clone
    execSync(`git config user.name "Autonomous Agent"`, { cwd: tmpDir });
    execSync(`git config user.email "agent@users.noreply.github.com"`, { cwd: tmpDir });

    if (isDirect) {
      console.log('Committing and pushing directly to upstream default branch...');
      execSync(`git add .`, { cwd: tmpDir });
      execSync(`git commit -m "feat(template): synchronize agent governance improvements from downstream"`, { cwd: tmpDir });
      execSync(`git push origin ${upstreamBranch}`, { cwd: tmpDir });
      console.log('✅ Changes pushed directly to upstream!');
    } else {
      console.log(`Creating branch [${syncBranch}] and opening Pull Request...`);
      execSync(`git checkout -b ${syncBranch}`, { cwd: tmpDir });
      execSync(`git add .`, { cwd: tmpDir });
      
      const statusOut = execSync(`git status --porcelain`, { cwd: tmpDir, encoding: 'utf8' });
      if (!statusOut.trim()) {
        console.log('No git differences detected after staging. Nothing to commit.');
        return;
      }

      execSync(`git commit -m "feat(template): synchronize agent governance improvements from downstream"`, { cwd: tmpDir });
      execSync(`git push -u origin ${syncBranch}`, { cwd: tmpDir });

      // Create PR via GitHub API
      console.log('Creating Pull Request on GitHub...');
      const prRes = await createPullRequest(upstreamRepo, {
        title: '🤖 feat(template): sync agent rules and governance improvements',
        body: `## 🔄 Upstream Template Synchronization\n\nThis PR proposes agent governance and workflow improvements originating from downstream execution.\n\n### 📦 Updated Files:\n${changedFiles.map(f => `- \`${f}\``).join('\n')}\n\nAutomated by \`scripts/agent-sync.js\`.`,
        head: syncBranch,
        base: upstreamBranch
      }, token);

      if (prRes.html_url) {
        console.log(`\n🎉 Pull Request opened: ${prRes.html_url}`);
      } else {
        console.log('PR creation response:', prRes);
      }
    }
  } catch (err) {
    console.error('❌ Push failed:', err.message);
    if (err.stdout) console.error(err.stdout.toString());
    if (err.stderr) console.error(err.stderr.toString());
  } finally {
    if (fs.existsSync(tmpDir)) {
      try {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      } catch (e) {
        // cleanup fallback
      }
    }
  }
}

function createPullRequest(repo, payload, token) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${repo}/pulls`,
      method: 'POST',
      headers: {
        'User-Agent': 'Agent-Sync-Runner',
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch {
          resolve({ raw: body });
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Execution Entrypoint
async function main() {
  const token = getGitHubToken();
  if (mode === 'status') {
    await checkStatus(token);
  } else if (mode === 'pull') {
    await pullUpdates(token);
  } else if (mode === 'push') {
    await pushUpdates(token);
  }
}

main().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
