import { useEffect, useRef, useState } from "react";

export function useClickHandler({
    onSingleClick, onDoubleClick,
    wait = 250
}) {

    const [waiting, setWaiting] = useState(false);
    const waitingRef = useRef(waiting);

    async function onClick() {
        if(!waiting) {
            setWaiting(true);
            setTimeout(function() {
                if(waitingRef.current) onSingleClick();
                setWaiting(false);
            }, wait);
            return;
        }
        onDoubleClick();
        setWaiting(false);
    }

    useEffect(() => {
        waitingRef.current = waiting;
    }, [waiting]);

    return [onClick];

}
