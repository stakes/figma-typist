// src/ui.tsx
 
import { render, Container, Text, Muted, VerticalSpace, Button, RadioButtons, RadioButtonsOption, Divider, RangeSlider, Toggle, Banner, IconInfo32, IconCheckCircle32, useInitialFocus } from '@create-figma-plugin/ui'
import { emit, on } from '@create-figma-plugin/utilities'
import { h } from 'preact'
import styles from './styles.css'
import { useState } from 'preact/hooks'
import { JSX } from 'preact';
 
function Plugin (props: { greeting: string }) {

    function handleClick() {
        const data = { type: typeValue, speed: speedValue, randomize: randValue }
        emit('CREATECOMPONENT', data)
    }
    const [typeValue, setTypeValue] = useState<string>('word');
    const [speedValue, setSpeedValue] = useState<string>('3');
    const [randValue, setRandValue] = useState<boolean>(false);
    const [selectedTextNodes, setSelectedTextNodes] = useState<number>(0);

    const options: Array<RadioButtonsOption> = [{
        children: <Text>Letter</Text>,
        value: 'letter'
    }, {
        children: <Text>Word</Text>,
        value: 'word'
    }, {
        children: <Text>Multiple Words</Text>,
        value: 'chunk'
    }];
    
    function handleTypeChange(event: JSX.TargetedEvent<HTMLInputElement>) {
        const newValue = event.currentTarget.value;
        setTypeValue(newValue);
    }

    function handleRangeChange(event: JSX.TargetedEvent<HTMLInputElement>) {
        const newValue = event.currentTarget.value;
        setSpeedValue(newValue);
    }

    function handleRandomizeToggle(newValue: boolean) {
        setRandValue(newValue);
    } 

    function handleSelectionChange(data: any) {
        console.log(data)
        console.log("cool")
        setSelectedTextNodes(data)
    }

    on('SELECTIONCHANGE', handleSelectionChange)

    return (
        <Container space='medium'>
            <VerticalSpace space='medium' />
            
            {selectedTextNodes !== 0 ? (
                <Banner icon={<IconCheckCircle32 />}>
                    <Text>{selectedTextNodes === 1 ? '1 text layer selected' : `${selectedTextNodes} text layers selected`}</Text>
                </Banner>
            ) : (
                <Banner style={{backgroundColor: "#F3F3F3"}} icon={<IconInfo32 />}>
                    <Text>Select a text layer to get started</Text>
                </Banner>
            )}
              
            <VerticalSpace space='extraLarge' class={styles.neutral} />
            <Text><Muted>Type by</Muted></Text>
            <VerticalSpace space='medium' />
            <RadioButtons onChange={handleTypeChange} options={options} value={typeValue} space="medium" />
            <VerticalSpace space='extraLarge' />
            <Divider />
            <VerticalSpace space='extraLarge' />
            <Text><Muted>Speed</Muted></Text>
            <VerticalSpace space='medium' />
            <RangeSlider increment={1} maximum={4} minimum={0} onInput={handleRangeChange} value={speedValue} />
            <VerticalSpace space='small' />
            <div class={styles.sliderTextContainer}>
                <div>
                    <Text>Slower</Text>
                </div>
                <div>
                    <Text>Faster</Text>
                </div>
            </div>
            <VerticalSpace space='extraLarge' />
            <Divider />
            <VerticalSpace space='extraLarge' />
            <Text><Muted>Randomness</Muted></Text>
            <VerticalSpace space='medium' />
            <Toggle onValueChange={handleRandomizeToggle} value={randValue}>
                <Text>Randomize typing speed</Text>
            </Toggle>
            <VerticalSpace space='extraLarge' />
            <VerticalSpace space='medium' />
            <Button fullWidth onClick={handleClick} disabled={selectedTextNodes === 0}>Create component</Button>
        </Container>
    )
}
 
export default render(Plugin)