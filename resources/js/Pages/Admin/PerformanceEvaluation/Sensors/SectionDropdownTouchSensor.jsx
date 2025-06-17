import { TouchSensor } from "@dnd-kit/core";

export class SectionDropdownTouchSensor extends TouchSensor {
    static activators = [
        {
            eventName: "onTouchStart",
            handler: ({ nativeEvent: event }) => {
                const element = event.target;
                if(!element) return false;
                if(element.tagName.toLowerCase() === 'input') return false;
                if(!element.closest('.section-dropdown')) return false;
                return true;
            },
        },
    ];
}
