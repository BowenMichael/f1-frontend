# Autonomous Agent Guidelines & Budget Guardrails

## 1. Autonomous Task Lifecycle & Worktree Isolation

### A. Issue Takeover Notification
When picking up an issue from GitHub (`BowenMichael/f1-frontend`):
1. **Selection**: Look for issues labeled `agent:ready`.
2. **State Transition**:
   - Remove label `agent:ready`.
   - Add label `agent:in-progress`.
3. **Mandatory Issue Takeover Comment**:
   The agent **MUST immediately comment** on the GitHub issue to notify the team that work has begun:
   ```markdown
   🤖 **Agent Takeover: Development Started**

   - **Worktree**: `.worktrees/issue-<number>`
   - **Branch**: `feat/issue-<number>-<short-description>`
   - **Target Session / Endpoint**: [e.g. OpenF1 Drivers/Sessions]
   - **Planned Approach**:
     1. [Step 1: Interface / Schema definition]
     2. [Step 2: Component implementation]
     3. [Step 3: Verification & demo video recording]
   - **Budget Guardrail**: Max 15 tool execution turns before pause & approval.
   ```

### B. Git Worktree Isolation (Strictly Required)
To prevent interference with the user's active editor, other agent sessions, or local uncommitted changes:
1. **Never work in the root directory**: All feature development must occur in an isolated Git worktree.
2. **Worktree Creation**:
   ```bash
   git worktree add -b feat/issue-<number>-<short-description> .worktrees/issue-<number> master
   ```
3. **Execution**:
   - All file edits, typechecks, component creation, and commits must be scoped to `.worktrees/issue-<number>`.
4. **Completion & Cleanup**:
   - Push the branch from the worktree:
     ```bash
     git push origin feat/issue-<number>-<short-description>
     ```
   - Open the Pull Request linking to the issue with demo video and screenshots.
   - Clean up the worktree once the branch is pushed:
     ```bash
     git worktree remove .worktrees/issue-<number>
     ```
   - Tag the issue with `agent:review`.

---

## 2. 🛑 Token & Complexity Budget Guardrail (Mandatory Pause)

To ensure tasks remain cost-effective and prevent run-away context/token consumption, the agent must enforce the following guardrail:

### Thresholds
- **Turn Limit**: If a single task reaches **15 tool execution turns** without completing the implementation.
- **Context / Token Growth**: If the conversation encounters repetitive failure loops, unexpected circular dependencies, or major unplanned refactoring.

### Mandatory Pause Protocol
When a threshold is reached, the agent **MUST IMMEDIATELY PAUSE** execution on the issue and execute the following:

1. **Tag the Issue**:
   - Remove `agent:in-progress`.
   - Add `agent:needs-approval`.
2. **Post Insights Breakdown** (both as an Issue comment and to the user):
   ```markdown
   ⚠️ **Task Paused: Token / Complexity Budget Threshold Reached**
   
   ### 📊 Task Insights
   - **Progress Completed**: [Summary of files edited and components built]
   - **Remaining Work**: [Exact items needed to reach acceptance criteria]
   - **Cost / Complexity Driver**: [Explain why token consumption is high, e.g. breaking API changes, ambiguous requirement, circular imports]
   - **Proposed Next Action**: [Option A: Approve 10 more turns to finish; Option B: Narrow scope; Option C: Human intervention]
   ```
3. **Await User Approval**:
   - The agent MUST NOT take further code modification actions until the user explicitly responds with approval to proceed.
