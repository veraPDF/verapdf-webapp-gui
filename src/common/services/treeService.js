import _ from 'lodash';

const getContext = arr => {
    let allContext = '';
    _.map(arr, subArr => {
        _.map(subArr, el => {
            allContext += el.context;
        });
    });
    return allContext;
};

const getStructureIds = arr => {
    return Array.from(new Set(getContext(arr).match(/\(\d+ \d+ \S+ \S+ \S+\)/g)))
        .filter(id => !id.includes('/'))
        .map(id => id.slice(1, -1));
};

const getRoleMapList = arr => {
    const roleMapList = _.map(getStructureIds(arr), id => {
        const [key, value] = [id.split(' ').at(-1), id.split(' ').at(-2)];
        return value.includes('SE') ? ['', ''] : [key, value];
    });
    return _.fromPairs(roleMapList);
};

const getTreeRoleNames = (tree, arr) => {
    const dictionary = getRoleMapList(arr);
    const setNodeRoleName = node => {
        if (_.isNil(node)) return null;
        const roleName = dictionary[node.name];
        node.roleName = _.isNil(roleName) ? node.name : roleName;
        if (!node?.children.length) return node;
        if (!(node.children instanceof Array)) setNodeRoleName(node.children);
        else _.map(node.children, child => setNodeRoleName(child));
        return node;
    };
    return setNodeRoleName(tree);
};

const getTreeIds = (node, ids = []) => {
    if (_.isNil(node)) return ids;
    if (!node.hasOwnProperty('final')) ids.push(node.id);
    if (_.isNil(node.children)) return ids;
    if (!(node.children instanceof Array)) ids.push(node.children.id);
    else _.map(node.children, child => getTreeIds(child, ids));
    return ids;
};

const setRulesTreeIds = (treeName, rules) => {
    const TREEPATH = 'root/doc[0]/StructTreeRoot';
    return rules.map(({ checks }) => {
        return checks.map(check => {
            if (check.context.includes(TREEPATH)) {
                const idStrings = check.context
                    .split(TREEPATH)[1]
                    .match(/[^/]+/g)
                    .filter((idStr, index) => {
                        if (index === 1) return !idStr.includes(treeName) && !idStr.includes('{');
                        return !idStr.includes('{');
                    });
                const treeId = idStrings
                    .map(idStr => idStr.match(/\[\d+\]/))
                    .join('')
                    .replaceAll('][', ':')
                    .slice(1, -1);
                return { ...check, treeId: treeId };
            }
            return { ...check, treeId: null };
        });
    });
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

export { getTreeIds, getTreeRoleNames, setRulesTreeIds, findNode };
