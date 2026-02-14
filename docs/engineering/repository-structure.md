# Repository Structure Index

## Governance
- Read this file before investigating any area of the repository.
- Update this file whenever files, folders, exported symbols, or ownership boundaries change.
- When a class is no longer referenced, mark it as `OBSOLETE` in the obsolete tracker before deleting/refactoring it.
- Scope: tracked repository files excluding `.git/`, `node_modules/`, `dist/`, `temp/`, `.claude/`, `.gsd/`, `.kilocode/`.

## Canonical Shared Packages
- `packages/shared-api/src`: cross-runtime endpoint and contract definitions used by portal + worker.
- `packages/shared-utils/src`: runtime-safe helpers (`etag`, `pagination`, `response`) used across apps.

## Full File Tree Index
```text
Guild_Management/
|- .env.development [search: env, development] [functions/classes: n/a] - Repository file artifact
|- .gitignore [search: gitignore] [functions/classes: n/a] - Repository file artifact
|- .kilocodemodes [search: kilocodemodes] [functions/classes: n/a] - Repository file artifact
|- .mcp.json [search: mcp] [functions/classes: n/a] - Structured configuration/data file
|- .npmrc [search: npmrc] [functions/classes: n/a] - Repository file artifact
|- apps/
|  |- portal/
|  |  |- index.html [search: html] [functions/classes: n/a] - Repository file artifact
|  |  |- package.json [search: package] [functions/classes: n/a] - Structured configuration/data file
|  |  |- public/
|  |  |  |- vite.svg [search: vite, svg] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |  `- 燕云十六声图标/
|  |  |     |- 其他加成.webp [search: 燕云十六声图标, 其他加成, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |     |- 奇术图标/
|  |  |     |  |- 百鬼打穴手.webp [search: 燕云十六声图标, 奇术图标, 百鬼打穴手, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |     |  |- 狗嘴夺食.webp [search: 燕云十六声图标, 奇术图标, 狗嘴夺食, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |     |  |- 红尘障目.webp [search: 燕云十六声图标, 奇术图标, 红尘障目, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |     |  |- 金蟾腾跃.webp [search: 燕云十六声图标, 奇术图标, 金蟾腾跃, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |     |  |- 流行坠火.webp [search: 燕云十六声图标, 奇术图标, 流行坠火, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |     |  |- 骑龙回马.webp [search: 燕云十六声图标, 奇术图标, 骑龙回马, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |     |  |- 清风霁月.webp [search: 燕云十六声图标, 奇术图标, 清风霁月, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |     |  |- 神龙吐火.webp [search: 燕云十六声图标, 奇术图标, 神龙吐火, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |     |  |- 狮吼正声.webp [search: 燕云十六声图标, 奇术图标, 狮吼正声, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |     |  |- 太白醉月.webp [search: 燕云十六声图标, 奇术图标, 太白醉月, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |     |  |- 万物为锋.webp [search: 燕云十六声图标, 奇术图标, 万物为锋, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |     |  |- 韦陀正法.webp [search: 燕云十六声图标, 奇术图标, 韦陀正法, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |     |  |- 无相金身.webp [search: 燕云十六声图标, 奇术图标, 无相金身, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |     |  |- 萧吟千浪.webp [search: 燕云十六声图标, 奇术图标, 萧吟千浪, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |     |  |- 衍九矢.webp [search: 燕云十六声图标, 奇术图标, 衍九矢, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |     |  |- 杳无形.webp [search: 燕云十六声图标, 奇术图标, 杳无形, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |     |  |- 药叉破魔.webp [search: 燕云十六声图标, 奇术图标, 药叉破魔, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |     |  |- 叶龙骧首.webp [search: 燕云十六声图标, 奇术图标, 叶龙骧首, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |     |  |- 以鹅之鸣.webp [search: 燕云十六声图标, 奇术图标, 以鹅之鸣, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |     |  |- 阴阳迷踪步.webp [search: 燕云十六声图标, 奇术图标, 阴阳迷踪步, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |     |  |- 鹰爪连凿.webp [search: 燕云十六声图标, 奇术图标, 鹰爪连凿, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |     |  |- 荧光晖夜.webp [search: 燕云十六声图标, 奇术图标, 荧光晖夜, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |     |  `- 自在无碍.webp [search: 燕云十六声图标, 奇术图标, 自在无碍, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |     |- 武学图标/
|  |  |     |  |- 八方风雷枪.webp [search: 燕云十六声图标, 武学图标, 八方风雷枪, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |     |  |- 积矩九剑.webp [search: 燕云十六声图标, 武学图标, 积矩九剑, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |     |  |- 嗟夫刀法.webp [search: 燕云十六声图标, 武学图标, 嗟夫刀法, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |     |  |- 九曲惊神枪.webp [search: 燕云十六声图标, 武学图标, 九曲惊神枪, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |     |  |- 九重春色.webp [search: 燕云十六声图标, 武学图标, 九重春色, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |     |  |- 明川药典.webp [search: 燕云十六声图标, 武学图标, 明川药典, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |     |  |- 泥犁三垢.webp [search: 燕云十六声图标, 武学图标, 泥犁三垢, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |     |  |- 千机素天.webp [search: 燕云十六声图标, 武学图标, 千机素天, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |     |  |- 千香引魂蛊.webp [search: 燕云十六声图标, 武学图标, 千香引魂蛊, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |     |  |- 青山执笔.webp [search: 燕云十六声图标, 武学图标, 青山执笔, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |     |  |- 十方破阵.webp [search: 燕云十六声图标, 武学图标, 十方破阵, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |     |  |- 粟子行云.webp [search: 燕云十六声图标, 武学图标, 粟子行云, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |     |  |- 粟子游尘.webp [search: 燕云十六声图标, 武学图标, 粟子游尘, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |     |  |- 天志垂象.webp [search: 燕云十六声图标, 武学图标, 天志垂象, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |     |  |- 无名剑法.webp [search: 燕云十六声图标, 武学图标, 无名剑法, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |     |  |- 无名枪法.webp [search: 燕云十六声图标, 武学图标, 无名枪法, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |     |  |- 斩雪刀法.webp [search: 燕云十六声图标, 武学图标, 斩雪刀法, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |     |  `- 醉梦游春.webp [search: 燕云十六声图标, 武学图标, 醉梦游春, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |     `- 心法图标/
|  |  |        |- 沧浪剑诀.webp [search: 燕云十六声图标, 心法图标, 沧浪剑诀, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |        |- 穿喉诀.webp [search: 燕云十六声图标, 心法图标, 穿喉诀, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |        |- 春雷篇.webp [search: 燕云十六声图标, 心法图标, 春雷篇, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |        |- 大唐歌.webp [search: 燕云十六声图标, 心法图标, 大唐歌, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |        |- 丹心篆.webp [search: 燕云十六声图标, 心法图标, 丹心篆, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |        |- 灯儿亮.webp [search: 燕云十六声图标, 心法图标, 灯儿亮, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |        |- 断石之构.webp [search: 燕云十六声图标, 心法图标, 断石之构, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |        |- 扶摇直上.webp [search: 燕云十六声图标, 心法图标, 扶摇直上, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |        |- 孤忠不辞.webp [search: 燕云十六声图标, 心法图标, 孤忠不辞, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |        |- 归燕经.webp [search: 燕云十六声图标, 心法图标, 归燕经, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |        |- 葫芦飞飞.webp [search: 燕云十六声图标, 心法图标, 葫芦飞飞, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |        |- 花上月令.webp [search: 燕云十六声图标, 心法图标, 花上月令, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |        |- 极乐泣血.webp [search: 燕云十六声图标, 心法图标, 极乐泣血, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |        |- 剑气纵横.webp [search: 燕云十六声图标, 心法图标, 剑气纵横, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |        |- 君臣药.webp [search: 燕云十六声图标, 心法图标, 君臣药, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |        |- 抗造大法.webp [search: 燕云十六声图标, 心法图标, 抗造大法, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |        |- 困兽心经.webp [search: 燕云十六声图标, 心法图标, 困兽心经, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |        |- 燎原踏.webp [search: 燕云十六声图标, 心法图标, 燎原踏, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |        |- 燎原星火.webp [search: 燕云十六声图标, 心法图标, 燎原星火, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |        |- 明晦同尘.webp [search: 燕云十六声图标, 心法图标, 明晦同尘, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |        |- 凝神章.webp [search: 燕云十六声图标, 心法图标, 凝神章, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |        |- 怒斩马.webp [search: 燕云十六声图标, 心法图标, 怒斩马, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |        |- 磐石诀.webp [search: 燕云十六声图标, 心法图标, 磐石诀, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |        |- 婆娑影.webp [search: 燕云十六声图标, 心法图标, 婆娑影, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |        |- 千山法.webp [search: 燕云十六声图标, 心法图标, 千山法, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |        |- 千丝蛊.webp [search: 燕云十六声图标, 心法图标, 千丝蛊, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |        |- 千营一呼.webp [search: 燕云十六声图标, 心法图标, 千营一呼, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |        |- 擒天势.webp [search: 燕云十六声图标, 心法图标, 擒天势, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |        |- 三穷致知.webp [search: 燕云十六声图标, 心法图标, 三穷致知, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |        |- 沙摆尾.webp [search: 燕云十六声图标, 心法图标, 沙摆尾, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |        |- 山河绝韵.webp [search: 燕云十六声图标, 心法图标, 山河绝韵, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |        |- 山月无影.webp [search: 燕云十六声图标, 心法图标, 山月无影, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |        |- 生龙活虎.webp [search: 燕云十六声图标, 心法图标, 生龙活虎, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |        |- 绳舟行木.webp [search: 燕云十六声图标, 心法图标, 绳舟行木, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |        |- 霜天白夜.webp [search: 燕云十六声图标, 心法图标, 霜天白夜, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |        |- 四时无常.webp [search: 燕云十六声图标, 心法图标, 四时无常, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |        |- 所恨年年.webp [search: 燕云十六声图标, 心法图标, 所恨年年, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |        |- 天行健.webp [search: 燕云十六声图标, 心法图标, 天行健, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |        |- 铁身诀.webp [search: 燕云十六声图标, 心法图标, 铁身诀, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |        |- 晚雪间.webp [search: 燕云十六声图标, 心法图标, 晚雪间, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |        |- 忘川绝响.webp [search: 燕云十六声图标, 心法图标, 忘川绝响, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |        |- 威猛歌.webp [search: 燕云十六声图标, 心法图标, 威猛歌, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |        |- 无名心法.webp [search: 燕云十六声图标, 心法图标, 无名心法, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |        |- 心弥泥鱼.webp [search: 燕云十六声图标, 心法图标, 心弥泥鱼, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |        |- 杏花不见.webp [search: 燕云十六声图标, 心法图标, 杏花不见, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |        |- 移经易武.webp [search: 燕云十六声图标, 心法图标, 移经易武, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |        |- 易水歌.webp [search: 燕云十六声图标, 心法图标, 易水歌, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |        |- 长生无相.webp [search: 燕云十六声图标, 心法图标, 长生无相, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |        |- 征人归.webp [search: 燕云十六声图标, 心法图标, 征人归, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |        |- 指玄篇注.webp [search: 燕云十六声图标, 心法图标, 指玄篇注, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |        |- 逐狼心经.webp [search: 燕云十六声图标, 心法图标, 逐狼心经, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |        `- 纵地摘星.webp [search: 燕云十六声图标, 心法图标, 纵地摘星, webp] [functions/classes: n/a] - Portal static asset (icon/media)
|  |  |- src/
|  |  |  |- App.css [search: n/a] [functions/classes: n/a] - Repository file artifact
|  |  |  |- App.tsx [search: n/a] [functions/classes: n/a] - Repository file artifact
|  |  |  |- assets/
|  |  |  |  `- react.svg [search: assets, react, svg] [functions/classes: n/a] - Repository file artifact
|  |  |  |- components/
|  |  |  |  |- advanced/
|  |  |  |  |  |- ContextMenu.tsx [search: components, advanced, contextmenu] [functions/classes: 
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuItem as ContextMenuCheckboxItem,
  ContextMenuItem as ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuGroup as ContextMenuRadioGroup
] - Reusable portal UI component
|  |  |  |  |  |- DropdownMenu.tsx [search: components, advanced, dropdownmenu] [functions/classes: 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuShortcut
] - Reusable portal UI component
|  |  |  |  |  |- index.ts [search: components, advanced] [functions/classes:  ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuCheckboxItem, ContextMenuRadioItem, ContextMenuLabel, ContextMenuSeparator, ContextMenuShortcut, ContextMenuGroup, ContextMenuPortal, ContextMenuRadioGroup ,  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuGroup, DropdownMenuPortal ,  MediaReorder ,  MediaUpload ,  ResizablePanelGroup, ResizablePanel, ResizableHandle ] - Reusable portal UI component
|  |  |  |  |  |- MediaReorder.tsx [search: components, advanced, mediareorder] [functions/classes: MediaReorder] - Reusable portal UI component
|  |  |  |  |  |- MediaUpload.tsx [search: components, advanced, mediaupload] [functions/classes: MediaUpload] - Reusable portal UI component
|  |  |  |  |  `- Resizable.tsx [search: components, advanced, resizable] [functions/classes:  ResizablePanelGroup, ResizablePanel, ResizableHandle ] - Reusable portal UI component
|  |  |  |  |- button/
|  |  |  |  |  |- Button.tsx [search: components, button] [functions/classes:  Button, buttonVariants ] - Reusable portal UI component
|  |  |  |  |  |- EnhancedButton.tsx [search: components, button, enhancedbutton] [functions/classes: n/a] - Reusable portal UI component
|  |  |  |  |  `- index.ts [search: components, button] [functions/classes: n/a] - Reusable portal UI component
|  |  |  |  |- controls/
|  |  |  |  |  |- index.ts [search: components, controls] [functions/classes:  SegmentedControl ,  SortArrows ,  ThemedIconButton ] - Reusable portal UI component
|  |  |  |  |  |- SegmentedControl.tsx [search: components, controls, segmentedcontrol] [functions/classes: SegmentedControl] - Reusable portal UI component
|  |  |  |  |  |- SortArrows.tsx [search: components, controls, sortarrows] [functions/classes: n/a] - Reusable portal UI component
|  |  |  |  |  |- ThemedIconButton.tsx [search: components, controls, themediconbutton] [functions/classes: n/a] - Reusable portal UI component
|  |  |  |  |  |- ThemedPanelBox.tsx [search: components, controls, themedpanelbox] [functions/classes: ThemedPanelBox] - Reusable portal UI component
|  |  |  |  |  |- ThemedSortButtonGroup.tsx [search: components, controls, themedsortbuttongroup] [functions/classes: ThemedSortButtonGroup] - Reusable portal UI component
|  |  |  |  |  `- ThemedTabControl.tsx [search: components, controls, themedtabcontrol] [functions/classes: ThemedTabControl] - Reusable portal UI component
|  |  |  |  |- data-display/
|  |  |  |  |  |- Avatar.tsx [search: components, data, display, avatar] [functions/classes:  Avatar, AvatarImage, AvatarFallback ] - Reusable portal UI component
|  |  |  |  |  |- Badge.tsx [search: components, data, display, badge] [functions/classes:  Badge, badgeVariants ] - Reusable portal UI component
|  |  |  |  |  |- DecorativeGlyph.tsx [search: components, data, display, decorativeglyph] [functions/classes: n/a] - Reusable portal UI component
|  |  |  |  |  |- HealthStatus.tsx [search: components, data, display, healthstatus] [functions/classes: HealthStatus] - Reusable portal UI component
|  |  |  |  |  |- index.ts [search: components, data, display] [functions/classes: n/a] - Reusable portal UI component
|  |  |  |  |  |- MarkdownContent.tsx [search: components, data, display, markdowncontent] [functions/classes: MarkdownContent] - Reusable portal UI component
|  |  |  |  |  |- MarkdownRenderer.tsx [search: components, data, display, markdownrenderer] [functions/classes: MarkdownRenderer] - Reusable portal UI component
|  |  |  |  |  |- MetricCard.tsx [search: components, data, display, metriccard] [functions/classes: n/a] - Reusable portal UI component
|  |  |  |  |  |- Separator.tsx [search: components, data, display, separator] [functions/classes:  Separator ] - Reusable portal UI component
|  |  |  |  |  |- StatusBadge.tsx [search: components, data, display, statusbadge] [functions/classes: n/a] - Reusable portal UI component
|  |  |  |  |  |- Table.tsx [search: components, data, display, table] [functions/classes: 
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
] - Reusable portal UI component
|  |  |  |  |  `- TeamMemberCard.tsx [search: components, data, display, teammembercard] [functions/classes: TeamMemberCard] - Reusable portal UI component
|  |  |  |  |- feedback/
|  |  |  |  |  |- Accordion.tsx [search: components, feedback, accordion] [functions/classes:  Accordion, AccordionItem, AccordionTrigger, AccordionContent ] - Reusable portal UI component
|  |  |  |  |  |- Alert.tsx [search: components, feedback, alert] [functions/classes:  Alert, AlertTitle, AlertDescription ] - Reusable portal UI component
|  |  |  |  |  |- AlertDialog.tsx [search: components, feedback, alertdialog] [functions/classes: 
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
] - Reusable portal UI component
|  |  |  |  |  |- Collapsible.tsx [search: components, feedback, collapsible] [functions/classes:  Collapsible, CollapsibleTrigger, CollapsibleContent ] - Reusable portal UI component
|  |  |  |  |  |- Dialog.tsx [search: components, feedback, dialog] [functions/classes: 
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
] - Reusable portal UI component
|  |  |  |  |  |- EmptyState.tsx [search: components, feedback, emptystate] [functions/classes: EmptyState] - Reusable portal UI component
|  |  |  |  |  |- ErrorBoundary.tsx [search: components, feedback, errorboundary] [functions/classes: ErrorBoundary] - Reusable portal UI component
|  |  |  |  |  |- ErrorState.tsx [search: components, feedback, errorstate] [functions/classes: ErrorState] - Reusable portal UI component
|  |  |  |  |  |- HoverCard.tsx [search: components, feedback, hovercard] [functions/classes:  HoverCard, HoverCardTrigger, HoverCardContent ] - Reusable portal UI component
|  |  |  |  |  |- index.ts [search: components, feedback] [functions/classes: n/a] - Reusable portal UI component
|  |  |  |  |  |- OfflineBanner.tsx [search: components, feedback, offlinebanner] [functions/classes: OfflineBanner] - Reusable portal UI component
|  |  |  |  |  |- Popover.tsx [search: components, feedback, popover] [functions/classes:  Popover, PopoverTrigger, PopoverContent, PopoverAnchor ] - Reusable portal UI component
|  |  |  |  |  |- Progress.tsx [search: components, feedback, progress] [functions/classes:  Progress ] - Reusable portal UI component
|  |  |  |  |  |- Skeleton.tsx [search: components, feedback, skeleton] [functions/classes:  Skeleton , CardGridSkeleton, CardSkeleton, PageHeaderSkeleton, TableSkeleton] - Reusable portal UI component
|  |  |  |  |  |- Toast.tsx [search: components, feedback, toast] [functions/classes: n/a] - Reusable portal UI component
|  |  |  |  |  |- ToastContainer.tsx [search: components, feedback, toastcontainer] [functions/classes: n/a] - Reusable portal UI component
|  |  |  |  |  `- Tooltip.tsx [search: components, feedback, tooltip] [functions/classes:  NexusTooltip, NexusTooltip as Tooltip, TooltipTrigger, TooltipContent, TooltipProvider , NexusTooltip, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger] - Reusable portal UI component
|  |  |  |  |- index.ts [search: components] [functions/classes: n/a] - Reusable portal UI component
|  |  |  |  |- input/
|  |  |  |  |  |- Calendar.tsx [search: components, input, calendar] [functions/classes:  Calendar ] - Reusable portal UI component
|  |  |  |  |  |- Checkbox.tsx [search: components, input, checkbox] [functions/classes:  Checkbox ] - Reusable portal UI component
|  |  |  |  |  |- Command.tsx [search: components, input, command] [functions/classes: 
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
] - Reusable portal UI component
|  |  |  |  |  |- FilterBar.tsx [search: components, input, filterbar] [functions/classes: n/a] - Reusable portal UI component
|  |  |  |  |  |- Form.tsx [search: components, input, form] [functions/classes: 
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
] - Reusable portal UI component
|  |  |  |  |  |- index.ts [search: components, input] [functions/classes: n/a] - Reusable portal UI component
|  |  |  |  |  |- Input.tsx [search: components, input] [functions/classes:  Input ] - Reusable portal UI component
|  |  |  |  |  |- Label.tsx [search: components, input, label] [functions/classes:  Label ] - Reusable portal UI component
|  |  |  |  |  |- RadioGroup.tsx [search: components, input, radiogroup] [functions/classes:  RadioGroup, RadioGroupItem ] - Reusable portal UI component
|  |  |  |  |  |- Select.tsx [search: components, input, select] [functions/classes:  Select, SelectItem ] - Reusable portal UI component
|  |  |  |  |  |- Slider.tsx [search: components, input, slider] [functions/classes:  Slider ] - Reusable portal UI component
|  |  |  |  |  |- Switch.tsx [search: components, input, switch] [functions/classes:  Switch ] - Reusable portal UI component
|  |  |  |  |  |- Textarea.tsx [search: components, input, textarea] [functions/classes:  Textarea ] - Reusable portal UI component
|  |  |  |  |  |- TiptapEditor.tsx [search: components, input, tiptapeditor] [functions/classes: TiptapEditor] - Reusable portal UI component
|  |  |  |  |  |- Toggle.tsx [search: components, input, toggle] [functions/classes:  Toggle, toggleVariants ] - Reusable portal UI component
|  |  |  |  |  |- ToggleGroup.tsx [search: components, input, togglegroup] [functions/classes:  ToggleGroup, ToggleGroupItem ] - Reusable portal UI component
|  |  |  |  |  `- UnifiedField.tsx [search: components, input, unifiedfield] [functions/classes: n/a] - Reusable portal UI component
|  |  |  |  |- layout/
|  |  |  |  |  |- BottomSheetDialog.tsx [search: components, layout, bottomsheetdialog] [functions/classes: n/a] - Reusable portal UI component
|  |  |  |  |  |- Card.tsx [search: components, layout, card] [functions/classes: 
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
] - Reusable portal UI component
|  |  |  |  |  |- DecorativeBackground.tsx [search: components, layout, decorativebackground] [functions/classes: DecorativeBackground] - Reusable portal UI component
|  |  |  |  |  |- Drawer.tsx [search: components, layout, drawer] [functions/classes: 
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
] - Reusable portal UI component
|  |  |  |  |  |- index.ts [search: components, layout] [functions/classes: n/a] - Reusable portal UI component
|  |  |  |  |  |- PageFilterBar.tsx [search: components, layout, pagefilterbar] [functions/classes: PageFilterBar] - Reusable portal UI component
|  |  |  |  |  |- PlaceholderPage.tsx [search: components, layout, placeholderpage] [functions/classes: PlaceholderPage] - Reusable portal UI component
|  |  |  |  |  |- ScrollArea.tsx [search: components, layout, scrollarea] [functions/classes:  ScrollArea, ScrollBar ] - Reusable portal UI component
|  |  |  |  |  |- Sidebar.tsx [search: components, layout, sidebar] [functions/classes: 
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
] - Reusable portal UI component
|  |  |  |  |  `- ThemeAmbientEffects.tsx [search: components, layout, themeambienteffects] [functions/classes: ThemeAmbientEffects] - Reusable portal UI component
|  |  |  |  |- navigation/
|  |  |  |  |  |- BottomNavigation.tsx [search: components, navigation, bottomnavigation] [functions/classes: BottomNavigation] - Reusable portal UI component
|  |  |  |  |  |- Breadcrumb.tsx [search: components, navigation, breadcrumb] [functions/classes: 
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
] - Reusable portal UI component
|  |  |  |  |  |- index.ts [search: components, navigation] [functions/classes: n/a] - Reusable portal UI component
|  |  |  |  |  `- Tabs.tsx [search: components, navigation, tabs] [functions/classes:  Tabs, TabsList, TabsTrigger, TabsContent ] - Reusable portal UI component
|  |  |  |  `- system/
|  |  |  |     |- AllControls.tsx [search: components, system, allcontrols] [functions/classes: AdvancedShowcase, DateTimeShowcase, DisclosureShowcase, DragGestureShowcase, FileMediaShowcase, FormFlowShowcase] - Reusable portal UI component
|  |  |  |     |- Buttons.tsx [search: components, system, buttons] [functions/classes: ButtonsShowcase] - Reusable portal UI component
|  |  |  |     |- Cards.tsx [search: components, system, cards] [functions/classes: CardsShowcase] - Reusable portal UI component
|  |  |  |     |- ChoiceControls.tsx [search: components, system, choicecontrols] [functions/classes: ChoiceControlsShowcase] - Reusable portal UI component
|  |  |  |     |- DropdownSelect.tsx [search: components, system, dropdownselect] [functions/classes: DropdownSelectShowcase] - Reusable portal UI component
|  |  |  |     |- Feedback.tsx [search: components, system, feedback] [functions/classes: FeedbackShowcase] - Reusable portal UI component
|  |  |  |     |- index.ts [search: components, system] [functions/classes:  AccessibilityShowcase, SearchFilterShowcase ,  ButtonsShowcase ,  CardsShowcase ,  ChoiceControlsShowcase ,  DropdownSelectShowcase ,  FeedbackShowcase ] - Reusable portal UI component
|  |  |  |     |- MoreControls.tsx [search: components, system, morecontrols] [functions/classes: AccessibilityShowcase, SearchFilterShowcase] - Reusable portal UI component
|  |  |  |     |- Navigation.tsx [search: components, system, navigation] [functions/classes: NavigationShowcase] - Reusable portal UI component
|  |  |  |     |- RangeControls.tsx [search: components, system, rangecontrols] [functions/classes: RangeControlsShowcase] - Reusable portal UI component
|  |  |  |     `- TextInput.tsx [search: components, system, textinput] [functions/classes: TextInputShowcase] - Reusable portal UI component
|  |  |  |- features/
|  |  |  |  |- Admin/
|  |  |  |  |  |- components/
|  |  |  |  |  |  `- AuditLogs.tsx [search: features, admin, components, auditlogs] [functions/classes: AuditLogs] - Portal feature module implementation
|  |  |  |  |  |- hooks/
|  |  |  |  |  |  `- useAdmin.ts [search: features, admin, hooks, useadmin] [functions/classes: useAuditLogs, useD1Health, useEndpointHealth, useHealthStatus, useR2Health] - Portal feature module implementation
|  |  |  |  |  `- index.tsx [search: features, admin] [functions/classes: Admin, AdminProtected] - Portal feature module implementation
|  |  |  |  |- Announcements/
|  |  |  |  |  `- index.tsx [search: features, announcements] [functions/classes: Announcements] - Portal feature module implementation
|  |  |  |  |- Auth/
|  |  |  |  |  |- components/
|  |  |  |  |  |  |- ProtectedRoute.tsx [search: features, auth, components, protectedroute] [functions/classes: ProtectedRoute] - Portal feature module implementation
|  |  |  |  |  |  |- SessionExpiredModal.tsx [search: features, auth, components, sessionexpiredmodal] [functions/classes: SessionExpiredModal] - Portal feature module implementation
|  |  |  |  |  |  `- SessionInitializer.tsx [search: features, auth, components, sessioninitializer] [functions/classes: SessionInitializer] - Portal feature module implementation
|  |  |  |  |  |- hooks/
|  |  |  |  |  |  `- useAuth.ts [search: features, auth, hooks, useauth] [functions/classes: useAuth] - Portal feature module implementation
|  |  |  |  |  `- Login.tsx [search: features, auth, login] [functions/classes: Login] - Portal feature module implementation
|  |  |  |  |- Dashboard/
|  |  |  |  |  |- components/
|  |  |  |  |  |  |- Notifications.tsx [search: features, dashboard, components, notifications] [functions/classes: n/a] - Portal feature module implementation
|  |  |  |  |  |  |- RecentWars.tsx [search: features, dashboard, components, recentwars] [functions/classes: n/a] - Portal feature module implementation
|  |  |  |  |  |  |- Timeline.tsx [search: features, dashboard, components, timeline] [functions/classes: n/a] - Portal feature module implementation
|  |  |  |  |  |  `- UpcomingEvents.tsx [search: features, dashboard, components, upcomingevents] [functions/classes: n/a] - Portal feature module implementation
|  |  |  |  |  `- index.tsx [search: features, dashboard] [functions/classes: applyNotificationSeen, Dashboard, getDashboardRecentEvents, getLatestCompletedWar, getRecentCompletedWars] - Portal feature module implementation
|  |  |  |  |- Events/
|  |  |  |  |  |- Events.filtering.ts [search: features, events, filtering] [functions/classes: filterEventsByCategory] - Portal feature module implementation
|  |  |  |  |  |- Events.participants.ts [search: features, events, participants] [functions/classes: DEFAULT_VISIBLE_PARTICIPANTS, getVisibleParticipants] - Portal feature module implementation
|  |  |  |  |  `- index.tsx [search: features, events] [functions/classes: Events, getEventFilterCategories, getEventTypeFallbackTone, getEventTypeLabel, isArchivedEventFilter] - Portal feature module implementation
|  |  |  |  |- Gallery/
|  |  |  |  |  `- index.tsx [search: features, gallery] [functions/classes: Gallery] - Portal feature module implementation
|  |  |  |  |- GuildWar/
|  |  |  |  |  |- components/
|  |  |  |  |  |  |- WarAnalytics/
|  |  |  |  |  |  |  |- AnalyticsContext.tsx [search: features, guildwar, components, waranalytics, analyticscontext] [functions/classes: AnalyticsProvider, useAnalytics, useCurrentModeState, useHasSelection, useSelectionLimits] - Portal feature module implementation
|  |  |  |  |  |  |  |- CompareSelector.tsx [search: features, guildwar, components, waranalytics, compareselector] [functions/classes: CompareSelector] - Portal feature module implementation
|  |  |  |  |  |  |  |- CompareTrendChart.tsx [search: features, guildwar, components, waranalytics, comparetrendchart] [functions/classes:  CompareTooltip , CompareTrendChart] - Portal feature module implementation
|  |  |  |  |  |  |  |- FilterBar.tsx [search: features, guildwar, components, waranalytics, filterbar] [functions/classes: DateRangeSelector, FilterBar, WarMultiSelector] - Portal feature module implementation
|  |  |  |  |  |  |  |- index.ts [search: features, guildwar, components, waranalytics] [functions/classes:  AnalyticsProvider, useAnalytics, useSelectionLimits, useCurrentModeState, useHasSelection ,  ChartLoadingSkeleton, TableLoadingSkeleton, CardLoadingSkeleton, ListLoadingSkeleton, FullPageLoading ,  CompareSelector ,  CompareTrendChart, CompareTooltip ,  FilterBar, DateRangeSelector, WarMultiSelector ,  MetricFormulaEditor ] - Portal feature module implementation
|  |  |  |  |  |  |  |- LoadingStates.tsx [search: features, guildwar, components, waranalytics, loadingstates] [functions/classes: CardLoadingSkeleton, ChartLoadingSkeleton, ErrorPanel, FullPageLoading, ListLoadingSkeleton, LoadingPanel] - Portal feature module implementation
|  |  |  |  |  |  |  |- MetricFormulaEditor.tsx [search: features, guildwar, components, waranalytics, metricformulaeditor] [functions/classes: MetricFormulaEditor] - Portal feature module implementation
|  |  |  |  |  |  |  |- MetricsPanel.tsx [search: features, guildwar, components, waranalytics, metricspanel] [functions/classes: MetricsPanel] - Portal feature module implementation
|  |  |  |  |  |  |  |- ModeStrip.tsx [search: features, guildwar, components, waranalytics, modestrip] [functions/classes: ModeDescription, ModeStrip] - Portal feature module implementation
|  |  |  |  |  |  |  |- NormalizationDiagnosticsPanel.tsx [search: features, guildwar, components, waranalytics, normalizationdiagnosticspanel] [functions/classes: NormalizationDiagnosticsPanel] - Portal feature module implementation
|  |  |  |  |  |  |  |- PlayerTimelineChart.tsx [search: features, guildwar, components, waranalytics, playertimelinechart] [functions/classes:  CustomTooltip , PlayerTimelineChart] - Portal feature module implementation
|  |  |  |  |  |  |  |- RankingsBarChart.tsx [search: features, guildwar, components, waranalytics, rankingsbarchart] [functions/classes:  RankingsTooltip , RankingsBarChart] - Portal feature module implementation
|  |  |  |  |  |  |  |- RankingsFilters.tsx [search: features, guildwar, components, waranalytics, rankingsfilters] [functions/classes: RankingsFilters] - Portal feature module implementation
|  |  |  |  |  |  |  |- ShareButton.tsx [search: features, guildwar, components, waranalytics, sharebutton] [functions/classes: ShareButton] - Portal feature module implementation
|  |  |  |  |  |  |  |- SubjectSelector.tsx [search: features, guildwar, components, waranalytics, subjectselector] [functions/classes: SubjectSelector] - Portal feature module implementation
|  |  |  |  |  |  |  |- TableFallback.tsx [search: features, guildwar, components, waranalytics, tablefallback] [functions/classes: createCompareColumns, createRankingsColumns, createTimelineColumns, TableFallback] - Portal feature module implementation
|  |  |  |  |  |  |  |- TeamSelector.tsx [search: features, guildwar, components, waranalytics, teamselector] [functions/classes: TeamSelector] - Portal feature module implementation
|  |  |  |  |  |  |  |- TeamTrendChart.tsx [search: features, guildwar, components, waranalytics, teamtrendchart] [functions/classes: TeamTrendChart] - Portal feature module implementation
|  |  |  |  |  |  |  |- types.ts [search: features, guildwar, components, waranalytics, types] [functions/classes: calculateKDA, COLOR_PALETTE, formatCompactNumber, formatKDA, formatMetricName, formatNumber] - Portal feature module implementation
|  |  |  |  |  |  |  |- utils.ts [search: features, guildwar, components, waranalytics, utils] [functions/classes:  formatNumber, formatCompactNumber, formatMetricName, METRICS , calculateMedian, calculateMovingAverage, calculateStdDev, calculateTrend, calculateVariance] - Portal feature module implementation
|  |  |  |  |  |  |  |- WarAnalyticsMain.tsx [search: features, guildwar, components, waranalytics, waranalyticsmain] [functions/classes: WarAnalyticsMain] - Portal feature module implementation
|  |  |  |  |  |  |  `- WarDetailSidePanel.tsx [search: features, guildwar, components, waranalytics, wardetailsidepanel] [functions/classes: WarDetailSidePanel] - Portal feature module implementation
|  |  |  |  |  |  |- WarHistory.tsx [search: features, guildwar, components, warhistory] [functions/classes: WarHistory] - Portal feature module implementation
|  |  |  |  |  |  |- WarHistory.utils.ts [search: features, guildwar, components, warhistory, utils] [functions/classes: buildWarCardMetrics, formatKdaRatio, sumMemberField] - Portal feature module implementation
|  |  |  |  |  |  |- WarHistoryChart.tsx [search: features, guildwar, components, warhistorychart] [functions/classes: WarHistoryChart] - Portal feature module implementation
|  |  |  |  |  |  |- WarHistoryDetail.tsx [search: features, guildwar, components, warhistorydetail] [functions/classes: WarHistoryDetail] - Portal feature module implementation
|  |  |  |  |  |  |- WarHistoryPieCharts.tsx [search: features, guildwar, components, warhistorypiecharts] [functions/classes: WAR_HISTORY_PIE_COLORS, WarHistoryPieCharts] - Portal feature module implementation
|  |  |  |  |  |  `- WarTeamDragDrop.tsx [search: features, guildwar, components, warteamdragdrop] [functions/classes: WarTeamDragDrop] - Portal feature module implementation
|  |  |  |  |  |- GuildWar.sorting.ts [search: features, guildwar, sorting] [functions/classes: nextGuildWarSortState, sortGuildWarMembers] - Portal feature module implementation
|  |  |  |  |  |- hooks/
|  |  |  |  |  |  `- useWars.ts [search: features, guildwar, hooks, usewars] [functions/classes: useActiveWars, useAnalyticsData, useCreateWarAnalyticsFormulaPreset, useCreateWarHistory, useCreateWarTeam, useDeleteWarAnalyticsFormulaPreset] - Portal feature module implementation
|  |  |  |  |  `- index.tsx [search: features, guildwar] [functions/classes: GuildWar] - Portal feature module implementation
|  |  |  |  |- Members/
|  |  |  |  |  |- components/
|  |  |  |  |  |  `- RosterFilterPanel.tsx [search: features, members, components, rosterfilterpanel] [functions/classes: RosterFilterPanel] - Portal feature module implementation
|  |  |  |  |  `- index.tsx [search: features, members] [functions/classes: resolveRosterHoverAudioUrl, Roster] - Portal feature module implementation
|  |  |  |  |- Profile/
|  |  |  |  |  `- index.tsx [search: features, profile] [functions/classes: Profile] - Portal feature module implementation
|  |  |  |  |- Settings/
|  |  |  |  |  `- index.tsx [search: features, settings] [functions/classes: Settings] - Portal feature module implementation
|  |  |  |  |- Tools/
|  |  |  |  |  |- components/
|  |  |  |  |  |  |- NexusControlStudio.tsx [search: features, tools, components, nexuscontrolstudio] [functions/classes: NexusControlStudio] - Portal feature module implementation
|  |  |  |  |  |  `- StyleBuilder.tsx [search: features, tools, components, stylebuilder] [functions/classes: StyleBuilder] - Portal feature module implementation
|  |  |  |  |  `- index.tsx [search: features, tools] [functions/classes: Tools] - Portal feature module implementation
|  |  |  |  `- Wiki/
|  |  |  |     `- index.tsx [search: features, wiki] [functions/classes: Wiki] - Portal feature module implementation
|  |  |  |- hooks/
|  |  |  |  |- index.ts [search: hooks] [functions/classes:  useAuth ,  useFilteredList ,  useLocaleDate ,  useMobileOptimizations ,  useOnline ,  usePush ] - Portal shared React hook
|  |  |  |  |- useFilteredList.ts [search: hooks, usefilteredlist] [functions/classes: useFilteredList] - Portal shared React hook
|  |  |  |  |- useFilterPresets.ts [search: hooks, usefilterpresets] [functions/classes: useFilterPresets] - Portal shared React hook
|  |  |  |  |- useLastSeen.ts [search: hooks, uselastseen] [functions/classes: useLastSeen] - Portal shared React hook
|  |  |  |  |- useLocaleDate.ts [search: hooks, uselocaledate] [functions/classes: useLocaleDate] - Portal shared React hook
|  |  |  |  |- use-media-query.ts [search: hooks, use, media, query] [functions/classes: useMediaQuery] - Portal shared React hook
|  |  |  |  |- useMobileOptimizations.ts [search: hooks, usemobileoptimizations] [functions/classes: useMobileOptimizations] - Portal shared React hook
|  |  |  |  |- useOnline.ts [search: hooks, useonline] [functions/classes: useOnline] - Portal shared React hook
|  |  |  |  |- usePush.ts [search: hooks, usepush] [functions/classes: usePush] - Portal shared React hook
|  |  |  |  |- useServerState.ts [search: hooks, useserverstate] [functions/classes: computePollingInterval, useAnnouncement, useAnnouncements, useArchiveAnnouncement, useArchiveEvent, useAuditLogs] - Portal shared React hook
|  |  |  |  `- useWebSocket.ts [search: hooks, usewebsocket] [functions/classes: useWebSocket] - Portal shared React hook
|  |  |  |- i18n/
|  |  |  |  |- config.ts [search: i18n] [functions/classes: dateFormats, getDateFormat] - Repository file artifact
|  |  |  |  |- json.d.ts [search: i18n] [functions/classes: n/a] - Repository file artifact
|  |  |  |  `- locales/
|  |  |  |     |- en.json [search: i18n, locales, en] [functions/classes: n/a] - Structured configuration/data file
|  |  |  |     `- zh.json [search: i18n, locales, zh] [functions/classes: n/a] - Structured configuration/data file
|  |  |  |- index.css [search: n/a] [functions/classes: n/a] - Repository file artifact
|  |  |  |- layouts/
|  |  |  |  |- AppShell.tsx [search: layouts, appshell] [functions/classes: AppShell] - Repository file artifact
|  |  |  |  `- index.ts [search: layouts] [functions/classes: n/a] - Repository file artifact
|  |  |  |- lib/
|  |  |  |  |- api/
|  |  |  |  |  |- admin.ts [search: lib, api, admin] [functions/classes: adminAPI] - Portal API client adapter
|  |  |  |  |  |- announcements.ts [search: lib, api, announcements] [functions/classes: announcementsAPI, mapToDomain] - Portal API client adapter
|  |  |  |  |  |- api-builder.ts [search: lib, api, builder] [functions/classes:  ENDPOINTS, buildPath , typedAPI] - Portal API client adapter
|  |  |  |  |  |- auth.ts [search: lib, api, auth] [functions/classes: authAPI] - Portal API client adapter
|  |  |  |  |  |- date.ts [search: lib, api, date] [functions/classes: normalizeUtcDateTime] - Portal API client adapter
|  |  |  |  |  |- events.ts [search: lib, api, events] [functions/classes: eventsAPI, mapToDomain] - Portal API client adapter
|  |  |  |  |  |- gallery.ts [search: lib, api, gallery] [functions/classes: galleryAPI] - Portal API client adapter
|  |  |  |  |  |- index.ts [search: lib, api] [functions/classes:  adminAPI ,  announcementsAPI ,  authAPI ,  eventsAPI ,  mediaAPI ,  membersAPI ] - Portal API client adapter
|  |  |  |  |  |- media.ts [search: lib, api, media] [functions/classes: mediaAPI] - Portal API client adapter
|  |  |  |  |  |- members.ts [search: lib, api, members] [functions/classes: mapToDomain, membersAPI] - Portal API client adapter
|  |  |  |  |  |- poll.ts [search: lib, api, poll] [functions/classes: pollAPI] - Portal API client adapter
|  |  |  |  |  |- themePreferences.ts [search: lib, api, themepreferences] [functions/classes: themePreferencesAPI] - Portal API client adapter
|  |  |  |  |  `- wars.ts [search: lib, api, wars] [functions/classes: mapHistoryToDomain, warsAPI] - Portal API client adapter
|  |  |  |  |- api-client.ts [search: lib, api, client] [functions/classes: api, apiDirect, APIError] - Portal shared library utility
|  |  |  |  |- media-conversion.ts [search: lib, media, conversion] [functions/classes: ALLOWED_VIDEO_HOSTS, convertToOpus, convertToWebP, getAvatarInitial, getOptimizedMediaUrl, getYouTubeId] - Portal shared library utility
|  |  |  |  |- permissions.ts [search: lib, permissions] [functions/classes: canAccessAdminArea, canArchiveAnnouncement, canArchiveEvent, canCopyEventSignup, canCopyGuildWarAnalytics, canCreateAnnouncement] - Portal shared library utility
|  |  |  |  |- progression.ts [search: lib, progression] [functions/classes: clampLevel, flattenCategoryItems, getCategoryById] - Portal shared library utility
|  |  |  |  |- queryClient.ts [search: lib, queryclient] [functions/classes: queryClient] - Portal shared library utility
|  |  |  |  |- queryKeys.ts [search: lib, querykeys] [functions/classes: queryKeys] - Portal shared library utility
|  |  |  |  |- storage.ts [search: lib, storage] [functions/classes: storage, STORAGE_KEYS] - Portal shared library utility
|  |  |  |  |- toast.ts [search: lib, toast] [functions/classes: toast, useToastStore] - Portal shared library utility
|  |  |  |  |- types/
|  |  |  |  |  `- api.ts [search: lib, types, api] [functions/classes: n/a] - Portal shared library utility
|  |  |  |  |- undoStore.ts [search: lib, undostore] [functions/classes: useUndoStore] - Portal shared library utility
|  |  |  |  `- utils.ts [search: lib, utils] [functions/classes: buildMemberAccentGradient, cn, formatClassDisplayName, formatDate, formatDateTime, formatLongDate] - Portal shared library utility
|  |  |  |- main.tsx [search: main] [functions/classes: n/a] - Repository file artifact
|  |  |  |- routes/
|  |  |  |  |- __root.tsx [search: routes, root] [functions/classes: Route] - TanStack route definition
|  |  |  |  |- _layout/
|  |  |  |  |  |- admin.tsx [search: routes, layout, admin] [functions/classes: Route] - TanStack route definition
|  |  |  |  |  |- announcements.tsx [search: routes, layout, announcements] [functions/classes: Route] - TanStack route definition
|  |  |  |  |  |- events.tsx [search: routes, layout, events] [functions/classes: Route] - TanStack route definition
|  |  |  |  |  |- gallery.tsx [search: routes, layout, gallery] [functions/classes: Route] - TanStack route definition
|  |  |  |  |  |- guild-war.tsx [search: routes, layout, guild, war] [functions/classes: Route] - TanStack route definition
|  |  |  |  |  |- index.tsx [search: routes, layout] [functions/classes: Route] - TanStack route definition
|  |  |  |  |  |- profile.tsx [search: routes, layout, profile] [functions/classes: Route] - TanStack route definition
|  |  |  |  |  |- roster.tsx [search: routes, layout, roster] [functions/classes: Route] - TanStack route definition
|  |  |  |  |  |- settings.tsx [search: routes, layout, settings] [functions/classes: Route] - TanStack route definition
|  |  |  |  |  |- tools/
|  |  |  |  |  |  |- index.tsx [search: routes, layout, tools] [functions/classes: Route] - TanStack route definition
|  |  |  |  |  |  `- war-analytics.tsx [search: routes, layout, tools, war, analytics] [functions/classes: Route] - TanStack route definition
|  |  |  |  |  |- tools.tsx [search: routes, layout, tools] [functions/classes: Route] - TanStack route definition
|  |  |  |  |  `- wiki.tsx [search: routes, layout, wiki] [functions/classes: Route] - TanStack route definition
|  |  |  |  |- _layout.tsx [search: routes, layout] [functions/classes: Route] - TanStack route definition
|  |  |  |  `- login.tsx [search: routes, login] [functions/classes: Route] - TanStack route definition
|  |  |  |- routeTree.gen.ts [search: routetree, gen] [functions/classes: routeTree] - Repository file artifact
|  |  |  |- store.ts [search: store] [functions/classes: useAuthStore, useUIStore] - Repository file artifact
|  |  |  |- theme/
|  |  |  |  |- accessibility-enhancements.css [search: theme, accessibility, enhancements] [functions/classes: n/a] - Theme runtime, tokens, or presets
|  |  |  |  |- colors/
|  |  |  |  |  |- color-tokens.css [search: theme, colors, color, tokens] [functions/classes: n/a] - Theme runtime, tokens, or presets
|  |  |  |  |  |- index.ts [search: theme, colors] [functions/classes: 
  THEME_COLOR_PRESET_LIST,
  THEME_COLOR_PRESETS,
  goldAmberColor,
  chineseInkColor,
  tealNeonColor,
  crimsonGoldColor,
  softRoseColor,
  violetCyanColor,
  GAME_CLASS_COLORS,
, getThemeColorPalette, getThemeColorTokens, isThemeColor, THEME_COLOR_IDS] - Theme runtime, tokens, or presets
|  |  |  |  |  `- types.ts [search: theme, colors, types] [functions/classes: n/a] - Theme runtime, tokens, or presets
|  |  |  |  |- effects.css [search: theme, effects] [functions/classes: n/a] - Theme runtime, tokens, or presets
|  |  |  |  |- fontsource.d.ts [search: theme, fontsource] [functions/classes: n/a] - Theme runtime, tokens, or presets
|  |  |  |  |- fx/
|  |  |  |  |  |- postFxGates.ts [search: theme, fx, postfxgates] [functions/classes: isEffectAllowedAtQuality, resolveThemePostFxStack] - Theme runtime, tokens, or presets
|  |  |  |  |  |- rafThrottle.ts [search: theme, fx, rafthrottle] [functions/classes: rafThrottle] - Theme runtime, tokens, or presets
|  |  |  |  |  `- ThemeFXLayer.tsx [search: theme, fx, themefxlayer] [functions/classes: ThemeFXLayer] - Theme runtime, tokens, or presets
|  |  |  |  |- index.ts [search: theme] [functions/classes:  ThemeControllerProvider as ThemeController , 
  initTheme,
  initThemePreferences,
  setTheme,
  setThemeColor,
  setThemePreferences,
  getTheme,
  getThemeColor,
  getThemePreferences,
  onThemeChange,
  type ColorBlindMode,
  type ThemePreferences,
, 
  ThemeControllerProvider,
  useThemeController,
  ThemeSection,
  ColorSection,
  ThemeColorPicker,
] - Theme runtime, tokens, or presets
|  |  |  |  |- layout.css [search: theme, layout] [functions/classes: n/a] - Theme runtime, tokens, or presets
|  |  |  |  |- presets/
|  |  |  |  |  |- _component-tokens.css [search: theme, presets, component, tokens] [functions/classes: n/a] - Theme runtime, tokens, or presets
|  |  |  |  |  |- _context-aware-theming.css [search: theme, presets, context, aware, theming] [functions/classes: n/a] - Theme runtime, tokens, or presets
|  |  |  |  |  |- _control-animations.css [search: theme, presets, control, animations] [functions/classes: n/a] - Theme runtime, tokens, or presets
|  |  |  |  |  |- _global-improvements.css [search: theme, presets, global, improvements] [functions/classes: n/a] - Theme runtime, tokens, or presets
|  |  |  |  |  |- _interactions-base.css [search: theme, presets, interactions, base] [functions/classes: n/a] - Theme runtime, tokens, or presets
|  |  |  |  |  |- _member-card-colors.css [search: theme, presets, member, card, colors] [functions/classes: n/a] - Theme runtime, tokens, or presets
|  |  |  |  |  |- _performance-optimizations.css [search: theme, presets, performance, optimizations] [functions/classes: n/a] - Theme runtime, tokens, or presets
|  |  |  |  |  |- _shape-unification.css [search: theme, presets, shape, unification] [functions/classes: n/a] - Theme runtime, tokens, or presets
|  |  |  |  |  |- _theme-customization.css [search: theme, presets, customization] [functions/classes: n/a] - Theme runtime, tokens, or presets
|  |  |  |  |  |- _theme-enhancements.css [search: theme, presets, enhancements] [functions/classes: n/a] - Theme runtime, tokens, or presets
|  |  |  |  |  |- _theme-transitions.css [search: theme, presets, transitions] [functions/classes: n/a] - Theme runtime, tokens, or presets
|  |  |  |  |  |- chibi.css [search: theme, presets, chibi] [functions/classes: n/a] - Theme runtime, tokens, or presets
|  |  |  |  |  |- cyberpunk.css [search: theme, presets, cyberpunk] [functions/classes: n/a] - Theme runtime, tokens, or presets
|  |  |  |  |  |- index.css [search: theme, presets] [functions/classes: n/a] - Theme runtime, tokens, or presets
|  |  |  |  |  |- index.ts [search: theme, presets] [functions/classes:  THEME_VISUAL_SPEC_LIST , getThemeOptions, getThemeVisualSpec, isThemeMode, THEME_IDS, THEME_PRESET_LIST] - Theme runtime, tokens, or presets
|  |  |  |  |  |- minimalistic.css [search: theme, presets, minimalistic] [functions/classes: n/a] - Theme runtime, tokens, or presets
|  |  |  |  |  |- neo-brutalism.css [search: theme, presets, neo, brutalism] [functions/classes: n/a] - Theme runtime, tokens, or presets
|  |  |  |  |  |- post-apocalyptic.css [search: theme, presets, post, apocalyptic] [functions/classes: n/a] - Theme runtime, tokens, or presets
|  |  |  |  |  |- royal.css [search: theme, presets, royal] [functions/classes: n/a] - Theme runtime, tokens, or presets
|  |  |  |  |  `- steampunk.css [search: theme, presets, steampunk] [functions/classes: n/a] - Theme runtime, tokens, or presets
|  |  |  |  |- rollout.ts [search: theme, rollout] [functions/classes: clearRuntimeRolloutOverrides, readThemeRolloutConfig, resolveThemeRolloutRuntime, setRuntimeBaselineFxOnly, setRuntimeEnabledThemes, setRuntimeMaxFxQuality] - Theme runtime, tokens, or presets
|  |  |  |  |- rolloutMonitoring.ts [search: theme, rolloutmonitoring] [functions/classes: evaluateThemeRolloutMonitoring] - Theme runtime, tokens, or presets
|  |  |  |  |- runtimeContracts.ts [search: theme, runtimecontracts] [functions/classes: FX_QUALITY_LABELS, getDefaultThemeRuntimeConfig, resolveThemeRuntimeConfig] - Theme runtime, tokens, or presets
|  |  |  |  |- theme.css [search: theme] [functions/classes: n/a] - Theme runtime, tokens, or presets
|  |  |  |  |- ThemeController.tsx [search: theme, themecontroller] [functions/classes: ColorSection, getTheme, getThemeColor, getThemeModeIcon, getThemePreferences, initTheme] - Theme runtime, tokens, or presets
|  |  |  |  |- tokens.ts [search: theme, tokens] [functions/classes: GAME_CLASS_COLORS] - Theme runtime, tokens, or presets
|  |  |  |  |- types/
|  |  |  |  |  |- types.ts [search: theme, types] [functions/classes: n/a] - Theme runtime, tokens, or presets
|  |  |  |  |  `- typography.ts [search: theme, types, typography] [functions/classes: typography] - Theme runtime, tokens, or presets
|  |  |  |  `- useMotionTokens.ts [search: theme, usemotiontokens] [functions/classes: useMotionTokens] - Theme runtime, tokens, or presets
|  |  |  `- types.ts [search: types] [functions/classes: n/a] - Repository file artifact
|  |  |- tests/
|  |  |  |- components/
|  |  |  |  |- app-imports.test.ts [search: components, imports] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |- BottomNavigation.account-menu.test.tsx [search: components, bottomnavigation, account, menu] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |- Button.disabled-visibility.test.tsx [search: components, button, disabled, visibility] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |- chibi-control-signatures.phase4.test.tsx [search: components, chibi, control, signatures, phase4] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |- cyberpunk-control-signatures.phase4.test.tsx [search: components, cyberpunk, control, signatures, phase4] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |- DecorativeBackground.test.tsx [search: components, decorativebackground] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |- Dialog.close-button.test.tsx [search: components, dialog, close, button] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |- layout/
|  |  |  |  |  |- __snapshots__/
|  |  |  |  |  |  `- ThemeAmbientEffects.visual-regression.phase5.test.tsx.snap [search: components, layout, snapshots, themeambienteffects, visual, regression] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |  |- PageFilterBar.category-selected-style.test.tsx [search: components, layout, pagefilterbar, category, selected, style] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |  |- ThemeAmbientCanvas.phase2-runtime.test.ts [search: components, layout, themeambientcanvas, phase2, runtime] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |  |- ThemeAmbientEffects.canvas-mapping.test.tsx [search: components, layout, themeambienteffects, canvas, mapping] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |  |- ThemeAmbientEffects.chibi-toy-box.test.tsx [search: components, layout, themeambienteffects, chibi, toy, box] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |  |- ThemeAmbientEffects.cyberpunk-deepnet.test.tsx [search: components, layout, themeambienteffects, cyberpunk, deepnet] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |  |- ThemeAmbientEffects.interaction.test.tsx [search: components, layout, themeambienteffects, interaction] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |  |- ThemeAmbientEffects.minimalistic-gallery.test.tsx [search: components, layout, themeambienteffects, minimalistic, gallery] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |  |- ThemeAmbientEffects.neo-graphic-print.test.tsx [search: components, layout, themeambienteffects, neo, graphic, print] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |  |- ThemeAmbientEffects.post-apocalyptic-wasteland.test.tsx [search: components, layout, themeambienteffects, post, apocalyptic, wasteland] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |  |- ThemeAmbientEffects.premium-scenes.test.tsx [search: components, layout, themeambienteffects, premium, scenes] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |  |- ThemeAmbientEffects.reduced-profiles.phase4.test.tsx [search: components, layout, themeambienteffects, reduced, profiles, phase4] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |  |- ThemeAmbientEffects.royal-atelier.test.tsx [search: components, layout, themeambienteffects, royal, atelier] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |  |- ThemeAmbientEffects.steampunk-foundry.test.tsx [search: components, layout, themeambienteffects, steampunk, foundry] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |  |- ThemeAmbientEffects.visual-regression.phase5.test.tsx [search: components, layout, themeambienteffects, visual, regression, phase5] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |  |- ThemeAmbientPerformance.phase5.test.ts [search: components, layout, themeambientperformance, phase5] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |  `- ThemeBackgroundRenderer.r3f.test.tsx [search: components, layout, themebackgroundrenderer, r3f] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |- Layout.theme-menu.test.tsx [search: components, layout, theme, menu] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |- legacy-component-paths.test.ts [search: components, legacy, component, paths] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |- MarkdownContent.test.tsx [search: components, markdowncontent] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |- minimalistic-control-signatures.phase4.test.tsx [search: components, minimalistic, control, signatures, phase4] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |- neo-control-signatures.phase4.test.tsx [search: components, neo, control, signatures, phase4] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |- NexusControlAudit.test.ts [search: components, nexuscontrolaudit] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |- NexusControlStudio.header-layout.test.tsx [search: components, nexuscontrolstudio, header, layout] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |- NexusControlStudio.scope-vars.test.tsx [search: components, nexuscontrolstudio, scope, vars] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |- NexusControlStudio.theme-isolation.test.tsx [search: components, nexuscontrolstudio, theme, isolation] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |- nexus-primitives-imports.test.ts [search: components, nexus, primitives, imports] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |- overlay-content-classname.test.tsx [search: components, overlay, content, classname] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |- post-apocalyptic-control-signatures.phase4.test.tsx [search: components, post, apocalyptic, control, signatures, phase4] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |- royal-control-signatures.phase4.test.tsx [search: components, royal, control, signatures, phase4] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |- steampunk-control-signatures.phase4.test.tsx [search: components, steampunk, control, signatures, phase4] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  `- TiptapEditor.image-upload.test.tsx [search: components, tiptapeditor, image, upload] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |- features/
|  |  |  |  |- Announcements/
|  |  |  |  |  `- Announcements.controls.test.tsx [search: features, announcements, controls] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |- Dashboard/
|  |  |  |  |  |- Dashboard.notifications.test.tsx [search: features, dashboard, notifications] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |  |- Dashboard.timeline.smoke.test.tsx [search: features, dashboard, timeline, smoke] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |  `- UpcomingEvents.participantCard.test.tsx [search: features, dashboard, upcomingevents, participantcard] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |- Events/
|  |  |  |  |  |- Events.card-type.test.ts [search: features, events, card, type] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |  |- Events.create-edit-controls.test.tsx [search: features, events, create, edit, controls] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |  |- Events.filtering.test.ts [search: features, events, filtering] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |  |- Events.filters.test.tsx [search: features, events, filters] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |  |- Events.participant-card-layout.test.tsx [search: features, events, participant, card, layout] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |  |- Events.participant-permissions.test.tsx [search: features, events, participant, permissions] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |  `- Events.participants.test.ts [search: features, events, participants] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |- Gallery/
|  |  |  |  |  `- Gallery.filters.test.tsx [search: features, gallery, filters] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |- GuildWar/
|  |  |  |  |  |- components/
|  |  |  |  |  |  `- WarHistory.utils.test.ts [search: features, guildwar, components, warhistory, utils] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |  |- GuildWar.permissions.test.tsx [search: features, guildwar, permissions] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |  |- GuildWar.sort-controls-size.test.ts [search: features, guildwar, sort, controls, size] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |  |- GuildWar.sorting.test.ts [search: features, guildwar, sorting] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |  |- WarAnalytics.chart-colors.test.ts [search: features, guildwar, waranalytics, chart, colors] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |  |- WarAnalytics.detail-panel.test.tsx [search: features, guildwar, waranalytics, detail, panel] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |  |- WarAnalytics.diagnostics.test.tsx [search: features, guildwar, waranalytics, diagnostics] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |  |- WarAnalytics.filter-header.test.tsx [search: features, guildwar, waranalytics, filter, header] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |  |- WarAnalytics.filters.test.tsx [search: features, guildwar, waranalytics, filters] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |  |- WarAnalytics.formula-editor.test.tsx [search: features, guildwar, waranalytics, formula, editor] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |  |- WarAnalytics.localization.test.tsx [search: features, guildwar, waranalytics, localization] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |  |- WarAnalytics.main.test.tsx [search: features, guildwar, waranalytics, main] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |  |- WarAnalytics.teams-mode.test.tsx [search: features, guildwar, waranalytics, teams, mode] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |  |- WarAnalytics.utils.localization.test.ts [search: features, guildwar, waranalytics, utils, localization] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |  |- WarHistory.detail-modal.test.tsx [search: features, guildwar, warhistory, detail, modal] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |  `- WarHistory.pie-colors.test.ts [search: features, guildwar, warhistory, pie, colors] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |- Members/
|  |  |  |  |  |- Roster.audio.test.ts [search: features, members, roster, audio] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |  |- Roster.audio-controls.test.tsx [search: features, members, roster, audio, controls] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |  |- Roster.hook-order.test.tsx [search: features, members, roster, hook, order] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |  |- Roster.member-detail-panel.test.tsx [search: features, members, roster, member, detail, panel] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |  `- Roster.modal.test.tsx [search: features, members, roster, modal] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  `- Settings/
|  |  |  |     |- Settings.localization.test.tsx [search: features, settings, localization] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |     `- Settings.motion-slider.test.tsx [search: features, settings, motion, slider] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |- hooks/
|  |  |  |  `- useServerState.polling.test.ts [search: hooks, useserverstate, polling] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |- i18n/
|  |  |  |  |- guild-war-analytics-zh-keys.test.ts [search: i18n, guild, war, analytics, zh, keys] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |- nav-wording.test.ts [search: i18n, nav, wording] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |- portal-surface-localization.test.ts [search: i18n, surface, localization] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |- zh-localization-quality.test.ts [search: i18n, zh, localization, quality] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  `- zh-structure.test.ts [search: i18n, zh, structure] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |- lib/
|  |  |  |  |- api/
|  |  |  |  |  |- members.test.ts [search: lib, api, members] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |  |- wars.test.ts [search: lib, api, wars] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |  `- wars.update-member-stats.test.ts [search: lib, api, wars, update, member, stats] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |- permissions.test.ts [search: lib, permissions] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  `- utils.member-card-colors.test.ts [search: lib, utils, member, card, colors] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |- setupTests.ts [search: setuptests] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |- theme/
|  |  |  |  |- accessibility-enhancements.selectors.test.ts [search: theme, accessibility, enhancements, selectors] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |- member-card-theme-colors.spec.ts [search: theme, member, card, colors, spec] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |- theme-background-effects.contract.test.ts [search: theme, background, effects, contract] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |- theme-background-effects-disabled.contract.test.ts [search: theme, background, effects, disabled, contract] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |- theme-background-mode.canvas-policy.test.ts [search: theme, background, mode, canvas, policy] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |- theme-chibi-control-geometry.test.ts [search: theme, chibi, control, geometry] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |- theme-chibi-toy-box.phase4.test.ts [search: theme, chibi, toy, box, phase4] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |- theme-controller.remote-preferences.test.tsx [search: theme, controller, remote, preferences] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |- theme-controller.state.test.tsx [search: theme, controller, state] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |- theme-cyberpunk-deepnet.phase4.test.ts [search: theme, cyberpunk, deepnet, phase4] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |- theme-engine.preferences.test.ts [search: theme, engine, preferences] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |- theme-fancy-fx-suppression.phase5.test.ts [search: theme, fancy, fx, suppression, phase5] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |- ThemeFXLayer.cyberpunk-events.phase4.test.tsx [search: theme, themefxlayer, cyberpunk, events, phase4] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |- ThemeFXLayer.phase2-gates.test.tsx [search: theme, themefxlayer, phase2, gates] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |- ThemeFXLayer.phase6-rollout.test.tsx [search: theme, themefxlayer, phase6, rollout] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |- ThemeFXLayer.test.tsx [search: theme, themefxlayer] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |- theme-fx-quality-gating.phase5.test.ts [search: theme, fx, quality, gating, phase5] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |- theme-minimalistic-gallery.phase4.test.ts [search: theme, minimalistic, gallery, phase4] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |- theme-motion-contract.test.ts [search: theme, motion, contract] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |- theme-motion-mode-resolution.phase5.test.tsx [search: theme, motion, mode, resolution, phase5] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |- theme-neo-brutalism-hover.test.ts [search: theme, neo, brutalism, hover] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |- theme-neo-graphic-print.phase4.test.ts [search: theme, neo, graphic, print, phase4] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |- theme-post-apocalyptic-wasteland.phase4.test.ts [search: theme, post, apocalyptic, wasteland, phase4] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |- theme-postfx-gates.phase2.test.ts [search: theme, postfx, gates, phase2] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |- theme-registry.split.test.ts [search: theme, registry, split] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |- theme-rollout-flags.phase6.test.ts [search: theme, rollout, flags, phase6] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |- theme-rollout-monitoring.phase6.test.ts [search: theme, rollout, monitoring, phase6] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |- theme-royal-atelier.phase4.test.ts [search: theme, royal, atelier, phase4] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  |- theme-runtime-contracts.phase0.test.ts [search: theme, runtime, contracts, phase0] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  |  `- theme-steampunk-foundry.phase4.test.ts [search: theme, steampunk, foundry, phase4] [functions/classes: n/a] - Automated test coverage artifact
|  |  |  `- visual/
|  |  |     |- control-shape-audit.spec.ts [search: visual, control, shape, audit, spec] [functions/classes: n/a] - Automated test coverage artifact
|  |  |     |- css-specificity-audit.spec.ts [search: visual, specificity, audit, spec] [functions/classes: n/a] - Automated test coverage artifact
|  |  |     `- theme-contrast-audit.spec.ts [search: visual, theme, contrast, audit, spec] [functions/classes: n/a] - Automated test coverage artifact
|  |  |- tsconfig.json [search: tsconfig] [functions/classes: n/a] - Structured configuration/data file
|  |  `- typecheck_output.txt [search: typecheck, output, txt] [functions/classes: n/a] - Repository file artifact
|  `- worker/
|     |- package.json [search: package] [functions/classes: n/a] - Structured configuration/data file
|     |- src/
|     |  |- api/
|     |  |  |- admin/
|     |  |  |  |- audit-logs/
|     |  |  |  |  |- [id].ts [search: api, admin, audit, logs, id] [functions/classes: onRequestDelete] - Worker API endpoint handler
|     |  |  |  |  |- entity/
|     |  |  |  |  |  `- [entityId].ts [search: api, admin, audit, logs, entity, entityid] [functions/classes: onRequestGet] - Worker API endpoint handler
|     |  |  |  |  `- stats.ts [search: api, admin, audit, logs, stats] [functions/classes: onRequestGet] - Worker API endpoint handler
|     |  |  |  `- audit-logs.ts [search: api, admin, audit, logs] [functions/classes: onRequestGet, onRequestPost] - Worker API endpoint handler
|     |  |  |- announcements/
|     |  |  |  |- [id]/
|     |  |  |  |  |- media/
|     |  |  |  |  |  `- [mediaId].ts [search: api, announcements, id, media, mediaid] [functions/classes: onRequestDelete] - Worker API endpoint handler
|     |  |  |  |  |- media.ts [search: api, announcements, id, media] [functions/classes: onRequestPost, onRequestPut] - Worker API endpoint handler
|     |  |  |  |  |- pin.ts [search: api, announcements, id, pin] [functions/classes: onRequestPost] - Worker API endpoint handler
|     |  |  |  |  `- toggle-archive.ts [search: api, announcements, id, toggle, archive] [functions/classes: onRequestPost] - Worker API endpoint handler
|     |  |  |  |- [id].ts [search: api, announcements, id] [functions/classes: onRequestDelete, onRequestGet, onRequestPatch, onRequestPut] - Worker API endpoint handler
|     |  |  |  |- index.ts [search: api, announcements] [functions/classes: onRequestDelete, onRequestGet, onRequestPost] - Worker API endpoint handler
|     |  |  |  `- restore.ts [search: api, announcements, restore] [functions/classes: onRequestPost] - Worker API endpoint handler
|     |  |  |- auth/
|     |  |  |  |- api-keys/
|     |  |  |  |  `- [id].ts [search: api, auth, keys, id] [functions/classes: onRequestDelete] - Worker API endpoint handler
|     |  |  |  |- api-keys.ts [search: api, auth, keys] [functions/classes: onRequestGet, onRequestPost] - Worker API endpoint handler
|     |  |  |  |- change-password.ts [search: api, auth, change, password] [functions/classes: onRequestPost] - Worker API endpoint handler
|     |  |  |  |- csrf.ts [search: api, auth, csrf] [functions/classes: onRequestGet] - Worker API endpoint handler
|     |  |  |  |- login.ts [search: api, auth, login] [functions/classes: onRequestPost] - Worker API endpoint handler
|     |  |  |  |- logout.ts [search: api, auth, logout] [functions/classes: onRequestPost] - Worker API endpoint handler
|     |  |  |  |- preferences.ts [search: api, auth, preferences] [functions/classes: onRequestGet, onRequestPut] - Worker API endpoint handler
|     |  |  |  |- session.ts [search: api, auth, session] [functions/classes: onRequestGet] - Worker API endpoint handler
|     |  |  |  `- signup.ts [search: api, auth, signup] [functions/classes: onRequestPost] - Worker API endpoint handler
|     |  |  |- events/
|     |  |  |  |- [id]/
|     |  |  |  |  |- [action].ts [search: api, events, id, action] [functions/classes: routeHandler] - Worker API endpoint handler
|     |  |  |  |  |- attachments/
|     |  |  |  |  |  `- [mediaId].ts [search: api, events, id, attachments, mediaid] [functions/classes: onRequestDelete] - Worker API endpoint handler
|     |  |  |  |  |- attachments.ts [search: api, events, id, attachments] [functions/classes: onRequestPost, onRequestPut] - Worker API endpoint handler
|     |  |  |  |  |- duplicate.ts [search: api, events, id, duplicate] [functions/classes: onRequestPost] - Worker API endpoint handler
|     |  |  |  |  |- join.ts [search: api, events, id, join] [functions/classes: onRequestPost] - Worker API endpoint handler
|     |  |  |  |  |- kick.ts [search: api, events, id, kick] [functions/classes: onRequestPost] - Worker API endpoint handler
|     |  |  |  |  |- leave.ts [search: api, events, id, leave] [functions/classes: onRequestPost] - Worker API endpoint handler
|     |  |  |  |  |- participants.ts [search: api, events, id, participants] [functions/classes: onRequestPost] - Worker API endpoint handler
|     |  |  |  |  |- pin.ts [search: api, events, id, pin] [functions/classes: onRequestPost] - Worker API endpoint handler
|     |  |  |  |  |- toggle-archive.ts [search: api, events, id, toggle, archive] [functions/classes: onRequestPost] - Worker API endpoint handler
|     |  |  |  |  |- toggle-lock.ts [search: api, events, id, toggle, lock] [functions/classes: onRequestPost] - Worker API endpoint handler
|     |  |  |  |  `- toggle-pin.ts [search: api, events, id, toggle, pin] [functions/classes: onRequestPost] - Worker API endpoint handler
|     |  |  |  |- [id].ts [search: api, events, id] [functions/classes: onRequestDelete, onRequestGet, onRequestPatch, onRequestPut] - Worker API endpoint handler
|     |  |  |  |- index.ts [search: api, events] [functions/classes: onRequestDelete, onRequestGet, onRequestPost] - Worker API endpoint handler
|     |  |  |  `- restore.ts [search: api, events, restore] [functions/classes: onRequestPost] - Worker API endpoint handler
|     |  |  |- gallery/
|     |  |  |  |- [id]/
|     |  |  |  |  |- feature.ts [search: api, gallery, id, feature] [functions/classes: onRequestPost] - Worker API endpoint handler
|     |  |  |  |  `- unfeature.ts [search: api, gallery, id, unfeature] [functions/classes: onRequestPost] - Worker API endpoint handler
|     |  |  |  |- [id].ts [search: api, gallery, id] [functions/classes: onRequestDelete, onRequestGet, onRequestPut] - Worker API endpoint handler
|     |  |  |  `- index.ts [search: api, gallery] [functions/classes: onRequestDelete, onRequestGet, onRequestPost] - Worker API endpoint handler
|     |  |  |- health/
|     |  |  |  `- [[check]].ts [search: api, health, check] [functions/classes: onRequestGet] - Worker API endpoint handler
|     |  |  |- media/
|     |  |  |  |- [id]/
|     |  |  |  |  |- conversions/
|     |  |  |  |  |  `- retry.ts [search: api, media, id, conversions, retry] [functions/classes: onRequestPost] - Worker API endpoint handler
|     |  |  |  |  `- conversions.ts [search: api, media, id, conversions] [functions/classes: onRequestGet] - Worker API endpoint handler
|     |  |  |  |- [key].ts [search: api, media, key] [functions/classes: onRequestGet] - Worker API endpoint handler
|     |  |  |  |- check-duplicate.ts [search: api, media, check, duplicate] [functions/classes: onRequestGet] - Worker API endpoint handler
|     |  |  |  |- conversions.ts [search: api, media, conversions] [functions/classes: onRequestGet, onRequestPost] - Worker API endpoint handler
|     |  |  |  `- reorder.ts [search: api, media, reorder] [functions/classes: onRequestPut] - Worker API endpoint handler
|     |  |  |- members/
|     |  |  |  |- [id]/
|     |  |  |  |  |- [action].ts [search: api, members, id, action] [functions/classes: routeHandler] - Worker API endpoint handler
|     |  |  |  |  |- availability.ts [search: api, members, id, availability] [functions/classes: onRequestPut] - Worker API endpoint handler
|     |  |  |  |  |- classes.ts [search: api, members, id, classes] [functions/classes: onRequestPut] - Worker API endpoint handler
|     |  |  |  |  |- media/
|     |  |  |  |  |  |- [mediaId]/
|     |  |  |  |  |  |  `- set-avatar.ts [search: api, members, id, media, mediaid, set] [functions/classes: onRequestPost] - Worker API endpoint handler
|     |  |  |  |  |  |- [mediaId].ts [search: api, members, id, media, mediaid] [functions/classes: onRequestDelete] - Worker API endpoint handler
|     |  |  |  |  |  `- reorder.ts [search: api, members, id, media, reorder] [functions/classes: onRequestPut] - Worker API endpoint handler
|     |  |  |  |  |- media.ts [search: api, members, id, media] [functions/classes: onRequestPost] - Worker API endpoint handler
|     |  |  |  |  |- notes.ts [search: api, members, id, notes] [functions/classes: onRequestGet, onRequestPut] - Worker API endpoint handler
|     |  |  |  |  |- progression.ts [search: api, members, id, progression] [functions/classes: onRequestGet, onRequestPut] - Worker API endpoint handler
|     |  |  |  |  |- reset-password.ts [search: api, members, id, reset, password] [functions/classes: onRequestPost] - Worker API endpoint handler
|     |  |  |  |  |- role.ts [search: api, members, id, role] [functions/classes: onRequestPut] - Worker API endpoint handler
|     |  |  |  |  |- toggle-active.ts [search: api, members, id, toggle, active] [functions/classes: onRequestPost] - Worker API endpoint handler
|     |  |  |  |  |- username.ts [search: api, members, id, username] [functions/classes: onRequestPut] - Worker API endpoint handler
|     |  |  |  |  |- video-urls/
|     |  |  |  |  |  `- [videoId].ts [search: api, members, id, video, urls, videoid] [functions/classes: onRequestDelete, onRequestPut] - Worker API endpoint handler
|     |  |  |  |  `- video-urls.ts [search: api, members, id, video, urls] [functions/classes: onRequestGet, onRequestPost] - Worker API endpoint handler
|     |  |  |  |- [id].ts [search: api, members, id] [functions/classes: onRequestGet, onRequestPut] - Worker API endpoint handler
|     |  |  |  |- index.ts [search: api, members] [functions/classes: onRequestGet, onRequestPatch] - Worker API endpoint handler
|     |  |  |  `- restore.ts [search: api, members, restore] [functions/classes: onRequestPost] - Worker API endpoint handler
|     |  |  |- poll/
|     |  |  |  |- handlers.ts [search: api, poll, handlers] [functions/classes: fetchAnnouncements, fetchEvents, fetchMembers] - Worker API endpoint handler
|     |  |  |  `- index.ts [search: api, poll] [functions/classes: onRequestGet] - Worker API endpoint handler
|     |  |  |- push/
|     |  |  |  `- index.ts [search: api, push] [functions/classes: routeHandler] - Worker API endpoint handler
|     |  |  |- upload/
|     |  |  |  |- audio.ts [search: api, upload, audio] [functions/classes: onRequestPost] - Worker API endpoint handler
|     |  |  |  `- image.ts [search: api, upload, image] [functions/classes: onRequestPost] - Worker API endpoint handler
|     |  |  `- wars/
|     |  |     |- [id]/
|     |  |     |  |- [action].ts [search: api, wars, id, action] [functions/classes: onRequestPost] - Worker API endpoint handler
|     |  |     |  |- kick-from-pool.ts [search: api, wars, id, kick, from, pool] [functions/classes: onRequestPost] - Worker API endpoint handler
|     |  |     |  |- kick-from-team.ts [search: api, wars, id, kick, from, team] [functions/classes: onRequestPost] - Worker API endpoint handler
|     |  |     |  |- pool-to-team.ts [search: api, wars, id, pool, to, team] [functions/classes: onRequestPost] - Worker API endpoint handler
|     |  |     |  |- teams/
|     |  |     |  |  |- [teamId].ts [search: api, wars, id, teams, teamid] [functions/classes: onRequestDelete, onRequestGet, onRequestPut] - Worker API endpoint handler
|     |  |     |  |  `- index.ts [search: api, wars, id, teams] [functions/classes: onRequestGet, onRequestPost] - Worker API endpoint handler
|     |  |     |  |- team-to-pool.ts [search: api, wars, id, team, to, pool] [functions/classes: onRequestPost] - Worker API endpoint handler
|     |  |     |  `- team-to-team.ts [search: api, wars, id, team, to] [functions/classes: onRequestPost] - Worker API endpoint handler
|     |  |     |- [id].ts [search: api, wars, id] [functions/classes: onRequestDelete, onRequestGet, onRequestPut] - Worker API endpoint handler
|     |  |     |- analytics.ts [search: api, wars, analytics] [functions/classes: onRequestGet] - Worker API endpoint handler
|     |  |     |- analytics-formula-presets.ts [search: api, wars, analytics, formula, presets] [functions/classes: onRequestDelete, onRequestGet, onRequestPost] - Worker API endpoint handler
|     |  |     |- history/
|     |  |     |  |- [id]/
|     |  |     |  |  `- member-stats.ts [search: api, wars, history, id, member, stats] [functions/classes: onRequestGet, onRequestPut] - Worker API endpoint handler
|     |  |     |  `- [id].ts [search: api, wars, history, id] [functions/classes: onRequestGet, onRequestPut] - Worker API endpoint handler
|     |  |     |- history.ts [search: api, wars, history] [functions/classes: onRequestGet, onRequestPost] - Worker API endpoint handler
|     |  |     |- index.ts [search: api, wars] [functions/classes: onRequestGet, onRequestPost] - Worker API endpoint handler
|     |  |     `- latest.ts [search: api, wars, latest] [functions/classes: onRequestGet] - Worker API endpoint handler
|     |  |- core/
|     |  |  |- api-keys.ts [search: core, api, keys] [functions/classes: generateAPIKey, requireScope, validateAPIKey, withAPIKeyAuth] - Worker core runtime module
|     |  |  |- broadcast.ts [search: core, broadcast] [functions/classes: broadcastUpdate] - Worker core runtime module
|     |  |  |- csrf.ts [search: core, csrf] [functions/classes: generateCSRFToken, setCSRFTokenInSession, withCSRF] - Worker core runtime module
|     |  |  |- db-schema.ts [search: core, db, schema] [functions/classes: DB_TABLES, EVENT_COLUMNS, EVENT_SELECT_FIELDS, MEMBER_USER_SELECT_FIELDS, pickAllowedFields] - Worker core runtime module
|     |  |  |- drizzle.ts [search: core, drizzle] [functions/classes: getDb] - Worker core runtime module
|     |  |  |- endpoint-factory.ts [search: core, endpoint, factory] [functions/classes: createEndpoint] - Worker core runtime module
|     |  |  |- endpoint-registry.ts [search: core, endpoint, registry] [functions/classes: clearRegistry, createRegisteredEndpoint, exportRegistry, getAllEndpoints, getEndpoint, getEndpointsByEntity] - Worker core runtime module
|     |  |  |- endpoint-registry-adapter.ts [search: core, endpoint, registry, adapter] [functions/classes: getAllEndpointPaths, getCanonicalPath, initializeEndpointRegistry, isValidEndpointPath, registerPollHandlers] - Worker core runtime module
|     |  |  |- errors.ts [search: core, errors] [functions/classes: AppError, AuthenticationError, ConflictError, ForbiddenError, NotFoundError, ValidationError] - Worker core runtime module
|     |  |  |- middleware.ts [search: core, middleware] [functions/classes: checkRateLimit, getRateLimitKey, withAdminAuth, withAuth, withModeratorAuth, withOptionalAuth] - Worker core runtime module
|     |  |  |- rate-limit.ts [search: core, rate, limit] [functions/classes: checkRateLimitDO, getRateLimitConfig, getRateLimitKey, getUserTier] - Worker core runtime module
|     |  |  |- route-loader.ts [search: core, route, loader] [functions/classes: clearHandlerCache, getAllRoutes, getRouteHandler, getRouteStats, matchRoute, registerRouteHandler] - Worker core runtime module
|     |  |  |- route-registrar.ts [search: core, route, registrar] [functions/classes: initializeRouteRegistrar] - Worker core runtime module
|     |  |  |- sanitize.ts [search: core, sanitize] [functions/classes: announcementBodySchema, emailSchema, htmlSchema, limitedString, plainTextSchema, sanitizeHTML] - Worker core runtime module
|     |  |  |- shared.ts [search: core, shared] [functions/classes: errorResponse, generateETag, jsonResponse] - Worker core runtime module
|     |  |  |- types.ts [search: core, types] [functions/classes: n/a] - Worker core runtime module
|     |  |  |- utils.ts [search: core, utils] [functions/classes: addETag, assertIfMatch, badRequestResponse, canEditEntity, checkETag, checkIfMatch] - Worker core runtime module
|     |  |  `- validation.ts [search: core, validation] [functions/classes: addVideoUrlSchema, assignMemberSchema, auditLogQuerySchema, availabilityBlockSchema, batchAnnouncementActionSchema, batchEventActionSchema] - Worker core runtime module
|     |  |- cron/
|     |  |  `- cleanup-audit-logs.ts [search: cron, cleanup, audit, logs] [functions/classes: cleanupAuditLogs] - Worker scheduled maintenance task
|     |  |- db/
|     |  |  `- schema.ts [search: db, schema] [functions/classes: auditLog, events, eventTeams, mediaObjects, memberAvailabilityBlocks, memberMedia] - Worker database schema or helpers
|     |  |- declarations.d.ts [search: declarations] [functions/classes: n/a] - Repository file artifact
|     |  |- scheduled/
|     |  |  `- session-cleanup.ts [search: scheduled, session, cleanup] [functions/classes: n/a] - Worker scheduled maintenance task
|     |  |- websocket/
|     |  |  `- ConnectionManager.ts [search: websocket, connectionmanager] [functions/classes: ConnectionManager] - Worker websocket coordination module
|     |  `- worker.ts [search: n/a] [functions/classes:  ConnectionManager ] - Repository file artifact
|     `- tests/
|        |- api/
|        |  |- auth/
|        |  |  |- login-session-policy.test.ts [search: api, auth, login, session, policy] [functions/classes: n/a] - Automated test coverage artifact
|        |  |  `- preferences.test.ts [search: api, auth, preferences] [functions/classes: n/a] - Automated test coverage artifact
|        |  |- events/
|        |  |  `- list-controls.test.ts [search: api, events, list, controls] [functions/classes: n/a] - Automated test coverage artifact
|        |  |- media/
|        |  |  `- key.test.ts [search: api, media, key] [functions/classes: n/a] - Automated test coverage artifact
|        |  |- members/
|        |  |  `- list-pagination.test.ts [search: api, members, list, pagination] [functions/classes: n/a] - Automated test coverage artifact
|        |  `- wars/
|        |     |- analytics.test.ts [search: api, wars, analytics] [functions/classes: n/a] - Automated test coverage artifact
|        |     `- analytics-formula-presets.test.ts [search: api, wars, analytics, formula, presets] [functions/classes: n/a] - Automated test coverage artifact
|        |- contracts/
|        |  `- list-endpoints-pagination.contract.test.ts [search: contracts, list, endpoints, pagination, contract] [functions/classes: n/a] - Automated test coverage artifact
|        |- core/
|        |  `- pagination.test.ts [search: core, pagination] [functions/classes: n/a] - Automated test coverage artifact
|        |- README.md [search: readme] [functions/classes: n/a] - Automated test coverage artifact
|        `- test-utils/
|           `- setup.ts [search: utils, setup] [functions/classes: authedRequest, seedAnnouncement, seedEvent, seedSchema, seedSession, seedUser] - Automated test coverage artifact
|- config/
|  |- drizzle/
|  |  `- drizzle.config.ts [search: drizzle] [functions/classes: n/a] - Centralized tool/build configuration
|  |- eslint/
|  |  `- eslint.config.js [search: eslint] [functions/classes: n/a] - Centralized tool/build configuration
|  |- postcss/
|  |  `- postcss.config.js [search: postcss] [functions/classes: n/a] - Centralized tool/build configuration
|  |- tailwind/
|  |  `- tailwind.config.js [search: tailwind] [functions/classes: n/a] - Centralized tool/build configuration
|  |- typescript/
|  |  |- tsconfig.node.json [search: typescript, tsconfig, node] [functions/classes: n/a] - Centralized tool/build configuration
|  |  |- tsconfig.portal.json [search: typescript, tsconfig] [functions/classes: n/a] - Centralized tool/build configuration
|  |  |- tsconfig.root.json [search: typescript, tsconfig, root] [functions/classes: n/a] - Centralized tool/build configuration
|  |  `- tsconfig.worker.json [search: typescript, tsconfig] [functions/classes: n/a] - Centralized tool/build configuration
|  |- vite/
|  |  `- vite.portal.config.ts [search: vite] [functions/classes: n/a] - Centralized tool/build configuration
|  `- vitest/
|     |- vitest.portal.config.ts [search: vitest] [functions/classes: n/a] - Centralized tool/build configuration
|     `- vitest.workers.config.ts [search: vitest, workers] [functions/classes: n/a] - Centralized tool/build configuration
|- docs/
|  |- engineering/
|  |  `- repository-structure.md [search: engineering, repository, structure] [functions/classes: n/a] - Engineering standards/documentation
|  |- plans/
|  |  `- todo.md [search: plans, todo] [functions/classes: n/a] - Documentation file
|  `- product/
|     |- admin-console.md [search: product, admin, console] [functions/classes: n/a] - Product behavior specification
|     |- announcements.md [search: product, announcements] [functions/classes: n/a] - Product behavior specification
|     |- auth.md [search: product, auth] [functions/classes: n/a] - Product behavior specification
|     |- dashboard.md [search: product, dashboard] [functions/classes: n/a] - Product behavior specification
|     |- events.md [search: product, events] [functions/classes: n/a] - Product behavior specification
|     |- Global.md [search: product, global] [functions/classes: n/a] - Product behavior specification
|     |- guild-war.md [search: product, guild, war] [functions/classes: n/a] - Product behavior specification
|     |- my-profile.md [search: product, my, profile] [functions/classes: n/a] - Product behavior specification
|     |- roster.md [search: product, roster] [functions/classes: n/a] - Product behavior specification
|     |- settings.md [search: product, settings] [functions/classes: n/a] - Product behavior specification
|     |- tools.md [search: product, tools] [functions/classes: n/a] - Product behavior specification
|     `- wiki.md [search: product, wiki] [functions/classes: n/a] - Product behavior specification
|- infra/
|  |- cloudflare/
|  |  `- README.md [search: cloudflare, readme] [functions/classes: n/a] - Cloudflare infrastructure notes
|  `- database/
|     |- d1-schema/
|     |  |- D1_Schema.sql [search: database, d1, schema] [functions/classes: n/a] - Database schema or migration artifact
|     |  |- d1_schema_optimization_guide.md [search: database, d1, schema, optimization, guide] [functions/classes: n/a] - Database schema or migration artifact
|     |  |- DATABASE_SCHEMA.md [search: database, d1, schema] [functions/classes: n/a] - Database schema or migration artifact
|     |  `- seed_portal_mock_data.sql [search: database, d1, schema, seed, mock, data] [functions/classes: n/a] - Database schema or migration artifact
|     `- drizzle/
|        |- 0000_free_baron_strucker.sql [search: database, drizzle, 0000, free, baron, strucker] [functions/classes: n/a] - Database schema or migration artifact
|        `- meta/
|           |- _journal.json [search: database, drizzle, journal] [functions/classes: n/a] - Database schema or migration artifact
|           `- 0000_snapshot.json [search: database, drizzle, 0000, snapshot] [functions/classes: n/a] - Database schema or migration artifact
|- Knowledge_Base.md [search: knowledge, base] [functions/classes: n/a] - Project durable rules and operating guidance
|- package.json [search: package] [functions/classes: n/a] - Structured configuration/data file
|- package-lock.json [search: package, lock] [functions/classes: n/a] - Structured configuration/data file
|- packages/
|  |- shared-api/
|  |  |- package.json [search: shared, api, package] [functions/classes: n/a] - Structured configuration/data file
|  |  `- src/
|  |     |- contracts.ts [search: shared, api, contracts] [functions/classes: n/a] - Shared API contracts/endpoints package
|  |     `- endpoints.ts [search: shared, api, endpoints] [functions/classes: buildPath, ENDPOINTS, extractPathParams] - Shared API contracts/endpoints package
|  `- shared-utils/
|     |- package.json [search: shared, utils, package] [functions/classes: n/a] - Structured configuration/data file
|     `- src/
|        |- etag.ts [search: shared, utils, etag] [functions/classes: generateStrongETag, generateTimestampETag, generateWeakETag, matchesETag, parseETagHeader, weakETagEquals] - Shared utility package module
|        |- pagination.ts [search: shared, utils, pagination] [functions/classes: buildCursorWhereClause, buildPaginatedResponse, decodeCursor, encodeCursor, filterFields, parseFieldsQuery] - Shared utility package module
|        `- response.ts [search: shared, utils, response] [functions/classes: addAllowedOrigin, badRequestResponse, conflictResponse, corsHeaders, errorResponse, forbiddenResponse] - Shared utility package module
|- scripts/
|  |- audit-endpoints.cjs [search: scripts, audit, endpoints] [functions/classes: n/a] - Automation/audit script
|  |- enforce-theme-token-usage.mjs [search: scripts, enforce, theme, token, usage] [functions/classes: n/a] - Automation/audit script
|  |- theme-contrast-audit.mjs [search: scripts, theme, contrast, audit] [functions/classes: n/a] - Automation/audit script
|  `- theme-token-guardrail-baseline.json [search: scripts, theme, token, guardrail, baseline] [functions/classes: n/a] - Automation/audit script
|- tsconfig.json [search: tsconfig] [functions/classes: n/a] - Structured configuration/data file
`- wrangler.jsonc [search: wrangler, jsonc] [functions/classes: n/a] - Structured configuration/data file
```

## Obsolete Class Tracker
- ACTIVE: `APIError` in `apps\portal\src\lib\api-client.ts` (reference files: 3).
- ACTIVE: `AppError` in `apps\worker\src\core\errors.ts` (reference files: 2).
- ACTIVE: `AuthenticationError` in `apps\worker\src\core\errors.ts` (reference files: 2).
- OBSOLETE CANDIDATE: `ConflictError` in `apps\worker\src\core\errors.ts` (reference files: 1).
- ACTIVE: `ConnectionManager` in `apps\worker\src\websocket\ConnectionManager.ts` (reference files: 4).
- ACTIVE: `ErrorBoundary` in `apps\portal\src\components\feedback\ErrorBoundary.tsx` (reference files: 3).
- ACTIVE: `ForbiddenError` in `apps\worker\src\core\errors.ts` (reference files: 2).
- ACTIVE: `NotFoundError` in `apps\worker\src\core\errors.ts` (reference files: 40).
- OBSOLETE CANDIDATE: `ValidationError` in `apps\worker\src\core\errors.ts` (reference files: 1).

## Maintenance Workflow
1. Start any repo dive by reading this file.
2. After any structural code change, refresh symbols/search words for touched files.
3. If removing or replacing a class, update the obsolete tracker status in the same change.
4. Keep `Knowledge_Base.md` and this file aligned on repository governance rules.