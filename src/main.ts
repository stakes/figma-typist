import { cloneObject, formatErrorMessage, formatSuccessMessage, showUI, once } from '@create-figma-plugin/utilities';

export default async function (): Promise<void> {

  const options = { width: 240, height: 380 }

  const speeds = [0.200, 0.100, 0.050, 0.030, 0.010]

  showUI(options)

  async function handleCreateComponent(data:any) {

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
      const newComponents = await createVariantComponents(node, data)
      components.push(...newComponents)

      const bigComponent = figma.combineAsVariants(components, figma.currentPage)
      bigComponent.layoutMode = 'VERTICAL'
      bigComponent.x = node.x
      bigComponent.y = node.y + node.height + 100
      
      // speed randomization stuff
      let iterationCount = 0;
      let fastCount = 0;

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
            let speed = speeds[data.speed];
            
            console.log(data.randomize)
            if (data.randomize) {
              // Generate a random percentage between -50% and +50%
              let adjustment = 1 + (Math.random() - 0.8);
              // Adjust the speed by the random percentage
              speed *= adjustment;
              // Every 30 iterations, add a longer delay
              if (iterationCount % 30 === 0) {
                speed *= 6; // Adjust this factor as needed
              }
              // Every once in a while, do 5 very fast iterations in a row
              if (fastCount > 0) {
                speed /= 4; // Adjust this factor as needed
                fastCount--;
              } else if (Math.random() < 0.1) { 
                // 10% chance of starting fast iterations
                fastCount = 5;
              }
            }
            // Use the possibly adjusted speed value
            newReactions[0].trigger = {
              type: "AFTER_TIMEOUT",
              timeout: speed
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
      ))
    }

    once('CREATECOMPONENT', handleCreateComponent)

  }

  async function createVariantComponents(node: TextNode, data: any) {
    const fontNames = node.getRangeAllFontNames(0, node.characters.length)
    for (const fontName of fontNames) {
      await figma.loadFontAsync(fontName)
    }
    let words: string[] = []
    if (data.type == "word") {
      words = node.characters.split(' ')
    } else if (data.type == "letter") {
      words = node.characters.split('')
    } else if (data.type == "chunk") {
      words = node.characters.split(' ')
      words = splitIntoChunks(words)
    }
    let newComponents = []
    for (let i = 0; i < words.length; i++) {
      let newNode = node.clone()
      newNode.resize(node.width, node.height)
      newNode.textAutoResize = 'HEIGHT'
      if (data.type == "word" || data.type == "chunk") {
        newNode.characters = words.slice(0, i + 1).join(' ')
      } else if (data.type == "letter") {
        newNode.characters = words.slice(0, i + 1).join('')
      }
      newNode.x = 0
      newNode.y = 0
      const component = figma.createComponent()
      component.resize(newNode.width, newNode.height)
      component.appendChild(newNode)
      newComponents.push(component)
    }
    return newComponents
  }

  function splitIntoChunks(words:any) {
    const chunkSizes = [3, 4, 5]
    let result = []
    let currentIndex = 0
    while (currentIndex < words.length) {
      const randomIndex = Math.floor(Math.random() * chunkSizes.length)
      const chunkSize = chunkSizes[randomIndex]
      const chunk = words.slice(currentIndex, currentIndex + chunkSize)
      if (chunk.length > 0) {
          result.push(chunk.join(' '))
      }
      currentIndex += chunkSize;
  }

  return result

}
