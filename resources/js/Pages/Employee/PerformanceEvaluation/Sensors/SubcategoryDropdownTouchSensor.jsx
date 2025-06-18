import { TouchSensor } from "@dnd-kit/core";

export class SubcategoryDropdownTouchSensor extends TouchSensor {
    static activators = [
        {
            eventName: "onTouchStart",
            handler: ({ nativeEvent: event }) => {
                const element = event.target;
                if(!element) return false;
                if(element.tagName.toLowerCase() === 'input') return false;
                if(!element.closest('.subcategory-dropdown')) return false;
                return true;
            },
        },
    ];
}
