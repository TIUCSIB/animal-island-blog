import { Button, Card } from 'animal-island-ui'
import { Compass, Home } from 'lucide-react'
import { useNavigate } from 'react-router'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <section className="island-not-found mx-auto w-full max-w-sm" aria-labelledby="not-found-title">
      <Card className="island-not-found__card">
        <div className="island-not-found__scene" aria-hidden="true">
          <span className="island-not-found__sun" />
          <span className="island-not-found__cloud island-not-found__cloud--left" />
          <span className="island-not-found__cloud island-not-found__cloud--right" />
          <span className="island-not-found__animal">🐾</span>
        </div>

        <div className="island-not-found__content">
          <span className="text-gray-400 text-xl font-bold">4 0 4 </span>
          <h1 id="not-found-title" className="my-2! text-xl! font-bold!">
            迷路到小岛边缘啦
          </h1>
          <p>这片叶子还没有长出来，先回首页看看照片吧。</p>
        </div>

        <div className="island-not-found__actions gap-8!">
          <Button type="primary" htmlType="button" icon={<Home size={15} strokeWidth={3} />} onClick={() => navigate('/')}>
            返回首页
          </Button>
          <Button type="dashed" htmlType="button" icon={<Compass size={15} strokeWidth={3} />} onClick={() => navigate('/about')}>
            关于小岛
          </Button>
        </div>
      </Card>
    </section>
  )
}
