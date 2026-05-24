import { Modal, Typewriter } from 'animal-island-ui'

import './island.css'

export interface IslandAboutModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function IslandAboutModal({ open, onOpenChange }: IslandAboutModalProps) {
  return (
    <Modal
      open={open}
      title="关于小岛"
      width="min(430px, calc(100vw - 32px))"
      footer={null}
      maskClosable
      typewriter={false}
      className="island-about-modal"
      onClose={() => onOpenChange(false)}
    >
      <div className="island-about-modal__content">
        <div className="island-about-modal__mascot" aria-hidden="true">
          🐶
        </div>

        <p>
          <Typewriter speed={42} trigger={open}>
            这里是 mewbarkjoy 的图片小岛，用来收集日常、旅行、风景和一些平淡但可爱的瞬间。
          </Typewriter>
        </p>

        <div className="island-about-modal__facts">
          <span>喜欢独处</span>
          <span>喜欢小狗</span>
          <span>平淡就是幸福</span>
        </div>
      </div>
    </Modal>
  )
}
