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
      if (content && !content.endsWith('\n')) {
        content += '\n';
      }
      content += getIndentMark(level);
      content += ' ' + getNodeText(node.data, level).trimEnd();
    },
    () => {},
    true
  )
  return content
}
