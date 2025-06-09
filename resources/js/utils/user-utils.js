export function getFullName({ last_name, first_name, middle_name }) {
    if(!last_name || !first_name) return undefined;
    return `${last_name}, ${first_name}${middle_name ? ' ' + middle_name : ''}`;
}