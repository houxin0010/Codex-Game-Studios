# Codex Game Studios · Codex 游戏开发工作室

[English](README.md) | [简体中文](README.zh-CN.md)

面向 **Codex** 的游戏开发工作室模板：**50 个专业角色、77 个工作流技能**，
包含团队协作、引擎开发规范和 **微信小游戏适配**。基于
[Donchitos/Claude-Code-Game-Studios](https://github.com/Donchitos/Claude-Code-Game-Studios)
迁移，采用 MIT 许可，保留上游 Git 历史和作者署名。

仓库提供开发指令、模板、校验工具及独立示例，不包含游戏引擎，也不保证 AI 生成的
游戏可以直接上线。这是社区独立适配版本，不是 OpenAI、Anthropic 或腾讯官方产品。

## 包含什么

| 能力 | 内容 |
|---|---|
| 工作室角色 | 50 个原生 Codex TOML 角色：总监、负责人、策划、程序、美术音频、QA、运营、引擎及微信专家 |
| 开发流程 | 77 个可移植技能：入门、设计、架构、故事、评审、测试、发布与团队工作流 |
| 协作 | 领域边界、限定任务委派、冲突升级和明确的验证证据 |
| 流程强度 | minimal / standard / full 三档，支持项目配置与本地偏好 |
| 引擎 | 保留 Godot、Unity、Unreal 指南；增加微信原生、Cocos、LayaAir 和 Unity 导出路径 |
| 微信小游戏 | 搭建、审查、发布技能，平台专家，原生 Canvas 示例与 SDK mock 测试 |
| 校验 | TOML、技能元数据、目录覆盖、Markdown 链接、Shell 语法、JSON 和配置解析冒烟测试 |
| 文档 | 中英文 README、引擎/设计/生产模板、迁移说明 |

上游基线包含 **49 个角色、74 个技能**；本版本增加 1 个微信专家和 3 个平台技能。
完整列表见 [角色与技能目录](docs/CATALOG.md)、[迁移说明](docs/MIGRATION.md)
和 [版本记录](CHANGELOG.md)。

## 快速开始

需要：支持独立 TOML 自定义角色的当前本地 Codex（验证版本为 CLI 0.148.0）、Git、
Bash、**Python 3.11+**、**Node.js 18+**。游戏引擎需另行安装。微信开发还需要微信
开发者工具；真机预览与上传需要具备相应权限的已注册小游戏 AppID。

```bash
git clone https://github.com/houxin0010/Codex-Game-Studios.git my-game
cd my-game
python3 tools/validate_studio.py
python3 -m unittest discover -s tests/studio -v
node --test tests/wechat/*.test.js
codex
```

通过 Codex 正常控制审阅并信任项目，在仓库根目录启动后，输入 **`$start`**；
桌面应用也可以选择对应技能。项目配置是否加载受信任设置影响。
模板不会修改全局 Codex 配置或安装全局技能。

可以直接发送给 Codex：

```text
$start
$setup-engine godot
$setup-wechat native
$brainstorm 一个触控优先的解谜小游戏
$create-stories
$dev-story production/epics/<epic>/story-001.md
```

技能使用 `$名称`，不是 Claude 的斜杠命令。故事路径是占位示例，需要替换成实际
生成的文件。技能里的 Shell 命令是明确执行步骤，不会由运行时自动预执行。

## 微信小游戏

体验原生示例：

1. 在微信开发者工具导入 **`examples/wechat-minigame`**，项目类型选择 **小游戏**。
2. 将 `project.config.json` 中的 `touristappid` 换成自己的小游戏 AppID。
   游客模式仅为占位，可能不支持预览、上传或部分 SDK API；不要填写 AppSecret。
3. 运行并触摸移动圆点得分。分数本地保存；退后台暂停，回前台重置帧时钟，避免重复循环。
4. 用 `$setup-wechat native` 配置自己的游戏，`$wechat-audit` 审查平台约束，
   `$wechat-release` 准备实际发布证据。

示例采用原生 `wx.createCanvas`、触控事件、安全区与 DPR 缩放，固定竖屏。
它是小游戏，不是小程序、HTML 页面或浏览器 DOM 适配层；未包含联网、登录、
支付或后端服务。可选激励视频适配默认关闭，目前仅通过 wx Mock 验证，
详见[广告接入说明](docs/wechat/rewarded-video.md)。

**Cocos Creator / LayaAir / Unity** 需使用厂商或腾讯的小游戏导出适配器。
工作室负责引导版本核验、开发及验证，不提供引擎转换器。普通 Web 导出不能等同于
小游戏；Godot/Unreal 的微信适配需要单独证明。详见 [微信开发指南](docs/wechat/README.md)
和 [项目配置示例](docs/wechat/project.example.yaml)。

## 配置和协作

`project.yaml` 是共享配置，`project.local.yaml` 用于允许覆盖的个人偏好并被 Git 忽略。
模板默认不设置引擎或 modes 块，交给入门流程填写。`modes.rigor` 默认 minimal，
按档位展开流程要求，避免预写细分默认值导致强度设置失效。

```text
$settings
$settings modes.rigor=standard
$settings --local modes.review_mode=solo
```

排查配置时可以执行：

```bash
bash .codex/scripts/yaml-helper.sh resolve_config --keys workflow,review_mode,automation,team.size
```

默认最多并发 3 个子代理；角色继承用户当前模型、推理强度和客户端权限。
只有用户或调用的技能明确要求时才委派，50 个角色不表示同时运行 50 个代理。
不支持原生子代理的客户端可以按角色指令顺序执行，并说明未启动独立代理。
同一范围已经授权的编辑无需重复确认；授权不扩展到无关提交、上传或发布。

## 仓库结构

```text
AGENTS.md                      项目约定和明确的规则选择
.codex/config.toml             项目并发配置
.codex/agents/*.toml           原生 Codex 角色定义
.codex/docs/, .codex/rules/    按需读取的工作室参考与领域规范
.codex/scripts/                明确运行的配置/产物检查工具
.agents/skills/*/SKILL.md       技能和按需加载的详细参考
Studio Skill Testing Framework/ 行为评审目录和场景
docs/wechat/                   微信开发指南和配置示例
examples/wechat-minigame/      原生示例，开发者工具导入此目录
tests/wechat/                  示例 SDK mock 测试
tools/validate_studio.py        工作室结构校验
project.yaml                   共享游戏配置，初始未配置
```

游戏源码目录仍按引擎区分：Godot/微信原生 `src/`，Unity `Assets/`，Unreal
`Source/`，Cocos `assets/`，LayaAir `src/`。微信导出目录单独记录在
`platforms.wechat.game_root`，不要把生成产物当成源项目修改。

## 验证与限制

```bash
python3 tools/validate_studio.py
python3 -m unittest discover -s tests/studio -v
node --test tests/wechat/*.test.js
```

Mock 测试覆盖 DPR/安全区、触摸得分与存储、帧间隔限制、前后台切换、重复恢复、
旧 SDK 信息接口降级与监听清理。它们不能证明真实 SDK/设备行为、冷启动和性能、
后端登录、广告结算、包体上传或平台审核通过。上游行为场景是评审输入，不代表
已经执行过模型测试。发布前仍需实际运行游戏、保留截图日志，并在开发者工具及
iOS/Android 真机上验证；缺少必需证据时不能给出 READY。

Claude 专属的自动 hooks、状态栏、工具白名单、自动代理记忆和 `@path` 导入没有
作为 Codex 可运行能力保留；本版本使用明确读取和校验。详见
[运行时映射](.codex/docs/codex-runtime.md)。无需绕过权限或全局安装。

## 署名和许可

原项目 © 2026 Donchitos，[Claude Code Game Studios](https://github.com/Donchitos/Claude-Code-Game-Studios)。
Codex / 微信适配 © 2026 houxin0010。均采用 [MIT 许可](LICENSE)。
贡献指南：[CONTRIBUTING.md](CONTRIBUTING.md)。安全说明：[SECURITY.md](SECURITY.md)。

详细验证范围见 [验证记录](docs/VALIDATION.md)。
