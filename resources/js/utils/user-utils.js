export function getFullName({ last_name, first_name, middle_name, suffix }) {
    if(!last_name || !first_name) return undefined;
    return `${last_name}, ${first_name}${middle_name ? ' ' + middle_name : ''}${suffix ? ' ' + suffix : ''}`;
}
