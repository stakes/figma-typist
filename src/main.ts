import {
  formatErrorMessage,
  formatSuccessMessage
} from '@create-figma-plugin/utilities'

// thanks to https://github.com/yuanqing/figma-plugins for helping start this off
export default async function (): Promise<void> {
  if (figma.currentPage.selection.length === 0) {
    figma.closePlugin(formatErrorMessage('Select one or more text layers'))
    return
  }
  const nodes = figma.currentPage.selection.filter(function (node) {
    return node.type === 'TEXT'
  }) as Array<TextNode>
  if (nodes.length === 0) {
    figma.closePlugin(formatErrorMessage('No text layers in selection'))
    return
  }

  let components:ComponentNode[] = []

  for (const node of nodes) {
    const newComponents = await createVariantComponents(node)
    components.push(...newComponents)
  }
  const bigComponent = figma.combineAsVariants(components, figma.currentPage)
  bigComponent.layoutMode = 'VERTICAL'

  figma.closePlugin(
    formatSuccessMessage(
      `DONE!`
    )
  )
}

async function createVariantComponents(node: TextNode) {
  const fontNames = node.getRangeAllFontNames(0, node.characters.length)
  for (const fontName of fontNames) {
    await figma.loadFontAsync(fontName)
  }
  
  const words = node.characters.split(' ')
  let newComponents = []
  for (let i = 0; i < words.length; i++) {
    let newNode = node.clone()
    newNode.characters = words.slice(0, i + 1).join(' ')
    newNode.x = 0
    newNode.y = 0
    newNode.resize(node.width, node.height)
    const component = figma.createComponent()
    component.resize(newNode.width, newNode.height)
    component.appendChild(newNode)
    newComponents.push(component)
  }
  return newComponents
}
