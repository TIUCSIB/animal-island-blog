import { Button, Loading } from 'animal-island-ui'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

import { PostDetailDesktop } from '@/pages/post-detail/PostDetailDesktop'
import { PostDetailMobile } from '@/pages/post-detail/PostDetailMobile'
import { usePostDetailPage } from '@/pages/post-detail/usePostDetailPage'

export default function PostDetailPage() {
  const detail = usePostDetailPage()

  useDocumentTitle(detail.post?.title || '')

  if (detail.isPending) {
    return (
      <main className="grid min-h-dvh place-items-center bg-[radial-gradient(circle_at_top,#eefcf2_0%,#dff3e7_100%)]" role="status" aria-label="文章详情加载中">
        <Loading active />
      </main>
    )
  }

  if (!detail.post) {
    return (
      <main className="grid min-h-dvh place-items-center bg-[radial-gradient(circle_at_top,#eefcf2_0%,#dff3e7_100%)] p-5">
        <div className="grid w-[min(360px,calc(100vw-40px))] justify-items-center gap-3 rounded-[28px] bg-white/80 p-7 text-center text-[#6b5a43] shadow-[0_18px_40px_rgba(82,108,89,0.16)]">
          <strong className="text-xl font-black">这篇文章不见啦</strong>
          <span className="text-[#8b7860]">可能已经被删除，或者小岛暂时迷路了。</span>
          <Button type="primary" size="small" onClick={detail.goHome}>
            返回首页
          </Button>
        </div>
      </main>
    )
  }

  if (detail.isCompact) {
    return <PostDetailMobile detail={detail} />
  }

  return <PostDetailDesktop detail={detail} />
}
