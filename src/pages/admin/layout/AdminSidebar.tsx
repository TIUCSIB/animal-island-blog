import { Card } from 'animal-island-ui'
import { BookOpenText, FileText, Globe2, Music2, Pencil, Settings } from 'lucide-react'

import type { AdminSection } from '../types'

type AdminSidebarProps = {
  activeSection: AdminSection
  postsCount?: number
  pinnedCount?: number
  onSectionChange: (section: AdminSection) => void
}

export function AdminSidebar({ activeSection, onSectionChange }: AdminSidebarProps) {
  return (
    <aside className="island-admin-nav" aria-label="后台管理菜单">
      <Card className="island-admin-nav__card">
        <button className={['island-admin-nav__item', activeSection === 'write' && 'island-admin-nav__item--active'].filter(Boolean).join(' ')} type="button" onClick={() => onSectionChange('write')}>
          <Pencil aria-hidden="true" size={18} strokeWidth={3} />
          <span>
            <strong>写文章</strong>
          </span>
        </button>

        <button className={['island-admin-nav__item', activeSection === 'posts' && 'island-admin-nav__item--active'].filter(Boolean).join(' ')} type="button" onClick={() => onSectionChange('posts')}>
          <FileText aria-hidden="true" size={18} strokeWidth={3} />
          <span>
            <strong>文章管理</strong>
          </span>
        </button>

        <button className={['island-admin-nav__item', activeSection === 'site' && 'island-admin-nav__item--active'].filter(Boolean).join(' ')} type="button" onClick={() => onSectionChange('site')}>
          <Globe2 aria-hidden="true" size={18} strokeWidth={3} />
          <span>
            <strong>站点管理</strong>
          </span>
        </button>

        <button className={['island-admin-nav__item', activeSection === 'music' && 'island-admin-nav__item--active'].filter(Boolean).join(' ')} type="button" onClick={() => onSectionChange('music')}>
          <Music2 aria-hidden="true" size={18} strokeWidth={3} />
          <span>
            <strong>音乐</strong>
          </span>
        </button>

        <button className={['island-admin-nav__item', activeSection === 'about' && 'island-admin-nav__item--active'].filter(Boolean).join(' ')} type="button" onClick={() => onSectionChange('about')}>
          <BookOpenText aria-hidden="true" size={18} strokeWidth={3} />
          <span>
            <strong>关于</strong>
          </span>
        </button>

        <button className={['island-admin-nav__item', activeSection === 'system' && 'island-admin-nav__item--active'].filter(Boolean).join(' ')} type="button" onClick={() => onSectionChange('system')}>
          <Settings aria-hidden="true" size={18} strokeWidth={3} />
          <span>
            <strong>系统设置</strong>
          </span>
        </button>
      </Card>
    </aside>
  )
}
