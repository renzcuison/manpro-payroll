import {
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy
} from '@dnd-kit/sortable';
import {
    DndContext, 
    closestCenter,
    KeyboardSensor,
    MouseSensor,
    TouchSensor,
    useDraggable,
    useDroppable,
    useSensor,
    useSensors
} from '@dnd-kit/core';
import { restrictToFirstScrollableAncestor, restrictToVerticalAxis } from '@dnd-kit/modifiers';
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

function Sortable(props) {
    const {
        attributes, listeners, transform, transition,
        setNodeRef
    } = useSortable({
        id: props.id,
        data: { order: props.order }
    });
    const { x = 0, y = 0, scaleX = 1, scaleY = 1 } = transform ?? {};
    const style = {
        transform: `translate(${ x }px, ${ y }px) scale(${ scaleX }, ${ scaleY })`,
        transition
    };
    return (
        <div ref={ setNodeRef } style={ style } { ...attributes } { ...listeners }>
            { props.children }
        </div>
    );

}

export default function DragAndDropTest() {
    const style={
        display: 'block',
        width: '500px',
        height: '50px',
        background: 'pink',
        margin: '10px 0'
    }
    const [items, setItems] = useState([
        { content: <div style={{color:'red',...style}}>A</div>, order: 1, yh: "feef" },
        { content: <div style={{color:'green',...style}}>B</div>, order: 2, yh: "i8u" },
        { content: <div style={{color:'blue',...style}}>C</div>, order:3, yh: "efe" }
    ]);
    const [dragging, setDragging] = useState(false);
    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 10 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    function handleDragEnd(event) {
        setDragging(false);
        if(!event.active || !event.over) return;
        const {
            active: { data: { current: { order: orderActive } } },
            over: { data: { current: { order: orderOver } } },
        } = event;
        if( orderActive === orderOver ) return;
        const moveUp = orderActive < orderOver;
        for(
            let order = moveUp ? orderActive + 1 : orderActive - 1;
            moveUp ? (order <= orderOver) : (order >= orderOver);
            order += (moveUp ? 1 : -1) * 1
        ) {
            const item = items[order - 1];
            item.order = order + (moveUp ? -1 : 1);
        }
        const removed = items.splice(orderActive - 1, 1)[0];
        removed.order = orderOver;
        items.splice(orderOver - 1, 0, removed);
        setItems([...items]);
    }

    function handleDragStart() {
        setDragging(true);
    }
    const items2 = items.map(item => ({...item, id: item.yh}))

    return <DndContext
        sensors={ sensors }
        collisionDetection={ closestCenter }
        onDragStart={ handleDragStart }
        onDragEnd={ handleDragEnd }
        modifiers={[restrictToFirstScrollableAncestor, restrictToVerticalAxis]}
    ><SortableContext items={ items2 } strategy={ verticalListSortingStrategy }>
        <div style={{
            background:'yellow',height:'500px',width:'500px',display:'block',overflow:'auto'
        }}>{
            items2.map(({ id, content, order, yh}) =>
                <Sortable key={yh} id={yh} order={order}>
                    { content }
                </Sortable>
            )
        }</div>
    </SortableContext></DndContext>;
}

function DragAndDropTestOld() {
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
