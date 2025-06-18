import { MouseSensor } from "@dnd-kit/core";

export class SectionDropdownMouseSensor extends MouseSensor {
    static activators = [
        {
            eventName: "onMouseDown",
            handler: ({ nativeEvent: event }) => {
                if(event.button !== 0) return false;
                const element = event.target;
                if(!element) return false;
                if(element.tagName.toLowerCase() === 'input') return false;
                if(!element.closest('.section-dropdown')) return false;
                return true;
            },
        },
    ];
}
