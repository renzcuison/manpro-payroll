import { MouseSensor } from "@dnd-kit/core";

export class OptionMouseSensor extends MouseSensor {
    static activators = [
        {
            eventName: "onMouseDown",
            handler: ({ nativeEvent: event }) => {
                if(event.button !== 0) return false;
                const element = event.target;
                if(!element) return false;
                if(element.tagName.toLowerCase() === 'input') return false;
                if(!element.closest('.option-dragger')) return false;
                return true;
            },
        },
    ];
}
