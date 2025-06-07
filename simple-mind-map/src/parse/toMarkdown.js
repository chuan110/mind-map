import { walk, nodeRichTextToTextWithWrap } from '../utils'

const getNodeText = (data, level) => {
  const text = data.richText ? nodeRichTextToTextWithWrap(data.text) : data.text;
  if (!text.includes('\n')) {
    return text;
  }
  // 计算后续行的缩进：层级数-1个制表符 + 2个空格（对齐 '- ' 后的文本）
  const continuationIndent = new Array(level - 1).fill('\t').join('') + '  ';
  return text.split('\n').map((line, index) => {
    if (index === 0) return line;
    return continuationIndent + line;
  }).join('\n');
}

const getTitleMark = level => {
  return '-'
}

const getIndentMark = level => {
  return new Array(level - 1).fill('\t').join('') + '-'
}
// 转换成markdown格式
export const transformToMarkdown = root => {
  let content = ''
  walk(
    root,
    null,
    (node, parent, isRoot, layerIndex) => {
      const level = layerIndex + 1
      
      // 确保每个节点都在新行开始（除了第一个节点）
      if (content && !content.endsWith('\n')) {
        content += '\n';
      }
      
      content += getIndentMark(level)
      content += ' ' + getNodeText(node.data, level)
      // 概要
      const generalization = node.data.generalization
      if (Array.isArray(generalization)) {
        content += generalization.map(item => {
          return ` [${getNodeText(item)}]`
        })
      } else if (generalization && generalization.text) {
        const generalizationText = getNodeText(generalization)
      content += ` [${generalizationText}]`
      }

      // 备注
      if (node.data.note) {
        content += '\n' + getIndentMark(level) + ' ' + node.data.note;
      }
    },
    () => {},
    true
  )
  return content
}
