import { fromMarkdown } from 'mdast-util-from-markdown'

const getNodeText = node => {
  if (node.type === 'list') return '' // Lists are handled in transformMarkdownTo
  let textStr = ''

  ;(node.children || []).forEach((item, index, arr) => {
    if (['text', 'inlineCode'].includes(item.type)) {
      textStr += item.value || ''
      // Add a newline after text/inlineCode if it's not the last child
      if (index < arr.length - 1) {
         textStr += '\n';
      }
    } else if (item.type === 'break') {
      textStr += '\n'
    } else {
      // Assume other types need recursive processing
      textStr += getNodeText(item)
      // Add a newline after recursively processed children if not the last
      if (index < arr.length - 1) {
           textStr += '\n';
      }
    }
  })

  return textStr
}

// 处理list的情况
const handleList = node => {
  let list = []
  let walk = (arr, newArr) => {
    for (let i = 0; i < arr.length; i++) {
      let cur = arr[i]
      let node = {}
      node.data = {
        // 节点内容
        text: getNodeText(cur)
      }
      node.children = []
      newArr.push(node)
      if (cur.children.length > 1) {
        for (let j = 1; j < cur.children.length; j++) {
          let cur2 = cur.children[j]
          if (cur2.type === 'list') {
            walk(cur2.children, node.children)
          }
        }
      }
    }
  }
  walk(node.children, list)
  return list
}

// 将markdown转换成节点树
export const transformMarkdownTo = md => {
  const tree = fromMarkdown(md)
  let root = {
    children: []
  }
  let childrenQueue = [root.children]
  let currentChildren = root.children
  let depthQueue = [-1]
  let currentDepth = -1
  for (let i = 0; i < tree.children.length; i++) {
    let cur = tree.children[i]
    if (cur.type === 'heading' || cur.type === 'list') {
      let nodesToProcess = []
      if (cur.type === 'heading') {
        if (!cur.children[0]) continue
        nodesToProcess.push({ node: cur, depth: cur.depth })
      } else if (cur.type === 'list') {
        // Process list items
        let processListItems = (items, baseDepth) => {
          items.forEach(item => {
            nodesToProcess.push({ node: item, depth: baseDepth })
            if (item.children.length > 1) {
              for (let j = 1; j < item.children.length; j++) {
                let child = item.children[j]
                if (child.type === 'list') {
                  processListItems(child.children, baseDepth + 1)
                }
              }
            }
          })
        }
        processListItems(cur.children, currentDepth + 1) // Start list depth relative to currentDepth
      }

      nodesToProcess.forEach(({ node: currentNode, depth: currentItemDepth }) => {
        // 创建新节点
        let newNode = {}
        let nodeText = getNodeText(currentNode)
        let processedText = nodeText
        let isRichText = false

        // 如果文本包含换行符，转换为富文本的p标签结构
        if (nodeText.includes('\n')) {
          isRichText = true
          processedText = nodeText.split('\n').map(line => {
            // 将空行转换为<p><br></p>以保留垂直间距
            return line === '' ? '<p><br></p>' : `<p>${line}</p>`;
          }).join('');
        }

        newNode.data = {
          // 节点内容
          text: processedText
        }
        // 如果标记为富文本，则设置richText属性
        if (isRichText) {
          newNode.data.richText = true
        }
        newNode.children = []

        // 如果当前的层级大于上一个节点的层级，那么是其子节点
        if (currentItemDepth > currentDepth) {
          // 添加到上一个节点的子节点列表里
          currentChildren.push(newNode)
          // 更新当前栈和数据
          childrenQueue.push(newNode.children)
          currentChildren = newNode.children
          depthQueue.push(currentItemDepth)
          currentDepth = currentItemDepth
        } else if (currentItemDepth === currentDepth) {
          // 如果当前层级等于上一个节点的层级，说明它们是同级节点
          // 将上一个节点出栈
          childrenQueue.pop()
          currentChildren = childrenQueue[childrenQueue.length - 1]
          depthQueue.pop()
          currentDepth = depthQueue[depthQueue.length - 1]
          // 追加到上上个节点的子节点列表里
          currentChildren.push(newNode)
          // 更新当前栈和数据
          childrenQueue.push(newNode.children)
          currentChildren = newNode.children
          depthQueue.push(currentItemDepth)
          currentDepth = currentItemDepth
        } else {
          // 如果当前层级小于上一个节点的层级，那么一直出栈，直到遇到比当前层级小的节点
          while (depthQueue.length) {
            childrenQueue.pop()
            currentChildren = childrenQueue[childrenQueue.length - 1]
            depthQueue.pop()
            currentDepth = depthQueue[depthQueue.length - 1]
            if (currentDepth < currentItemDepth) {
              // 追加到该节点的子节点列表里
              currentChildren.push(newNode)
              // 更新当前栈和数据
              childrenQueue.push(newNode.children)
              currentChildren = newNode.children
              depthQueue.push(currentItemDepth)
              currentDepth = currentItemDepth
              break
            }
          }
        }
      })
    }
  }
  return root.children[0]
}
