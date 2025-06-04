import { Fragment } from 'react';
import { useSortable } from '@dnd-kit/sortable';

export default function Sortable(props) {
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
