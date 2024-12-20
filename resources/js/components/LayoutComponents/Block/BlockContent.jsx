function BlockContent({ children, style }) {
    return (
        <div className="block-content" style={style}>
            {children}
        </div>
    );
}

export default BlockContent;
