import { useEffect, useRef, useState } from 'react'
import { Button, Card, Checkbox, Input, Switch } from 'animal-island-ui'
import { Hash, ListMusic, Music2, Pause, Play, Save, SkipBack, SkipForward } from 'lucide-react'

import type { MusicConfig, MusicSourceType, MusicTrack } from '@/lib/posts-api'
import { useMusicConfigQuery } from '@/lib/query-hooks'
import type { MusicForm, SetMusicForm } from '../types'

type AdminMusicPanelProps = {
  musicForm: MusicForm
  saving: boolean
  setMusicForm: SetMusicForm
  onSaveMusic: () => void
}

type AdminMusicPreviewProps = {
  dirty: boolean
  loading: boolean
  music?: MusicConfig
}

function getMusicTypeText(sourceType?: MusicSourceType) {
  return sourceType === 'playlist' ? '歌单' : '歌曲'
}

function getTrackTitle(track?: MusicTrack, index = 0) {
  return track?.title || `第 ${index + 1} 首音乐`
}

function AdminMusicPreviewContent({ dirty, loading, music }: AdminMusicPreviewProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)
  const [trackIndex, setTrackIndex] = useState(0)
  const tracks = music?.tracks?.filter((track) => track.url) ?? []
  const currentTrack = tracks[trackIndex] ?? tracks[0]
  const hasMultipleTracks = tracks.length > 1

  useEffect(() => {
    const audio = audioRef.current

    if (!audio || !currentTrack?.url) return

    if (playing) {
      void audio.play().catch(() => setPlaying(false))
    } else {
      audio.pause()
    }
  }, [currentTrack?.url, playing])

  function playPreviousTrack() {
    if (!hasMultipleTracks) return

    setTrackIndex((current) => (current - 1 + tracks.length) % tracks.length)
    setPlaying(true)
  }

  function playNextTrack() {
    if (!hasMultipleTracks) return

    setTrackIndex((current) => (current + 1) % tracks.length)
    setPlaying(true)
  }

  if (loading) {
    return (
      <div className="island-admin-music-preview island-admin-music-preview--empty">
        <div className="island-admin-music-preview__cover">
          <Music2 size={28} strokeWidth={3} />
        </div>
        <div className="island-admin-music-preview__body">
          <strong>正在加载音乐预览</strong>
          <span>稍等一下，正在读取当前保存的音乐配置。</span>
        </div>
      </div>
    )
  }

  if (!currentTrack) {
    return (
      <div className="island-admin-music-preview island-admin-music-preview--empty">
        <div className="island-admin-music-preview__cover">
          <Music2 size={28} strokeWidth={3} />
        </div>
        <div className="island-admin-music-preview__body">
          <strong>暂无可预览音乐</strong>
          <span>填写歌曲 ID 或歌单 ID 后保存，预览会在这里出现。</span>
        </div>
      </div>
    )
  }

  return (
    <div className="island-admin-music-preview">
      <audio key={currentTrack.url} ref={audioRef} src={currentTrack.url} preload="none" onEnded={playNextTrack} onPause={() => setPlaying(false)} onPlay={() => setPlaying(true)} />

      <div className="island-admin-music-preview__cover">
        {currentTrack.pic ?
          <img src={currentTrack.pic} alt="" />
        : <Music2 size={28} strokeWidth={3} />}
      </div>

      <div className="island-admin-music-preview__body">
        <div className="island-admin-music-preview__title-row">
          <div>
            <strong>{getTrackTitle(currentTrack, trackIndex)}</strong>
            <span>{currentTrack.author || '未知作者'}</span>
          </div>
          <small className={music?.enabled ? 'island-admin-music-preview__state island-admin-music-preview__state--on' : 'island-admin-music-preview__state'}>
            {music?.enabled ? '已开启' : '已关闭'}
          </small>
        </div>

        <div className="island-admin-music-preview__meta">
          <span>
            <ListMusic size={13} strokeWidth={3} />
            {getMusicTypeText(music?.sourceType)} · {tracks.length} 首{hasMultipleTracks ? ` · ${trackIndex + 1}/${tracks.length}` : ''}
          </span>
          {dirty ?
            <span className="island-admin-music-preview__tip">表单有改动，保存后会更新预览。</span>
          : null}
        </div>

        <div className="island-admin-music-preview__actions">
          {hasMultipleTracks ?
            <Button type="text" size="small" htmlType="button" aria-label="上一首" onClick={playPreviousTrack}>
              <SkipBack size={13} strokeWidth={3} />
            </Button>
          : null}
          <Button type="primary" size="small" htmlType="button" aria-label={playing ? '暂停预览' : '播放预览'} onClick={() => setPlaying((current) => !current)}>
            {playing ?
              <Pause size={13} strokeWidth={3} />
            : <Play size={13} strokeWidth={3} />}
          </Button>
          {hasMultipleTracks ?
            <Button type="text" size="small" htmlType="button" aria-label="下一首" onClick={playNextTrack}>
              <SkipForward size={13} strokeWidth={3} />
            </Button>
          : null}
        </div>
      </div>
    </div>
  )
}

function AdminMusicPreview(props: AdminMusicPreviewProps) {
  const resetKey = `${props.music?.sourceType ?? 'empty'}-${props.music?.musicId ?? 'empty'}`

  return <AdminMusicPreviewContent key={resetKey} {...props} />
}

export function AdminMusicPanel({ musicForm, saving, setMusicForm, onSaveMusic }: AdminMusicPanelProps) {
  const musicConfigQuery = useMusicConfigQuery()
  const savedMusic = musicConfigQuery.data
  const previewDirty = Boolean(savedMusic && (savedMusic.enabled !== musicForm.enabled || savedMusic.musicId !== musicForm.musicId || savedMusic.sourceType !== musicForm.sourceType))

  return (
    <section className="island-admin-panel">
      <Card className="island-admin-editor__card">
        <div className="island-admin-editor__header">
          <div>
            <span className="island-admin-editor__eyebrow">音乐管理</span>
          </div>
        </div>

        <AdminMusicPreview dirty={previewDirty} loading={musicConfigQuery.isPending} music={savedMusic} />

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
