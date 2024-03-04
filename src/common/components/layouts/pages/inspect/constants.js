import _ from 'lodash';
import errorTags from './validationErrorTags.json';

export const GROUPS = _.keys(errorTags);
export const TAGS = _.chain(errorTags)
    .values()
    .flatten()
    .value();
export const TAGS_NAMES = _.map(TAGS, ({ name }) => name);

export const scaleOptions = {
    advanced: [{ label: 'auto-fit', value: 'auto' }],
    basic: [
        { label: '50%', value: '0.5' },
        { label: '75%', value: '0.75' },
        { label: '100%', value: '1' },
        { label: '150%', value: '1.5' },
        { label: '200%', value: '2' },
        { label: '250%', value: '2.5' },
        { label: '300%', value: '3' },
    ],
};
export const scaleBasicValues = scaleOptions.basic.map(({ value }) => value);
export const scaleAdvancedValues = scaleOptions.advanced.map(({ value }) => value);
