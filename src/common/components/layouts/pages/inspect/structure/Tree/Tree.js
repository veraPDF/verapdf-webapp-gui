import { memo, useEffect, useCallback, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Tree as VirtualTree } from 'react-arborist';
import { scrollToActiveBbox } from 'verapdf-js-viewer';
import classNames from 'classnames';
import _ from 'lodash';

import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import { findNode } from '../../../../../../services/treeService';

import './Tree.scss';

const ROWHEIGHT = 27.5;
const INDENT = 12;

function Tree({
    tree,
    width,
    height,
    selectedCheck,
    setSelectedCheck,
    expandedNodes,
    setExpandedNodes,
    roleMap,
    errorsMap,
    ruleSummaries,
}) {
    const treeRef = useRef();
    const [selectedNodeId, setSelectedNodeId] = useState(null);
    useEffect(() => {
        if (_.isNil(selectedCheck)) {
            treeRef?.current.deselectAll();
        } else {
            const ruleIndex = errorsMap[selectedCheck]?.ruleIndex;
            const checkIndex = errorsMap[selectedCheck]?.checkIndex;
            if (!_.isNil(ruleIndex) && !_.isNil(checkIndex)) {
                const newNodeId = ruleSummaries[ruleIndex][checkIndex]?.treeId;
                setSelectedNodeId(newNodeId);
                if (newNodeId === selectedNodeId) {
                    treeRef?.current.get(newNodeId)?.select();
                    treeRef?.current.scrollTo(newNodeId, 'center');
                }
            }
        }
    }, [errorsMap, ruleSummaries, selectedCheck, selectedNodeId]);

    const onNodeClick = useCallback(
        id => {
            const [ruleIndex, checkIndex] = findNode(ruleSummaries, id);
            const sortedCheckIndex = _.findIndex(
                errorsMap,
                error => error.checkIndex === checkIndex && error.ruleIndex === ruleIndex
            );
            setSelectedCheck(sortedCheckIndex);
            if (sortedCheckIndex === selectedCheck) {
                scrollToActiveBbox();
            }
        },
        [errorsMap, ruleSummaries, selectedCheck, setSelectedCheck]
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
        setExpandedNodes({ ...expandedNodes, [node.id]: !expandedNodes[node.id] });
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
            <label className="tree__item__label">{roleMap ? node.data.roleName : node.data.name}</label>
        </div>
    );
}

Tree.propTypes = {
    tree: PropTypes.array,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    selectedCheck: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    setSelectedCheck: PropTypes.func.isRequired,
    expandedNodes: PropTypes.oneOfType([PropTypes.object, PropTypes.array]).isRequired,
    setExpandedNodes: PropTypes.func.isRequired,
    roleMap: PropTypes.bool.isRequired,
    errorsMap: PropTypes.oneOfType([PropTypes.object, PropTypes.array]).isRequired,
    ruleSummaries: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.object)).isRequired,
};

export default memo(Tree);
