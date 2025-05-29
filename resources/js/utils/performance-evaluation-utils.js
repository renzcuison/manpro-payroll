export function getSubcategoryDbValue(value) {

    switch(value) {
        case 'short_answer':
        case 'shortText':
            return 'short_answer';
        case 'long_answer':
        case 'longText':
            return 'long_answer';
        case 'multiple_choice':
        case 'multipleChoice':
            return 'multiple_choice';
        case 'checkbox':
            return 'checkbox';
        case 'linear_scale':
        case 'linearScale':
            return 'linear_scale';
    }
    return '';

}

export function getSubcategorySelectValue(value) {

    switch(value) {
        case 'short_answer':
        case 'shortText':
            return 'shortText';
        case 'long_answer':
        case 'longText':
            return 'longText';
        case 'multiple_choice':
        case 'multipleChoice':
            return 'multipleChoice';
        case 'checkbox':
            return 'checkbox';
        case 'linear_scale':
        case 'linearScale':
            return 'linearScale';
    }
    return '';

}
