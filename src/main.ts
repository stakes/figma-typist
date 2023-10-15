import { cloneObject, formatErrorMessage, formatSuccessMessage, showUI, once } from '@create-figma-plugin/utilities';

export default async function (): Promise<void> {


  const options = { width: 240, height: 120 }
  const data = { greeting: 'Hello, World!' }
  showUI(options, data)

  function handleCreateTextComponent(data) {
    console.log(data) //=> { greeting: 'Hello, World!' }
  }

  async function handleCreateComponent(data) {
    // thanks to https://github.com/yuanqing/figma-plugins for helping start this off
    // if there's no selection, show an error message
    // if the selection isn't text, also show an error message
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

    let componentCount = 0
    
    for (const node of nodes) {
      let components: ComponentNode[] = []
      const newComponents = await createVariantComponents(node)
      components.push(...newComponents)

      const bigComponent = figma.combineAsVariants(components, figma.currentPage)
      bigComponent.layoutMode = 'VERTICAL'
      bigComponent.x = node.x
      bigComponent.y = node.y + node.height + 100

      for (let i = 0; i < bigComponent.children.length-1; i++) {
        const child = bigComponent.children[i];
        const nextChild = bigComponent.children[i+1];
        if (child && child.type === 'COMPONENT') {
          let newReactions = cloneObject(child.reactions) as any
          newReactions[0] = {actions: null, trigger: null}
          if (newReactions) {
            newReactions[0].actions = [{
              type: "NODE",
              destinationId: nextChild.id,
              navigation: "CHANGE_TO",
              transition: null,
              resetVideoPosition: false
            }]
            newReactions[0].trigger = {
              type: "AFTER_TIMEOUT",
              timeout: 0.030
            }
          }
          child.reactions = newReactions
        }
      }
      componentCount++
    }

    let confStr = componentCount > 1 ? `${componentCount} new components` : 'a new component'

    figma.closePlugin(
      formatSuccessMessage(
        `Created ${confStr}`
      )
    )
  }

  once('CREATECOMPONENT', handleCreateComponent)

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
    newNode.resize(node.width, node.height)
    newNode.textAutoResize = 'HEIGHT'
    newNode.characters = words.slice(0, i + 1).join(' ')
    newNode.x = 0
    newNode.y = 0
    const component = figma.createComponent()
    component.resize(newNode.width, newNode.height)
    component.appendChild(newNode)
    newComponents.push(component)
  }
  return newComponents
}