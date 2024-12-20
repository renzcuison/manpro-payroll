function BlockHeader({ title, options }) {
    return (
        <div className="block-header">
            <div className="block-title">{title}</div>
            {options ?? <div className="block-options">{options}</div>}
        </div>
    );
}

export default BlockHeader;
