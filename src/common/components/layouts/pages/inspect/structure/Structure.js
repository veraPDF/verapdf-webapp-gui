import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import useResizeObserver from 'use-resize-observer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListSubheader from '@material-ui/core/ListSubheader';

import Pane from './../pane/Pane';
import RoleMap from './roleMap/RoleMap';
import Tree from './Tree/Tree';

import './Structure.scss';

const LIST_HEADER = 'Structure tree';

function StructureTree({
    tree,
    isTreeShow,
    setIsTreeShow,
    selectedCheck,
    setSelectedCheck,
    expandedNodes,
    setExpandedNodes,
    roleMap,
    setRoleMap,
    errorsMap,
    ruleSummaries,
}) {
    const { ref, width = 300, height = 700 } = useResizeObserver();
    const [disable, setDisable] = useState(false);
    useEffect(() => {
        if (tree === null) setDisable(true);
    }, [tree]);
    return (
        <>
            <Pane isShow={isTreeShow} setIsShow={setIsTreeShow} isDisable={disable} />
            {isTreeShow ? (
                <section className="summary-structure" ref={ref}>
                    <List
                        className="summary-structure__list"
                        aria-labelledby="summary-structure-subheader"
                        subheader={
                            <ListSubheader component="div" id="summary-structure-subheader" disableSticky>
                                {LIST_HEADER}
                                <RoleMap roleMap={roleMap} setRoleMap={setRoleMap} />
                            </ListSubheader>
                        }
                        disablePadding
                    >
                        <ListItem className="summary-structure__list__item">
                            <Tree
                                tree={[tree]}
                                width={width}
                                height={height}
                                selectedCheck={selectedCheck}
                                setSelectedCheck={setSelectedCheck}
                                expandedNodes={expandedNodes}
                                setExpandedNodes={setExpandedNodes}
                                roleMap={roleMap}
                                ruleSummaries={ruleSummaries}
                                errorsMap={errorsMap}
                            />
                        </ListItem>
                    </List>
                </section>
            ) : null}
        </>
    );
}

StructureTree.propTypes = {
    tree: PropTypes.object,
    isTreeShow: PropTypes.bool.isRequired,
    setIsTreeShow: PropTypes.func.isRequired,
    selectedCheck: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    setSelectedCheck: PropTypes.func.isRequired,
    expandedNodes: PropTypes.oneOfType([PropTypes.object, PropTypes.array]).isRequired,
    setExpandedNodes: PropTypes.func.isRequired,
    roleMap: PropTypes.bool.isRequired,
    setRoleMap: PropTypes.func.isRequired,
    errorsMap: PropTypes.oneOfType([PropTypes.object, PropTypes.array]).isRequired,
    ruleSummaries: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.object)),
};

export default StructureTree;
