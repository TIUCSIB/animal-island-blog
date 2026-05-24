# Island components

这些组件是基于 `animal-island-ui` 视觉语言扩展的项目内组件，统一用 `Island*` 前缀，避免和 `animal-island-ui`、`shadcn/ui` 命名冲突。

```tsx
import {
  IslandAvatar,
  IslandBadge,
  IslandEmptyState,
  IslandNotice,
  IslandPhotoCard,
  IslandStatCard,
  IslandText,
  IslandTextStack,
  IslandTimeline,
} from '@/components/island'
```

## Components

- `IslandAvatar`：圆润头像，支持图片、fallback、尺寸、形状、状态点、角标和点击态
- `IslandText`：统一文本组件，支持标题、正文、说明、标签、颜色、对齐、截断
- `IslandTextStack`：文本组容器，适合标题 + 副标题 + 描述
- `IslandBadge`：圆润标签 / 状态徽章
- `IslandNotice`：通知卡片，内部使用 `animal-island-ui` 的 `Card` 和 `Button`
- `IslandStatCard`：数据统计卡片，内部使用 `Card`
- `IslandPhotoCard`：图片卡片，可点击，适合相册 / plog
- `IslandTimeline`：岛屿风时间线
- `IslandEmptyState`：空状态卡片，内部使用 `Card` 和 `Button`

## Avatar example

```tsx
<IslandAvatar
  src="https://github.com/shadcn.png"
  name="mewbarkjoy"
  size="xl"
  shape="squircle"
  status="online"
  badge="1"
/>
```

## Text example

```tsx
<IslandTextStack>
  <IslandText variant="title" balance>
    mewbarkjoy
  </IslandText>
  <IslandText variant="muted">
    喜歡獨處 喜歡小狗 平淡就是幸福˶’ᵕ‘˶
  </IslandText>
  <IslandText variant="label" tone="teal">
    travel diary
  </IslandText>
</IslandTextStack>
```

## Card example

```tsx
<IslandNotice
  title="今日岛屿提醒"
  description="记得整理相册，把喜欢的瞬间收进旅行日记。"
  actionText="去看看"
/>

<IslandBadge tone="teal" dot>
  旅行日记
</IslandBadge>

<IslandPhotoCard
  imageSrc="/gallery/dawn-cove.svg"
  title="雪落在丘陵上像蛋糕一样"
  category="旅行日记"
  meta="2026.05 · 北方山野"
/>
```
