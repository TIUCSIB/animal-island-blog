export type GalleryPost = {
  id: string
  imageSrc: string
  images?: string[]
  title: string
  content: string
  location: string
  time: string
  tags: string[]
  pinned?: boolean
}

export const galleryPosts: GalleryPost[] = [
  {
    id: 'night-street',
    imageSrc: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee',
    images: [
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee',
      'https://images.unsplash.com/photo-1493246507139-91e8fad9978e',
      'https://images.unsplash.com/photo-1485827404703-89bef8c9f074',
    ],
    title: '夜晚街道',
    content: '下班以后路过这条街，灯光刚好落在树影和路面之间。那一刻很安静，像给今天按下了暂停键。',
    location: 'Taipei',
    time: '2026-05-01',
    tags: ['夜晚', '街道', '散步'],
    pinned: true,
  },
  {
    id: 'island-daily',
    imageSrc: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e',
    title: '小岛日常',
    content: '天气很好，风也很轻。拍下这张图的时候，感觉生活可以不用太用力，慢慢来就好。',
    location: '北京',
    time: '2026-05-03',
    tags: ['日常', '小岛', '晴天'],
  },
  {
    id: 'quiet-corner',
    imageSrc: 'https://images.unsplash.com/photo-1485827404703-89bef8c9f074',
    title: '安静角落',
    content: '偶然遇到的角落，颜色和光线都很温柔。适合发呆，也适合记录。',
    location: 'Shanghai',
    time: '2026-05-12',
    tags: ['记录', '角落', '温柔'],
  },
  {
    id: 'sunset-beach',
    imageSrc: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
    title: '日落 beach',
    content: '拍下这张图，感觉自己被拍得那么美，被拍得那么Good。',
    location: 'Tokyo',
    time: '2026-05-15',
    tags: [' beach', '日落', 'Good'],
  },
  {
    id: 'sunset-city',
    imageSrc: 'https://images.unsplash.com/photo-1501477134778-074e09d4e68d',
    title: '日落 city',
    content: '拍下这张图，感觉自己被拍得那么美，被拍得那么Good。',
    location: 'New York',
    time: '2026-05-18',
    tags: [' city', '日落', 'Good'],
  },
  {
    id: 'sunset-forest',
    imageSrc: 'https://images.unsplash.com/photo-1501555088652-6610b6b32f0a',
    title: '日落 forest',
    content: '拍下这张图，感觉自己被拍得那么美，被拍得那么Good。',
    location: 'Los Angeles',
    time: '2026-05-21',
    tags: [' forest', '日落', 'Good'],
  },
  {
    id: 'sunset-mountain',
    imageSrc: 'https://images.unsplash.com/photo-1501613456185-c6c1f0b7a0c3',
    title: '日落 mountain',
    content: '拍下这张图，感觉自己被拍得那么美，被拍得那么Good。',
    location: 'Paris',
    time: '2026-05-24',
    tags: [' mountain', '日落', 'Good'],
  },
]
