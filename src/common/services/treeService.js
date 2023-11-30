import _ from 'lodash';

const TREEPATH = '/StructTreeRoot';

const getIdStringsFromContext = (treeName, context) => {
    return context
        .split(TREEPATH)[1]
        .match(/\(\d+ \d+ \S+ \S+ \S+\)/g)
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
    return rules.map(({ checks }) => {
        return checks.map(check => {
            if (check.context.includes(TREEPATH)) {
                const idStrings = getIdStringsFromContext(tree.name, check.context);
                const treeId = findIdByObjNumbers(tree, idStrings.reverse());
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

const findNode = (arr, id) => {
    let ruleIndex = null;
    let checkIndex = null;
    _.map(arr, (rule, i) => {
        _.map(rule, (check, j) => {
            if (check.treeId === id) {
                [ruleIndex, checkIndex] = [i, j];
            }
        });
    });
    return [ruleIndex, checkIndex];
};

export { getTreeIds, setRulesTreeIds, findNode };
