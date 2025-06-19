import React, { useState, useRef } from 'react';

// Simple custom useClickAway
function useClickAway(ref, handler) {
  React.useEffect(() => {
    function handleClick(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        handler(event);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [ref, handler]);
}

export default function InlineEditSection() {
  const [editable, setEditable] = useState(false);
  const [value, setValue] = useState("Section Name");
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  useClickAway(inputRef, () => {
    if (!editable) return;
    if (value.trim()) {
      setEditable(false); // exit edit mode if valid
      setError("");
    } else {
      setError("Section name required");
      setTimeout(() => inputRef.current && inputRef.current.focus(), 0);
    }
  });

  return (
    <div>
      {editable ? (
        <input
          ref={inputRef}
          value={value}
          autoFocus
          onChange={e => {
            setValue(e.target.value);
            setError("");
          }}
          // REMOVE onBlur!
        />
      ) : (
        <span
          onDoubleClick={() => setEditable(true)}
          style={{ border: "1px solid #eee", padding: "4px" }}
        >
          {value}
        </span>
      )}
      {editable && error && (
        <div style={{ color: "red", fontSize: 12 }}>{error}</div>
      )}
    </div>
  );
}