export type AdminSticker = {
  alt: string
  src: string
}

export type AdminStickerPack = {
  id: string
  label: string
  stickers: AdminSticker[]
}

export const stickerPacks: AdminStickerPack[] = [
  {
    id: 'zhihu',
    label: '知乎表情',
    stickers: [
      { alt: '感谢', src: '/stickers/zhihu/01.png' },
      { alt: '哇', src: '/stickers/zhihu/02.png' },
      { alt: '打招呼', src: '/stickers/zhihu/03.png' },
      { alt: '握手', src: '/stickers/zhihu/04.png' },
      { alt: '知乎益蜂', src: '/stickers/zhihu/05.png' },
      { alt: '百分百赞', src: '/stickers/zhihu/06.png' },
      { alt: '为爱发乎', src: '/stickers/zhihu/07.png' },
      { alt: '脑爆', src: '/stickers/zhihu/08.png' },
      { alt: '暗中学习', src: '/stickers/zhihu/09.png' },
      { alt: '匿了', src: '/stickers/zhihu/10.png' },
      { alt: '谢邀', src: '/stickers/zhihu/11.png' },
      { alt: '赞同', src: '/stickers/zhihu/12.png' },
      { alt: '蹲', src: '/stickers/zhihu/13.png' },
      { alt: '爱', src: '/stickers/zhihu/14.png' },
      { alt: '耶', src: '/stickers/zhihu/15.png' },
      { alt: '惊喜', src: '/stickers/zhihu/16.png' },
      { alt: '思考', src: '/stickers/zhihu/17.png' },
      { alt: '酷', src: '/stickers/zhihu/18.png' },
      { alt: '大笑', src: '/stickers/zhihu/19.png' },
      { alt: '微笑', src: '/stickers/zhihu/20.png' },
      { alt: '捂脸', src: '/stickers/zhihu/21.png' },
      { alt: '捂嘴', src: '/stickers/zhihu/22.png' },
      { alt: '飙泪笑', src: '/stickers/zhihu/23.png' },
      { alt: '害羞', src: '/stickers/zhihu/24.png' },
      { alt: '可怜', src: '/stickers/zhihu/25.png' },
      { alt: '好奇', src: '/stickers/zhihu/26.png' },
      { alt: '流泪', src: '/stickers/zhihu/27.png' },
      { alt: '大哭', src: '/stickers/zhihu/28.png' },
      { alt: '生气', src: '/stickers/zhihu/29.png' },
      { alt: '惊讶', src: '/stickers/zhihu/30.png' },
      { alt: '调皮', src: '/stickers/zhihu/31.png' },
      { alt: '衰', src: '/stickers/zhihu/32.png' },
      { alt: '发呆', src: '/stickers/zhihu/33.png' },
      { alt: '机智', src: '/stickers/zhihu/34.png' },
      { alt: '嘘', src: '/stickers/zhihu/35.png' },
      { alt: '尴尬', src: '/stickers/zhihu/36.png' },
      { alt: '小情绪', src: '/stickers/zhihu/37.png' },
      { alt: '为难', src: '/stickers/zhihu/38.png' },
      { alt: '吃瓜', src: '/stickers/zhihu/39.png' },
      { alt: '语塞', src: '/stickers/zhihu/40.png' },
      { alt: '看看你', src: '/stickers/zhihu/41.png' },
      { alt: '撇嘴', src: '/stickers/zhihu/42.png' },
      { alt: '魔性笑', src: '/stickers/zhihu/43.png' },
      { alt: '潜水', src: '/stickers/zhihu/44.png' },
      { alt: '口罩', src: '/stickers/zhihu/45.png' },
      { alt: '开心', src: '/stickers/zhihu/46.png' },
      { alt: '滑稽', src: '/stickers/zhihu/47.png' },
      { alt: '笑哭', src: '/stickers/zhihu/48.png' },
      { alt: '白眼', src: '/stickers/zhihu/49.png' },
      { alt: '红心', src: '/stickers/zhihu/50.png' },
      { alt: '柠檬', src: '/stickers/zhihu/51.png' },
      { alt: '拜托', src: '/stickers/zhihu/52.png' },
      { alt: '赞', src: '/stickers/zhihu/53.png' },
      { alt: '发火', src: '/stickers/zhihu/54.png' },
      { alt: '不抬杠', src: '/stickers/zhihu/55.png' },
      { alt: '种草', src: '/stickers/zhihu/56.png' },
      { alt: '抱抱', src: '/stickers/zhihu/57.png' },
      { alt: 'doge', src: '/stickers/zhihu/58.png' },
    ],
  },
]
