import _ from 'lodash';

const TREEPATH = '/StructTreeRoot';
const IdStringRegExp = new RegExp(/\(\d+ \d+ [^()[\]]+\)/g);

const getIdStringsFromContext = (treeName, context) => {
    if (`/${context.split('/').at(-1)}`.startsWith(TREEPATH)) {
        return null;
    }
    const idStrings = (context.split(TREEPATH)[1].match(IdStringRegExp) || []).filter(
        item => !item.includes(TREEPATH.slice(1))
    );
    return idStrings
        .filter((idStr, index) => {
            if (index === 0) return !idStr.includes(treeName);
            return true;
        })
        .map(id => {
            const parsedId = id.slice(1, -1).split(' ');
            return `${parsedId[0]}:${parsedId[1]}`;
        });
};

const getTreeIds = (node, ids = []) => {
    if (_.isNil(node)) return ids;
    if (!node.hasOwnProperty('final')) ids.push(node.id);
    if (_.isNil(node.children)) return ids;
    if (!(node.children instanceof Array)) ids.push(node.children.id);
    else _.map(node.children, child => getTreeIds(child, ids));
    return ids;
};

const setRulesTreeIds = (tree, rules) => {
    return rules.map(rule => {
        if (_.isNil(rule) || !rule.hasOwnProperty('checks')) {
            return null;
        }
        return rule.checks.map(check => {
            if (check.context.includes(TREEPATH)) {
                const idStrings = getIdStringsFromContext(tree.name, check.context);
                if (idStrings === null) {
                    return { ...check, treeId: null };
                }
                const treeId = findIdByObjNumbers(tree, idStrings.reverse());
                return { ...check, treeId: treeId };
            } else if (check.context.includes('pages') && check.context.includes('annots')) {
                const [pageIndex, annotIndex] = check.context.split('pages')[1].match(/\[\d+\]/g) || ['', ''];
                const annotKey = `${pageIndex.slice(1, -1)}:${annotIndex.slice(1, -1)}`;
                const treeId = tree.annotMap[annotKey] ?? null;
                return { ...check, treeId: treeId };
            }
            return { ...check, treeId: null };
        });
    });
};

const findIdByObjNumbers = (node, pathArray) => {
    if (!pathArray || !pathArray.length) return node.id;
    const path = pathArray.pop();
    const [num, gen] = path.split(':');
    const nextNode = node.children.find(({ ref }) => ref.num === +num && ref.gen === +gen);
    if (!nextNode) return null;
    return findIdByObjNumbers(nextNode, pathArray);
};

/*
 *  Returns a list of groups containing tagNames
 *
 *  @param tagsNames {string[]} of Tag names
 *  @param errorTags {{ [group]: [{ name, description }] }} of Tag objects
 *
 *  @return availableGroups {string[]} of groups containing tagNames
 */
const getAvailableGroups = (tagsNames, errorTags) => {
    if (!Array.isArray(tagsNames) || !tagsNames.length || _.isEmpty(errorTags)) return [];
    const allGroups = _.keys(errorTags);
    const availableGroups = [];

    _.forEach(tagsNames, tagName => {
        _.forEach(allGroups, group => {
            if (errorTags[group].map(({ name }) => name).includes(tagName)) {
                availableGroups.push(group);
            }
        });
    });
    return _.intersection(allGroups, availableGroups);
};

export { getTreeIds, setRulesTreeIds, getAvailableGroups };
