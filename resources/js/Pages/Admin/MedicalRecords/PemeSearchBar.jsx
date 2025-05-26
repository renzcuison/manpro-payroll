import { useState } from "react";

const PemeSearchBar = ({ onSearch, placeholder = "Search..." }) => {
  const [query, setQuery] = useState("");

  const handleChange = (e) => {
    setQuery(e.target.value);
    if (onSearch) onSearch(e.target.value);
  };

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      margin: "16px 0"
    }}>
      <span style={{ marginRight: 8, fontSize: "1.5em" }}>🔍</span>
      <input
        type="text"
        value={query}
        placeholder={placeholder}
        onChange={handleChange}
        style={{
          flex: 1,
          padding: "8px 12px",
          border: "1px solid #ccc",
          borderRadius: "4px",
          fontSize: "1em"
        }}
      />
    </div>
  );
};

export default PemeSearchBar;