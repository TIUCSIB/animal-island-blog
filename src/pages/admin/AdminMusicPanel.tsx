import { Button, Card, Checkbox, Input, Switch } from 'animal-island-ui'
import { Hash, Music2, Save } from 'lucide-react'

import type { MusicSourceType } from '@/lib/posts-api'
import type { MusicForm, SetMusicForm } from './types'
import { IslandAvatar } from '@/components/island'

type AdminMusicPanelProps = {
  musicForm: MusicForm
  saving: boolean
  setMusicForm: SetMusicForm
  onSaveMusic: () => void
}

export function AdminMusicPanel({ musicForm, saving, setMusicForm, onSaveMusic }: AdminMusicPanelProps) {
  return (
    <section className="island-admin-panel">
      <Card className="island-admin-editor__card">
        <div className="island-admin-editor__header">
          <div>
            <span className="island-admin-editor__eyebrow">音乐管理</span>
          </div>
        </div>

        <IslandAvatar src={musicForm.sourceType} size="sm"></IslandAvatar>

        <fieldset className="island-admin-field">
          <span>歌曲类型</span>
          <Checkbox
            className="island-admin-music-type"
            size="middle"
            value={[musicForm.sourceType]}
            options={[
              { label: '歌曲', value: 'song' },
              { label: '歌单', value: 'playlist' },
            ]}
            onChange={(values) => {
              const nextType = (values.at(-1) ?? musicForm.sourceType) as MusicSourceType

              setMusicForm((current) => ({ ...current, sourceType: nextType }))
            }}
          />
        </fieldset>

        <label className="island-admin-field">
          <span>平台</span>
          <Input value="网易云音乐" disabled prefix={<Music2 size={15} strokeWidth={3} />} />
        </label>

        <label className="island-admin-field">
          <span>{musicForm.sourceType === 'playlist' ? '歌单 ID' : '歌曲 ID'}</span>
          <Input
            value={musicForm.musicId}
            placeholder="473403185"
            prefix={<Hash size={15} strokeWidth={3} />}
            allowClear
            onChange={(event) => setMusicForm((current) => ({ ...current, musicId: event.target.value }))}
            onClear={() => setMusicForm((current) => ({ ...current, musicId: '' }))}
          />
        </label>

        <div className="flex items-center justify-between">
          <label className="island-admin-switch island-admin-switch--fit">
            <span>播放器</span>
            <Switch size="small" checked={musicForm.enabled} checkedChildren="ON" unCheckedChildren="OFF" onChange={(checked) => setMusicForm((current) => ({ ...current, enabled: checked }))} />
          </label>
          <Button className="w-fit" type="primary" size="small" htmlType="button" icon={<Save size={14} strokeWidth={3} />} loading={saving} onClick={onSaveMusic}>
            保存
          </Button>
        </div>
      </Card>
    </section>
  )
}
