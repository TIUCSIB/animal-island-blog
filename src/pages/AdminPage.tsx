import { useNavigate } from 'react-router'

import { AdminAboutPanel } from './admin/about/AdminAboutPanel'
import { AdminLoginGate } from './admin/auth/AdminLoginGate'
import { AdminMusicPanel } from './admin/music/AdminMusicPanel'
import { AdminPostsPanel } from './admin/posts/AdminPostsPanel'
import { AdminSidebar } from './admin/layout/AdminSidebar'
import { AdminSitePanel } from './admin/site/AdminSitePanel'
import { AdminSystemPanel } from './admin/system/AdminSystemPanel'
import { DeletePostModal } from './admin/posts/DeletePostModal'
import { AdminTopbar } from './admin/layout/AdminTopbar'
import { useAdminDashboard } from './admin/useAdminDashboard'
import './admin/admin.css'

export default function AdminPage() {
  const navigate = useNavigate()
  const admin = useAdminDashboard()
  const showAdminShell = admin.isLoggedIn || admin.isRestoringSession
  const showLoginView = !showAdminShell

  return (
    <div className={['island-admin-page', showLoginView && 'island-admin-page--login'].filter(Boolean).join(' ')}>
      <div className="island-admin-page__shell">
        <main className="island-admin-page__main">
          {!showAdminShell ?
            <AdminLoginGate onLoginClick={admin.openLoginModal} onHomeClick={() => navigate('/')} />
          : <>
              <AdminTopbar account={admin.adminProfile?.account ?? admin.accountForm.account} profile={admin.siteProfileForm} onHomeClick={() => navigate('/')} onLogout={admin.handleLogout} />

              <section className="island-admin-layout">
                <AdminSidebar activeSection={admin.activeSection} postsCount={admin.postsTotal} pinnedCount={admin.pinnedCount} onSectionChange={admin.handleSectionChange} />

                <section className="island-admin-content ">
                  {admin.activeSection === 'write' ?
                    <AdminPostsPanel
                      mode="write"
                      posts={admin.posts}
                      page={admin.postPage}
                      pageSize={admin.postPageSize}
                      total={admin.postsTotal}
                      selectedPost={null}
                      form={admin.form}
                      token={admin.token}
                      loadingPosts={admin.loadingPosts}
                      saving={admin.saving}
                      setForm={admin.setForm}
                      onPageChange={(page) => void admin.loadPosts(page)}
                      onRefresh={() => void admin.loadPosts(admin.postPage)}
                      onSelectPost={admin.handleSelectPost}
                      onCloseEditor={admin.handleClosePostEditor}
                      onDeletePost={admin.setDeleteTarget}
                      onSave={admin.handleSave}
                    />
                  : null}

                  {admin.activeSection === 'posts' ?
                    <AdminPostsPanel
                      mode="manage"
                      posts={admin.posts}
                      page={admin.postPage}
                      pageSize={admin.postPageSize}
                      total={admin.postsTotal}
                      selectedPost={admin.selectedPost}
                      form={admin.form}
                      token={admin.token}
                      loadingPosts={admin.loadingPosts}
                      saving={admin.saving}
                      setForm={admin.setForm}
                      onPageChange={(page) => void admin.loadPosts(page)}
                      onRefresh={() => void admin.loadPosts(admin.postPage)}
                      onSelectPost={admin.handleSelectPost}
                      onCloseEditor={admin.handleClosePostEditor}
                      onDeletePost={admin.setDeleteTarget}
                      onSave={admin.handleSave}
                    />
                  : null}

                  {admin.activeSection === 'music' ?
                    <AdminMusicPanel musicForm={admin.musicForm} saving={admin.saving} setMusicForm={admin.setMusicForm} onSaveMusic={() => void admin.handleSaveMusic()} />
                  : null}

                  {admin.activeSection === 'site' ?
                    <AdminSitePanel token={admin.token} saving={admin.saving} siteProfileForm={admin.siteProfileForm} setSiteProfileForm={admin.setSiteProfileForm} onSaveSiteProfile={admin.handleSaveSiteProfile} />
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
                      postsCount={admin.postsTotal}
                      isLoggedIn={showAdminShell}
                      checkingSystem={admin.checkingSystem}
                      systemChecks={admin.systemChecks}
                      saving={admin.saving}
                      setAccountForm={admin.setAccountForm}
                      onCheck={() => void admin.handleSystemCheck()}
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
