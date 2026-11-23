# Duo CLI 多窗口工作流（最终版 v2：已修正路径与分支问题）

> 窗口 A：主任务（规划 + 审查，Opus）
> 窗口 B：模块开发（Sonnet），每个模块一个独立 worktree
> 窗口之间不直接通信，通过 **git 分支** 交接文件：窗口 A 用 `git show feature/Mxx:...` 读 handoff，窗口 B 用 `git show auto-dev:...` 读审查结论，不需要跨目录访问。

---

## 第一部分：目录配置与启动命令

### 1. 目录约定

```
D:\Work\
├── MyProj\                    # 主仓库（分支 auto-dev）→ 窗口 A
│   ├── AGENTS.md
│   └── docs\
│       ├── REQUIREMENTS.md    # 你写：项目目标、功能、约束
│       ├── PROJECT_CONTEXT.md # 窗口 A 生成
│       ├── PLAN.md            # 窗口 A 生成，状态只由窗口 A 修改
│       ├── modules\           # 窗口 A 生成任务卡
│       └── review\            # 窗口 A 写审查结论
└── MyProj_wt\
    └── M01\                   # M01 的 worktree（分支 feature/M01）→ 窗口 B
        └── docs\handoff\M01_handoff.md   # 窗口 B 写交接文档
```

> ⚠️ 仓库不要放在 OneDrive 同步目录（如 `OneDrive - TE Connectivity\Desktop\...`）。OneDrive 同步 `.git` 和 worktree 容易出现文件锁定和仓库损坏，而且路径带空格。建议放在 `D:\Work` 或 `C:\Work` 这类本地目录。

下面所有命令都在 **PowerShell** 中执行。先按实际情况修改这 4 个变量（每次新开 PowerShell 都要先执行一次）：

```powershell
$Proj   = "D:\Work\MyProj"          # 主仓库路径
$WtRoot = "D:\Work\MyProj_wt"       # worktree 根目录
$Opus   = "<Opus 模型 ID>"           # 在 Duo CLI 里用 /model 查看
$Sonnet = "<Sonnet 模型 ID>"
```

### 2. 初始化项目（只做一次）

```powershell
cd $Proj
# 已存在 auto-dev 就切换过去，不存在才新建（不要用 -B，重复执行会重置分支、丢失提交）
git show-ref --verify --quiet refs/heads/auto-dev
if ($LASTEXITCODE -eq 0) { git checkout auto-dev } else { git checkout -b auto-dev }
New-Item -ItemType Directory -Force docs\modules, docs\review, docs\handoff | Out-Null
if (-not (Test-Path docs\REQUIREMENTS.md)) { New-Item docs\REQUIREMENTS.md | Out-Null }

# 在 AGENTS.md 末尾追加多窗口规则
@"

## 多窗口模块化开发规则
- 项目上下文以 docs/ 下的文件为准，不依赖聊天记录。
- 每个会话只负责一个角色、一个模块。
- 开发窗口只修改任务卡允许的文件；需要改接口或其他模块时，先停下来询问。
- docs/PLAN.md 只能由主任务窗口修改。
- 开发完成并通过验收测试后，必须写 docs/handoff/Mxx_handoff.md，第一行写 RESULT: DONE 或 RESULT: BLOCKED。
- 审查结论第一行只能是 VERDICT: PASS 或 VERDICT: FAIL。
- 不要执行 git merge / push，这些由人负责。
- 不要访问当前工作目录以外的路径；其他分支的文件用 git show <分支>:<路径> 读取。
"@ | Add-Content AGENTS.md -Encoding utf8

# 忽略编译和测试产物，否则合并后 git worktree remove 会失败
@"
bin/
obj/
.vs/
__pycache__/
*.log
"@ | Add-Content .gitignore -Encoding utf8

git add -A; git commit -m "init multi-window workflow"
```

> `.gitignore` 规则按你的项目语言调整。

然后打开 `docs\REQUIREMENTS.md`，写入项目目标、主要功能和技术约束。

### 3. 启动窗口 A（主任务）

```powershell
wt -w 0 new-tab --title "A-Main" -d $Proj powershell -NoExit -Command "glab duo cli --model $Opus"
```

> 没有 Windows Terminal 时，使用：
> `Start-Process powershell -WorkingDirectory $Proj -ArgumentList "-NoExit","-Command","glab duo cli --model $Opus"`

在窗口 A 中贴入【提示词①规划】，规划完成后在**普通 PowerShell** 中提交：

```powershell
cd $Proj; git add -A; git commit -m "plan"
```

> 必须先提交规划，再创建 worktree，否则开发窗口看不到任务卡。

### 4. 为 M01 创建 worktree 并启动窗口 B

```powershell
$M = "M01"
cd $Proj
git status --short          # 应为空：auto-dev 上的修改必须先提交，worktree 只包含已提交的内容
git worktree add "$WtRoot\$M" -b "feature/$M" auto-dev
# 如果提示分支已存在（上次中断）：先执行 git worktree prune 和 git branch -D "feature/$M"，再重试
wt -w 0 new-tab --title "B-$M" -d "$WtRoot\$M" powershell -NoExit -Command "glab duo cli --model $Sonnet"
```

在窗口 B 中贴入【提示词②开发】。
如需并行开发无依赖的 M02，把 `$M` 改成 `"M02"` 再执行一次。
**有依赖的模块**必须等被依赖模块合并到 auto-dev 之后再创建 worktree，否则读不到前一个模块的代码和 handoff。

### 5. 审查

窗口 B 写完 handoff 并 **commit** 后（未提交的内容窗口 A 看不到），在窗口 A 中贴入【提示词③审查】。

审查完成后，**无论 PASS 还是 FAIL**，都先把审查结果提交到 auto-dev（窗口 B 要通过分支读取它）：

```powershell
$M = "M01"
cd $Proj
git add docs/review docs/PLAN.md; git commit -m "$M review"
```

- **FAIL**：在窗口 B 中输入【提示词②-追加：按审查意见修改】，修改并 commit 后回到窗口 A 再审查一次。
- **PASS**：执行下面的合并命令。

### 6. 合并与清理（PASS 后）

```powershell
$M = "M01"
cd $Proj
git merge --no-ff "feature/$M" -m "merge $M"
git worktree remove "$WtRoot\$M"      # 如仍有未跟踪文件导致失败，确认无用后加 --force
git branch -d "feature/$M"
```

先关闭窗口 B 再删除 worktree（Duo CLI 占用目录时会删除失败）。下一个模块从第 4 步开始。

### 7. 全部完成后合并到主分支

auto-dev 只是集成分支，所有模块合并完成后，人工检查并合并到主分支：

```powershell
cd $Proj
git diff main...auto-dev --stat       # 主分支名是 master 就替换
git checkout main
git merge --no-ff auto-dev -m "merge auto-dev"
```

---

## 第二部分：M01 最终版提示词

### 提示词① 规划（窗口 A，整个项目只用一次）

```
你是本项目的主任务（架构师 + 审查员）。本次只做规划，不写任何业务代码，也不运行测试。

先阅读 AGENTS.md 和 docs/REQUIREMENTS.md。

请完成：
1. 生成 docs/PROJECT_CONTEXT.md：项目目标、技术栈、目录结构、命名与编码约定、运行与测试方法。
2. 把项目拆成若干独立模块，按开发顺序编号 M01、M02…，生成 docs/PLAN.md，包含：
   - 模块表：编号、名称、目标、依赖模块、能否与其他模块并行
   - 模块间接口约定：函数签名 / 类定义 / 数据格式 / 文件格式，写到能直接照着实现的程度
   - 状态表：未开始 / 进行中 / 待审查 / 已合并（初始全部为“未开始”）
3. 为每个模块生成 docs/modules/Mxx_名称.md 任务卡，包含：
   - 目标
   - 范围：做什么、明确不做什么
   - 输入 / 输出与对外接口（必须与 PLAN.md 一致）
   - 允许修改或新增的文件清单
   - 验收标准：每条都可以通过运行命令或测试来验证，并写明验证方法
拆分原则：
   - 每个模块能在一个会话内完成
   - M01 优先做基础部分（项目骨架、公共数据结构、配置读取等），后续模块依赖它
   - 模块之间只通过约定的接口交互

流程：先在对话中列出模块拆分表（编号、名称、目标、依赖），等我确认后再写入文件。
完成后告诉我生成了哪些文件，不要执行 git commit。
```

### 提示词② 开发 M01（窗口 B）

```
你是模块 M01 的开发者，只负责 M01。目标是交付可运行、通过验收标准的代码。

开始前阅读：
- AGENTS.md
- docs/PROJECT_CONTEXT.md
- docs/PLAN.md（只看 M01 相关部分和接口约定）
- docs/modules/M01_*.md（任务卡）
- M01 依赖模块的 docs/handoff/*_handoff.md（如有）

工作规则：
1. 先用 5 条以内说明实现计划，等我回复“开始”后再写代码。
2. 写代码 → 运行 → 按任务卡的验收标准逐条测试 → 修复，直到全部通过。
3. 只修改任务卡中允许的文件；不修改其他模块的已有逻辑。
4. 发现接口约定无法实现或需要修改时，立即停下来告诉我，不要自行修改接口。
5. 不要修改 docs/PLAN.md。

完成后：
1. 写 docs/handoff/M01_handoff.md，格式如下（1 页以内，只写事实）：
   第一行：RESULT: DONE（全部通过）或 RESULT: BLOCKED（写明原因）
   ## 1. 完成内容
   ## 2. 修改/新增的文件（每个文件一句话说明）
   ## 3. 对外接口（与 PLAN.md 是否一致）
   ## 4. 验收标准逐条结果（通过 / 未通过 / 未测，附验证命令）
   ## 5. 偏离计划的地方及原因
   ## 6. 已知问题 / 风险 / TODO
   ## 7. 下一个模块需要知道的事
2. 执行 git add -A 和 git commit -m "M01: <一句话说明>"，不要 merge 或 push。
3. 回复我：RESULT、测试结果汇总、commit 哈希。
```

### 提示词②-追加：按审查意见修改（窗口 B，审查结果为 FAIL 时）

```
M01 审查未通过。请执行 git show auto-dev:docs/review/M01_review.md 读取审查结论，按其中的修改指令逐条修复。
规则不变：只改任务卡允许的文件，不改接口。
修复后重新按验收标准测试，更新 docs/handoff/M01_handoff.md（第 4、5、6 节），
然后 git commit -m "M01: fix review issues"，并逐条回复每个问题的处理结果。
```


### 提示词③ 审查 M01（窗口 A）

```
现在审查模块 M01。本次只做审查，不修改任何业务代码。

阅读：
- docs/PLAN.md（M01 部分和接口约定）
- docs/modules/M01_*.md（任务卡）
- 交接文档：执行 git show feature/M01:docs/handoff/M01_handoff.md
- 代码改动：执行 git diff auto-dev...feature/M01（只包含窗口 B 已 commit 的内容）

逐项检查：
1. 任务卡中的验收标准是否全部满足（根据代码和 handoff 中的测试证据判断；不要切换分支，也不要访问其他目录。证据不足时，在问题清单中列出需要我在 M01 窗口运行的验证命令）
2. 是否修改了任务卡允许范围以外的文件，或其他模块的逻辑
3. 对外接口是否与 PLAN.md 约定一致，是否会影响后续模块
4. handoff 内容是否与实际代码一致
5. 明显的代码问题：异常处理、硬编码、遗留的调试代码

输出 docs/review/M01_review.md：
   第一行：VERDICT: PASS 或 VERDICT: FAIL
   ## 问题清单（按严重程度排序：严重 / 一般 / 建议；只有“严重”和“一般”导致 FAIL）
   ## 修改指令（FAIL 时写，要求具体到文件和修改内容，可以直接交给开发者执行）
如果 PASS：把 docs/PLAN.md 中 M01 的状态改为“已合并”。
不要执行 git commit 或 merge。最后在对话中回复结论和问题数量。
```

> 后续模块：把提示词②③中的 `M01` 全部替换成 `M02` 等即可。
