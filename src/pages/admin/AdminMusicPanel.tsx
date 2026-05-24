import { Button, Card, Checkbox, Input, Switch } from 'animal-island-ui'
import { Hash, Music2, Save } from 'lucide-react'

import type { MusicSourceType, MusicTrack } from '@/lib/posts-api'
import type { MusicForm, SetMusicForm } from './types'

type AdminMusicPanelProps = {
  musicForm: MusicForm
  musicTracks: MusicTrack[]
  saving: boolean
  setMusicForm: SetMusicForm
  setMusicTracks: (tracks: MusicTrack[]) => void
  onSaveMusic: () => void
}

export function AdminMusicPanel({ musicForm, musicTracks, saving, setMusicForm, setMusicTracks, onSaveMusic }: AdminMusicPanelProps) {
  return (
    <section className="island-admin-panel">
      <Card className="island-admin-editor__card">
        <div className="island-admin-editor__header">
          <div>
            <span className="island-admin-editor__eyebrow">音乐管理</span>
            <h2>{musicForm.sourceType === 'playlist' ? '网易云歌单' : '网易云歌曲'}</h2>
          </div>
          <Button type="primary" size="small" htmlType="button" icon={<Save size={14} strokeWidth={3} />} loading={saving} onClick={onSaveMusic}>
            保存
          </Button>
        </div>

        <div className="island-admin-music-preview">
          <div className="island-admin-music-preview__cover">
            {musicTracks[0]?.pic ?
              <img src={musicTracks[0].pic} alt="音乐封面预览" />
            : <Music2 aria-hidden="true" size={30} strokeWidth={3} />}
          </div>
          <div>
            <strong>{musicTracks[0]?.title || '等待读取歌曲信息'}</strong>
            <span>
              {musicTracks[0]?.author || '输入 ID 保存后，会从音乐接口解析'}
              {musicTracks.length > 1 ? ` · 共 ${musicTracks.length} 首` : ''}
            </span>
          </div>
        </div>

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
              setMusicTracks([])
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

        <label className="island-admin-switch island-admin-switch--fit">
          <span>默认开启音乐入口</span>
          <Switch
            size="small"
            checked={musicForm.enabled}
            checkedChildren="ON"
            unCheckedChildren="OFF"
            onChange={(checked) => setMusicForm((current) => ({ ...current, enabled: checked }))}
          />
        </label>

        {musicTracks.length > 0 ?
          <div className="island-admin-track-list" aria-label="已解析歌曲">
            {musicTracks.slice(0, 8).map((track) => (
              <div key={`${track.url}-${track.title}`} className="island-admin-track-list__item">
                <img src={track.pic || 'https://www.loliapi.com/acg/pp'} alt="" />
                <span>
                  <strong>{track.title}</strong>
                  <small>{track.author}</small>
                </span>
              </div>
            ))}
            {musicTracks.length > 8 ?
              <p>还有 {musicTracks.length - 8} 首已保存。</p>
            : null}
          </div>
        : null}
      </Card>
    </section>
  )
}
