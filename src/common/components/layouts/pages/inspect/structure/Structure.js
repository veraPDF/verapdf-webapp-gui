import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import useResizeObserver from 'use-resize-observer';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListSubheader from '@material-ui/core/ListSubheader';

import Pane from './../pane/Pane';
import RoleMap from './roleMap/RoleMap';
import Tree from './Tree/Tree';

import './Structure.scss';

const useStyles = makeStyles({
    root: {
        padding: 0,
    },
});

const LIST_HEADER = 'Structure tree';

function StructureTree({
    tree,
    isTreeShow,
    setIsTreeShow,
    selectedCheck,
    setSelectedCheck,
    selectedNodeId,
    setSelectedNodeId,
    expandedNodes,
    setExpandedNodes,
    initialExpandState,
    roleMap,
    setRoleMap,
    errorsMap,
    ruleSummaries,
}) {
    const classes = useStyles();
    const { ref, width = 300, height = 700 } = useResizeObserver();
    const { ref: refHeader, height: heightHeader = 48 } = useResizeObserver();
    const [disable, setDisable] = useState(false);
    useEffect(() => setDisable(_.isNil(tree) || _.isEmpty(tree) || tree.hasOwnProperty('final')), [tree]);

    return (
        <>
            <Pane isShow={isTreeShow} setIsShow={setIsTreeShow} isDisable={disable} />
            {isTreeShow ? (
                <section className="summary-structure" ref={ref}>
                    <List
                        className="summary-structure__list"
                        aria-labelledby="summary-structure-subheader"
                        subheader={
                            <ListSubheader
                                ref={refHeader}
                                component="div"
                                id="summary-structure-subheader"
                                disableSticky
                            >
                                <p>{LIST_HEADER}</p>
                                <RoleMap roleMap={roleMap} setRoleMap={setRoleMap} />
                            </ListSubheader>
                        }
                        disablePadding
                    >
                        <ListItem
                            className="summary-structure__list__item"
                            classes={{
                                root: classes.root,
                            }}
                        >
                            <Tree
                                tree={[tree]}
                                width={width}
                                height={height - heightHeader}
                                selectedCheck={selectedCheck}
                                setSelectedCheck={setSelectedCheck}
                                selectedNodeId={selectedNodeId}
                                setSelectedNodeId={setSelectedNodeId}
                                expandedNodes={expandedNodes}
                                setExpandedNodes={setExpandedNodes}
                                initialExpandState={initialExpandState}
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
    selectedNodeId: PropTypes.string,
    setSelectedNodeId: PropTypes.func.isRequired,
    expandedNodes: PropTypes.oneOfType([PropTypes.object, PropTypes.array]).isRequired,
    setExpandedNodes: PropTypes.func.isRequired,
    initialExpandState: PropTypes.object.isRequired,
    roleMap: PropTypes.bool.isRequired,
    setRoleMap: PropTypes.func.isRequired,
    errorsMap: PropTypes.oneOfType([PropTypes.object, PropTypes.array]).isRequired,
    ruleSummaries: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.object)),
};

export default StructureTree;
