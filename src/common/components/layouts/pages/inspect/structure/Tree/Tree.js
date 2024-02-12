import React, { memo, useEffect, useCallback, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Tree as VirtualTree } from 'react-arborist';
import { scrollToActiveBbox } from 'verapdf-js-viewer';
import classNames from 'classnames';
import _ from 'lodash';
import { usePrevious } from 'react-use';

import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import { findNode } from '../../../../../../services/treeService';

import './Tree.scss';

const ROWHEIGHT = 27.5;
const INDENT = 12;
const SCROLL_MODES = ['center', 'auto'];

function Tree({
    tree,
    width,
    height,
    selectedCheck,
    setSelectedCheck,
    selectedNodeId,
    setSelectedNodeId,
    expandedNodes,
    setExpandedNodes,
    initialExpandState,
    roleMap,
    errorsMap,
    ruleSummaries,
}) {
    const treeRef = useRef();
    const prevSelectedCheck = usePrevious(selectedCheck);
    const prevSelectedNodeId = usePrevious(selectedNodeId);
    const [isNodeClicked, setIsNodeClicked] = useState(false);

    const expandNodeParents = useCallback((initExpandState, treeId) => {
        if (_.isNil(treeId) || _.isNil(initExpandState)) return {};
        const listTreeIds = treeId.split(':');
        const mergeIds = (arr, amount) => arr.slice(0, amount).join(':');
        const newExpandState = _.fromPairs(_.map(listTreeIds, (_, index) => [mergeIds(listTreeIds, index + 1), true]));
        return { ...initExpandState, ...newExpandState };
    }, []);

    useEffect(() => {
        // Works only when you explicitly click on tree element
        if (!_.isNil(selectedNodeId) && !isNodeClicked) {
            treeRef?.current.closeAll();
            setExpandedNodes(expandNodeParents(initialExpandState, selectedNodeId));
        }
        setIsNodeClicked(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedNodeId]);

    useEffect(() => {
        if (!_.isNil(selectedCheck)) {
            const ruleIndex = errorsMap[selectedCheck]?.ruleIndex;
            const checkIndex = errorsMap[selectedCheck]?.checkIndex;
            if (!_.isNil(ruleIndex) && !_.isNil(checkIndex) && !_.isEmpty(ruleSummaries)) {
                const newNodeId = ruleSummaries[ruleIndex][checkIndex]?.treeId;
                setSelectedNodeId(newNodeId);
            }
        }
        if (!_.isNil(selectedNodeId)) {
            treeRef?.current.get(prevSelectedNodeId)?.deselect();
            treeRef?.current.get(selectedNodeId)?.select();
            treeRef?.current.scrollTo(selectedNodeId, SCROLL_MODES[+(prevSelectedCheck === selectedCheck)]);
        }
    }, [
        errorsMap,
        prevSelectedCheck,
        prevSelectedNodeId,
        ruleSummaries,
        selectedCheck,
        selectedNodeId,
        setSelectedNodeId,
    ]);

    const onNodeClick = useCallback(
        id => {
            setSelectedNodeId(id);
            const [ruleIndex, checkIndex] = findNode(ruleSummaries, id);
            if (!_.isNil(ruleIndex) && !_.isNil(checkIndex)) {
                const sortedCheckIndex = _.findIndex(
                    errorsMap,
                    error => error.checkIndex === checkIndex && error.ruleIndex === ruleIndex
                );
                setSelectedCheck(sortedCheckIndex);
                if (sortedCheckIndex === selectedCheck) {
                    scrollToActiveBbox();
                }
            } else {
                setSelectedCheck(null);
            }
            setIsNodeClicked(true);
        },
        [errorsMap, ruleSummaries, selectedCheck, setSelectedCheck, setSelectedNodeId, setIsNodeClicked]
    );

    return (
        <VirtualTree
            className="tree"
            ref={treeRef}
            rowHeight={ROWHEIGHT}
            width={width}
            height={height}
            indent={INDENT}
            initialData={tree}
            initialOpenState={expandedNodes}
            selection={selectedNodeId}
            expandedNodes={expandedNodes}
            setExpandedNodes={setExpandedNodes}
            roleMap={roleMap}
            onNodeClick={onNodeClick}
        >
            {Node}
        </VirtualTree>
    );
}

function Node({ node, style, tree }) {
    const ref = useRef();
    const { roleMap, expandedNodes, setExpandedNodes, onNodeClick } = tree.props;

    const handleNodeClick = _event => {
        node.select();
        onNodeClick(node.id);
    };
    const handleIconClick = event => {
        event.stopPropagation();
        node.toggle();
        setExpandedNodes({
            ...expandedNodes,
            [node.id]: !expandedNodes[node.id],
        });
    };

    return (
        <div
            className={classNames('tree__item', {
                tree__item__selected: node.isSelected,
            })}
            style={style}
            onClick={handleNodeClick}
            ref={ref}
            role="presentation"
        >
            <button className="tree__item__icon" disabled={node.data?.final} onClick={handleIconClick}>
                {tree.isOpen(node.id) ? <ExpandMoreIcon /> : <ChevronRightIcon />}
            </button>
            <label className="tree__item__label">
                {roleMap && node.data.roleName ? node.data.roleName : node.data.name}
            </label>
        </div>
    );
}

Tree.propTypes = {
    tree: PropTypes.array,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    selectedCheck: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    setSelectedCheck: PropTypes.func.isRequired,
    selectedNodeId: PropTypes.string,
    setSelectedNodeId: PropTypes.func.isRequired,
    expandedNodes: PropTypes.oneOfType([PropTypes.object, PropTypes.array]).isRequired,
    setExpandedNodes: PropTypes.func.isRequired,
    initialExpandState: PropTypes.object.isRequired,
    roleMap: PropTypes.bool.isRequired,
    errorsMap: PropTypes.oneOfType([PropTypes.object, PropTypes.array]).isRequired,
    ruleSummaries: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.object)).isRequired,
};

export default memo(Tree);
