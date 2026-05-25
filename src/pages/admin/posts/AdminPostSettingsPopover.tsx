import type { ReactNode } from 'react'
import { Input, Switch } from 'animal-island-ui'
import { MapPin, Tags } from 'lucide-react'

import { IslandPopover } from '@/components/island'
import type { PostForm, SetPostForm } from '../types'

type AdminPostSettingsPopoverProps = {
  open: boolean
  trigger: ReactNode
  form: PostForm
  setForm: SetPostForm
  onOpenChange: (open: boolean) => void
}

export function AdminPostSettingsPopover({ open, trigger, form, setForm, onOpenChange }: AdminPostSettingsPopoverProps) {
  return (
    <IslandPopover open={open} onOpenChange={onOpenChange} contentClassName="w-[17.5rem]" trigger={trigger}>
      <strong className="flex items-center gap-1.5 text-sm font-black text-[#4d3f2c]">🤗 设置</strong>
      <label className="grid grid-cols-[42px_minmax(0,1fr)] items-center gap-2 text-xs font-black">
        <span>地点</span>
        <Input
          size="small"
          value={form.location}
          placeholder="家附近 / Taipei"
          prefix={<MapPin size={14} strokeWidth={3} />}
          onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))}
        />
      </label>
      <label className="grid grid-cols-[42px_minmax(0,1fr)] items-center gap-2 text-xs font-black">
        <span>标签</span>
        <Input
          size="small"
          value={form.tagsText}
          placeholder="日常，散步，小狗"
          prefix={<Tags size={14} strokeWidth={3} />}
          onChange={(event) => setForm((current) => ({ ...current, tagsText: event.target.value }))}
        />
      </label>
      <label className="flex items-center justify-between gap-3 rounded-2xl bg-[#f8f8f0]/70 px-3 py-2 text-xs font-black">
        <span>置顶文章</span>
        <Switch size="small" checked={form.pinned} checkedChildren="ON" unCheckedChildren="OFF" onChange={(checked) => setForm((current) => ({ ...current, pinned: checked }))} />
      </label>
    </IslandPopover>
  )
}
