# Autonomous Agent Guidelines & Budget Guardrails

## 1. Autonomous Task Lifecycle
When picking up issues from GitHub (`BowenMichael/f1-frontend`):
1. **Selection**: Look for issues labeled `agent:ready`.
2. **State Transition**:
   - Remove label `agent:ready`.
   - Add label `agent:in-progress`.
   - Post an initial comment acknowledging task start with the planned implementation steps.
3. **Branching**:
   - Create a git feature branch: `feat/issue-<number>-<short-description>`.
4. **Development & Verification**:
   - Implement features adhering strictly to Mantine UI v7, TypeScript, and OpenF1 guidelines.
   - Run typechecks and tests in the background (suppressing noisy logs to temporary files).
5. **Visual Media & PR**:
   - Launch dev server, record interactive UI video using `browser_subagent`, and capture screenshots.
   - Push branch and open a Pull Request using the repository PR template.
   - Tag label `agent:review` on the issue and link the PR.

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
