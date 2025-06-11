import { useSortable } from '@dnd-kit/sortable';

export default function Sortable(props) {
    const {
        attributes, listeners, transform, transition,
        setNodeRef
    } = useSortable({
        id: props.id,
        data: { order: props.order }
    });
    const { x = 0, y = 0 } = transform ?? {};
    const isDragging = ( props.draggedId === props.id );
    const style = {
        transform: `translate(${ x }px, ${ y }px)`,
        transition,
        position: isDragging ? "relative" : "inherit",
        zIndex: isDragging ? 1 : 0
    };
    return (
        <div ref={ setNodeRef } style={ style } { ...attributes } { ...listeners }>
            { props.children }
        </div>
    );
}
