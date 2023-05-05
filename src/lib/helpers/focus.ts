export function focus(node) {
    node.focus();
    return {
        destroy: () => { }
    };
}