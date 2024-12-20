export function capitalize(text) {
    var i, words, w, result = '';

    words = text.split(' ');

    for (i = 0; i < words.length; i += 1) {
        w = words[i];
        result += w.substr(0, 1).toUpperCase() + w.substr(1);
        if (i < words.length - 1) {
            result += ' ';    // Add the spaces back in after splitting
        }
    }

    return result;
}