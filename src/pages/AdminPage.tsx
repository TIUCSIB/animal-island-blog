import { useNavigate } from 'react-router'

import { AdminAboutPanel } from './admin/AdminAboutPanel'
import { AdminLoginGate } from './admin/AdminLoginGate'
import { AdminMusicPanel } from './admin/AdminMusicPanel'
import { AdminPostsPanel } from './admin/AdminPostsPanel'
import { AdminSidebar } from './admin/AdminSidebar'
import { AdminSitePanel } from './admin/AdminSitePanel'
import { AdminSystemPanel } from './admin/AdminSystemPanel'
import { DeletePostModal } from './admin/DeletePostModal'
import { AdminTopbar } from './admin/AdminTopbar'
import { useAdminDashboard } from './admin/useAdminDashboard'

export default function AdminPage() {
  const navigate = useNavigate()
  const admin = useAdminDashboard()

  return (
    <div className={['island-admin-page', !admin.isLoggedIn && 'island-admin-page--login'].filter(Boolean).join(' ')}>
      <div className="island-admin-page__shell">
        <main className="island-admin-page__main">
          {!admin.isLoggedIn ?
            <AdminLoginGate onLoginClick={admin.openLoginModal} onHomeClick={() => navigate('/')} />
          : <>
              <AdminTopbar account={admin.adminProfile?.account ?? admin.accountForm.account} profile={admin.siteProfileForm} onHomeClick={() => navigate('/')} onLogout={admin.handleLogout} />

              <section className="island-admin-layout">
                <AdminSidebar activeSection={admin.activeSection} postsCount={admin.posts.length} pinnedCount={admin.pinnedCount} onSectionChange={admin.setActiveSection} />

                <section className="island-admin-content">
                  {admin.activeSection === 'posts' ?
                    <AdminPostsPanel
                      posts={admin.posts}
                      selectedId={admin.selectedId}
                      selectedPost={admin.selectedPost}
                      form={admin.form}
                      loadingPosts={admin.loadingPosts}
                      saving={admin.saving}
                      setForm={admin.setForm}
                      onNewPost={admin.handleNewPost}
                      onRefresh={() => void admin.loadPosts()}
                      onSelectPost={admin.handleSelectPost}
                      onDeletePost={admin.setDeleteTarget}
                      onSave={admin.handleSave}
                    />
                  : null}

                  {admin.activeSection === 'music' ?
                    <AdminMusicPanel
                      musicForm={admin.musicForm}
                      saving={admin.saving}
                      setMusicForm={admin.setMusicForm}
                      onSaveMusic={() => void admin.handleSaveMusic()}
                    />
                  : null}

                  {admin.activeSection === 'site' ?
                    <AdminSitePanel
                      saving={admin.saving}
                      siteProfileForm={admin.siteProfileForm}
                      setSiteProfileForm={admin.setSiteProfileForm}
                      onSaveSiteProfile={admin.handleSaveSiteProfile}
                    />
                  : null}

                  {admin.activeSection === 'about' ?
                    <AdminAboutPanel
                      aboutContentForm={admin.aboutContentForm}
                      saving={admin.saving}
                      setAboutContentForm={admin.setAboutContentForm}
                      onSaveAboutContent={admin.handleSaveAboutContent}
                    />
                  : null}

                  {admin.activeSection === 'system' ?
                    <AdminSystemPanel
                      accountForm={admin.accountForm}
                      adminProfile={admin.adminProfile}
                      postsCount={admin.posts.length}
                      isLoggedIn={admin.isLoggedIn}
                      loadingPosts={admin.loadingPosts}
                      saving={admin.saving}
                      setAccountForm={admin.setAccountForm}
                      onCheck={() => void admin.loadPosts()}
                      onSaveAccount={admin.handleSaveAdminAccount}
                    />
                  : null}
                </section>
              </section>
            </>
          }
        </main>
      </div>

      <DeletePostModal post={admin.deleteTarget} saving={admin.saving} onClose={() => admin.setDeleteTarget(null)} onConfirm={() => void admin.handleConfirmDelete()} />
    </div>
  )
}
