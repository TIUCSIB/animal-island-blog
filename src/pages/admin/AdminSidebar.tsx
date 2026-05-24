import { Card } from 'animal-island-ui'
import { FileText, Globe2, Music2, Settings } from 'lucide-react'

import type { AdminSection } from './types'

type AdminSidebarProps = {
  activeSection: AdminSection
  postsCount: number
  pinnedCount: number
  onSectionChange: (section: AdminSection) => void
}

export function AdminSidebar({ activeSection, postsCount, pinnedCount, onSectionChange }: AdminSidebarProps) {
  return (
    <aside className="island-admin-nav" aria-label="后台管理菜单">
      <Card className="island-admin-nav__card">
        <button
          className={['island-admin-nav__item', activeSection === 'posts' && 'island-admin-nav__item--active'].filter(Boolean).join(' ')}
          type="button"
          onClick={() => onSectionChange('posts')}
        >
          <FileText aria-hidden="true" size={18} strokeWidth={3} />
          <span>
            <strong>文章管理</strong>
            <small>照片 / 内容 / 标签</small>
          </span>
        </button>
        <button
          className={['island-admin-nav__item', activeSection === 'music' && 'island-admin-nav__item--active'].filter(Boolean).join(' ')}
          type="button"
          onClick={() => onSectionChange('music')}
        >
          <Music2 aria-hidden="true" size={18} strokeWidth={3} />
          <span>
            <strong>音乐管理</strong>
            <small>播放器 / 歌曲配置</small>
          </span>
        </button>
        <button
          className={['island-admin-nav__item', activeSection === 'site' && 'island-admin-nav__item--active'].filter(Boolean).join(' ')}
          type="button"
          onClick={() => onSectionChange('site')}
        >
          <Globe2 aria-hidden="true" size={18} strokeWidth={3} />
          <span>
            <strong>站点管理</strong>
            <small>主页 / 关于 / 联系</small>
          </span>
        </button>
        <button
          className={['island-admin-nav__item', activeSection === 'system' && 'island-admin-nav__item--active'].filter(Boolean).join(' ')}
          type="button"
          onClick={() => onSectionChange('system')}
        >
          <Settings aria-hidden="true" size={18} strokeWidth={3} />
          <span>
            <strong>系统管理</strong>
            <small>状态 / 账户 / 接口</small>
          </span>
        </button>
      </Card>

      <Card className="island-admin-summary">
        <strong>{postsCount}</strong>
        <span>篇文章</span>
        <strong>{pinnedCount}</strong>
        <span>个置顶</span>
      </Card>
    </aside>
  )
}
