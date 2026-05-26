import { useEffect } from 'react'

import { Color } from '@tiptap/extension-color'
import ImageExtension from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'
import { BackgroundColor, TextStyle } from '@tiptap/extension-text-style'
import Underline from '@tiptap/extension-underline'
import { Markdown } from '@tiptap/markdown'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

type IslandPostContentProps = {
  content: string
}

export function IslandPostContent({ content }: IslandPostContentProps) {
  const editor = useEditor({
    editable: false,
    extensions: [
      StarterKit.configure({
        trailingNode: false,
      }),
      TextStyle,
      Color.configure({
        types: [TextStyle.name],
      }),
      BackgroundColor.configure({
        types: [TextStyle.name],
      }),
      Underline,
      Link.configure({
        openOnClick: true,
      }),
      ImageExtension.configure({
        inline: true,
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Markdown,
    ],
    content: content || '',
    contentType: 'markdown',
    editorProps: {
      attributes: {
        class: 'island-gallery-post-content__editor',
      },
    },
  })

  useEffect(() => {
    if (!editor) return

    editor.commands.setContent(content || '', { contentType: 'markdown' })
  }, [content, editor])

  return (
    <div className="island-gallery-post-content">
      <EditorContent editor={editor} />
    </div>
  )
}
