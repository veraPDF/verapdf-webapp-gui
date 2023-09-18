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

const parseTree = tree => {
    if (tree instanceof Array) {
        if (tree.length === 1) return tree[0];
        return { name: 'Document', children: tree };
    }
    return tree;
};

const cleanArray = arr => {
    if (arr.some(el => _.isNil(el))) {
        arr = arr.filter(el => !_.isNil(el));
        return arr.length ? arr : [];
    }
    return arr;
};

const cleanTree = node => {
    if (_.isNil(node)) return null;
    if (_.isNil(node.children)) {
        if (node.hasOwnProperty('name')) return node;
        return null;
    }

    if (!(node.children instanceof Array)) node.children = [cleanTree(node.children)];
    else node.children = _.map(node.children, child => cleanTree(child));
    node.children = cleanArray(node.children);
    return node;
};

const setTreeIds = (node, id = '0') => {
    if (_.isNil(node)) return null;
    node.id = id;
    if (_.isNil(node?.children)) node.children = [];
    if (!node?.children.length) {
        node.final = true;
        return node;
    }
    if (!(node.children instanceof Array)) node.children = [setTreeIds(node.children, `${id}:${0}`)];
    else node.children = _.map(node.children, (child, index) => setTreeIds(child, `${id}:${index}`));
    return node;
};

const getTreeIds = (node, ids = []) => {
    if (_.isNil(node)) return ids;
    if (!node.hasOwnProperty('final')) ids.push(node.id);
    if (_.isNil(node.children)) return ids;
    if (!(node.children instanceof Array)) ids.push(node.children.id);
    else _.map(node.children, child => getTreeIds(child, ids));
    return ids;
};

const setRulesTreeIds = rules => {
    const TREE = 'StructTreeRoot[0]';
    return rules.map(({ checks }) => {
        return checks.map(check => {
            if (check.context.includes(TREE)) {
                const treeId = check.context
                    .split(TREE)[1]
                    .match(/\[\d+\]/g)
                    .join('')
                    .replaceAll('][', ':')
                    .slice(1, -1);
                return { ...check, treeId: treeId };
            }
            return { ...check, treeId: null };
        });
    });
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

const findNode = (arr, id) => {
    let ruleIndex = null;
    let checkIndex = null;
    _.map(arr, (rule, i) => {
        _.map(rule, (check, j) => {
            if (check.treeId === `${id}:0` || check.treeId === id) {
                [ruleIndex, checkIndex] = [i, j];
            }
        });
    });
    return [ruleIndex, checkIndex];
};

export { parseTree, cleanTree, setTreeIds, getTreeIds, setRulesTreeIds, getTreeRoleNames, findNode };
