// src/ui.tsx
 
import { render, Container, Text, Muted, VerticalSpace, Button, RadioButtons, RadioButtonsOption, Divider, RangeSlider, Toggle } from '@create-figma-plugin/ui'
import { emit } from '@create-figma-plugin/utilities'
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
    const [speedValue, setSpeedValue] = useState<string>('2');
    const [randValue, setRandValue] = useState<boolean>(false);
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

    return (
        <Container space='medium'>
            <VerticalSpace space='extraLarge' />
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
            <VerticalSpace space='extraLarge' />
            <Button fullWidth onClick={handleClick}>Create component</Button>
        </Container>
    )
}
 
export default render(Plugin)