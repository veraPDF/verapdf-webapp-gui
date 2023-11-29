import _ from 'lodash';
import errorTags from './data/validationErrorTags.json';

export const GROUPS = _.keys(errorTags);
export const TAGS = _.chain(errorTags)
    .values()
    .flatten()
    .value();
export const TAGS_NAMES = _.map(TAGS, ({ name }) => name);
