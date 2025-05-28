export function getSubcategoryDbValue(value) {

    switch(value) {
        case 'shortText': return 'short_answer';
        case 'longText': return 'long_answer';
        case 'multipleChoice': return 'multiple_choice';
        case 'checkbox': return 'checkbox';
        case 'linearScale': return 'linear_scale';
    }
    return null;

}

export function getSubcategorySelectValue(value) {

    switch(value) {
        case 'short_answer': return 'shortText';
        case 'long_answer': return 'longText';
        case 'multiple_choice': return 'multipleChoice';
        case 'checkbox': return 'checkbox';
        case 'linear_scale': return 'linearScale';
    }
    return null;

}
