import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import ExcalidrawNode from './ExcalidrawNode';

export default Node.create({
  name: 'excalidraw',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      url: {
        default: null,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="excalidraw"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'excalidraw' })]
  },

  addNodeView() {
    return ReactNodeViewRenderer(ExcalidrawNode)
  },
})
