import { Button, Card, Icon } from 'animal-island-ui'
import { Home } from 'lucide-react'

import { IslandText } from '@/components/island'

type AdminLoginGateProps = {
  onLoginClick: () => void
  onHomeClick: () => void
}

export function AdminLoginGate({ onLoginClick, onHomeClick }: AdminLoginGateProps) {
  return (
    <section className="island-admin-login" aria-label="后台登录提示">
      <Card className="island-admin-login__card island-admin-login__guard">
        <div className="island-admin-login__icon">
          <Icon name="icon-helicopter" size={48} bounce />
        </div>
        <div className="island-admin-login__intro">
          <IslandText variant="caption" tone="red">
            需要先登岛哦～
          </IslandText>
        </div>
        <div className="island-admin-login__actions">
          <Button type="primary" htmlType="button" onClick={onLoginClick}>
            小岛通行
          </Button>
          <Button type="text" htmlType="button" icon={<Home size={15} strokeWidth={3} />} onClick={onHomeClick}>
            返回首页
          </Button>
        </div>
      </Card>
    </section>
  )
}
