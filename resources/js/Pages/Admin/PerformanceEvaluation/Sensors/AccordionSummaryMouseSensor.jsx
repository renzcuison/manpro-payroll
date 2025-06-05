import { MouseSensor } from "@dnd-kit/core";

export class AccordionSummaryMouseSensor extends MouseSensor {
    static activators = [
        {
            eventName: "onMouseDown",
            handler: ({ nativeEvent: event }) => {
                if (event.button !== 0 || isInteractiveElement(event.target))
                    return false;
                return true;
            },
        },
    ];
}

function isInteractiveElement(element) {
    const interactiveElements = [
        "input",
        "textarea"
    ];
    if (
        element?.tagName &&
        interactiveElements.includes(element.tagName.toLowerCase())
    ) {
        return true;
    }

    return false;
}
