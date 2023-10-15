// src/ui.tsx
 
import { render, Container, Text, VerticalSpace, Button, SegmentedControl, SegmentedControlOption, Divider } from '@create-figma-plugin/ui'
import { emit } from '@create-figma-plugin/utilities'
import { h } from 'preact'
import { useState } from 'preact/hooks'
 
function Plugin (props: { greeting: string }) {
    function handleClick() {
        const data = { greeting: 'Hello, World!' }
        emit('CREATECOMPONENT', data)
    }
    const [value, setValue] = useState<string>('Word');
    const options: Array<SegmentedControlOption> = [{
        value: 'Word'
    }, {
        value: 'Chunk'
    }, {
        value: 'Letter'
    }];
    function handleChange(event: JSX.TargetedEvent<HTMLInputElement>) {
        const newValue = event.currentTarget.value;
        console.log(newValue);
        setValue(newValue);
    }
    return (
        <Container space='medium'>
            <VerticalSpace space='medium' />
            <Text>Create Text Component</Text>
            <VerticalSpace space='medium' />
            <SegmentedControl onChange={handleChange} options={options} value={value} />
            <VerticalSpace space='small' />
            <Button onClick={handleClick}>Text</Button>
            <Divider />
            <VerticalSpace space='medium' />
            <Text>Loading Spinners</Text>
            <VerticalSpace space='medium' />
        </Container>
    )
}
 
export default render(Plugin)