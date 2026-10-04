#!/usr/bin/env node
/**
 * One-Click Setup Script for Agent-Driven Development Repositories
 * Usage: node setup.js <owner/repo> <github-token> [--manager-url <url>] [--secret <secret>]
 */

const https = require('https');
const url = require('url');

const args = process.argv.slice(2);
let targetRepo = null;
let token = null;
let managerUrl = null;
let webhookSecret = null;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--manager-url' && args[i + 1]) {
    managerUrl = args[++i];
  } else if (args[i] === '--secret' && args[i + 1]) {
    webhookSecret = args[++i];
  } else if (!targetRepo) {
    targetRepo = args[i];
  } else if (!token) {
    token = args[i];
  }
}

if (!targetRepo || !token) {
  console.log('Usage: node setup.js <owner/repo> <github-token> [--manager-url <url>] [--secret <secret>]');
  console.log('Example: node setup.js myorg/my-new-app ghp_xxxxxxxxxxxx');
  console.log('Example with Agent Manager: node setup.js myorg/my-new-app ghp_xxx --manager-url http://localhost:8000/api/webhooks/github');
  process.exit(1);
}

const [owner, repo] = targetRepo.split('/');

function request(path, method, payload) {
  return new Promise((resolve, reject) => {
    const data = payload ? JSON.stringify(payload) : null;
    const req = https.request({
      hostname: 'api.github.com',
      path,
      method,
      headers: {
        'User-Agent': 'Agent-Template-Setup',
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {})
      }
    }, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: body ? JSON.parse(body) : null });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

const labels = [
  { name: 'agent:ready', color: '0e8a16', description: 'Queued for autonomous agent pick-up' },
  { name: 'agent:in-progress', color: 'fbca04', description: 'Agent actively implementing & testing' },
  { name: 'agent:needs-approval', color: 'd93f0b', description: 'Paused: High token usage or scope clarification needed' },
  { name: 'agent:review', color: '6f42c1', description: 'PR opened with video demo & screenshots' }
];

async function main() {
  console.log(`🚀 Initializing Agent-Driven Workflow for ${owner}/${repo}...`);

  // 1. Create Workflow Labels
  console.log('\n🏷️ Setting up GitHub workflow labels...');
  for (const label of labels) {
    const res = await request(`/repos/${owner}/${repo}/labels`, 'POST', label);
    if (res.status === 201) {
      console.log(`   ✅ Created label: ${label.name}`);
    } else if (res.status === 422) {
      console.log(`   ℹ️ Label already exists: ${label.name}`);
    } else {
      console.log(`   ⚠️ Label ${label.name}: ${res.status}`);
    }
  }

  // 2. Setup Agent Manager Webhook if URL provided
  if (managerUrl) {
    console.log(`\n🎛️ Registering GitHub Webhook with Agent Manager (${managerUrl})...`);
    const hookPayload = {
      name: 'web',
      active: true,
      events: ['issues', 'issue_comment', 'projects_v2_item'],
      config: {
        url: managerUrl,
        content_type: 'json',
        insecure_ssl: '0',
        ...(webhookSecret ? { secret: webhookSecret } : {})
      }
    };
    const hookRes = await request(`/repos/${owner}/${repo}/hooks`, 'POST', hookPayload);
    if (hookRes.status === 201) {
      console.log('   ✅ Webhook created successfully!');
    } else if (hookRes.status === 422) {
      console.log('   ℹ️ Webhook might already exist or URL is unreachable.');
    } else {
      console.log(`   ⚠️ Webhook registration response: ${hookRes.status}`);
    }
  }

  console.log('\n🎉 Repository setup complete!');
  console.log('Next steps:');
  console.log('1. Copy mcp_config.template.json to ~/.gemini/config/mcp_config.json');
  console.log('2. Review agent-manager.json and register your Project Board ID');
  console.log('3. Open http://localhost:8000 to monitor agents in Agent Manager');
}

main().catch(err => {
  console.error('❌ Error initializing repository:', err);
  process.exit(1);
});
