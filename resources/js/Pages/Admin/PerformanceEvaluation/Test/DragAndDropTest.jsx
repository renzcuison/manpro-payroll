import {
    DndContext, DragOverlay, useDraggable, useDroppable
} from "@dnd-kit/core";
import { restrictToFirstScrollableAncestor, restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { useState } from "react";



function Droppable(props) {
    const {isOver, setNodeRef} = useDroppable({
        id: props.id,
        data: {
            order: props.order,
            index: props.index,
            indexActive: props.indexActive
        }
    });
    const allowable = isOver && props.indexActive != props.index;
    const style = {
        display:'block',
        background: allowable ? 'green' : 'yellow',
        height: allowable ? '100px' : undefined
    };
    return <div style={ style } ref={setNodeRef}>{ props.children }</div>
}

function Draggable(props) {
    const {attributes, listeners, setNodeRef, transform} = useDraggable({
        id: props.id,
        data: {
            order: props.order,
            index: props.index
        }
    });
    const style = {
        width: `300px`,
        height: `50px`,
        background: 'red',
        color: 'white',
        margin: '.25em 0'
    }
    if(transform) style.transform = `translate3d(${transform.x}px, ${transform.y}px, 0)`
    return <div ref={setNodeRef} style={style} {...listeners} {...attributes}>{props.children}{props.indexActive}</div>
}

export default function DragAndDropTest() {
    const [data, setData] = useState([
        {order:1, value:"a"}, {order:2, value:"b"}, {order:3, value:"c"}
    ]);
    const [indexActive, setIndexActive] = useState(null);

    function handleDragStart(event) {
        if(!event) return;
        setIndexActive(event.active.data.current.index);
    }

    function handleDragEnd(event) {
        if(!event.over) return;
        const
            {
                active: { data: { current: { index: indexActive, order: orderActive } } },
                over: { data: { current: { index: indexOver, order: orderOver } } },
            } = event
        ;
        const moveUp = indexActive < indexOver;
        for(
            let index = moveUp ? indexActive + 1 : indexActive - 1;
            moveUp ? (index <= indexOver) : (index >= indexOver);
            index += (moveUp ? 1 : -1) * 1
        ) {
            const item = data[index];
            item.order = index + (moveUp ? 0 : 2);
        }
        const removed = data.splice(indexActive, 1)[0];
        removed.order = indexOver + 1;
        data.splice(indexOver, 0, removed);
        setData([...data]);
        setIndexActive(null);
    }

    return <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} modifiers={[restrictToFirstScrollableAncestor, restrictToVerticalAxis]}>
        <div style={{
            width:'500px',height:'500px',overflow:"auto",background:'pink'
        }}>
            {
                data.map(
                    ({order, value}, index) => <Droppable id={value} key={value} order={order} index={index} indexActive={indexActive}>
                        <Draggable id={value} order={order} index={index}>
                            Value: {value}<br/>
                            Order: {order}
                        </Draggable>
                    </Droppable>
                )
            }

        </div>
        
    </DndContext>;
}
