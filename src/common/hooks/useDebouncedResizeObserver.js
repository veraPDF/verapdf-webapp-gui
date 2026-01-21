import React from 'react';
import useResizeObserver from 'use-resize-observer';
import _ from 'lodash';

export const useDebouncedResizeObserver = delay => {
    const [size, setSize] = React.useState({});
    const onResize = React.useMemo(() => _.debounce(setSize, delay, { leading: true }), [delay]);
    const { ref } = useResizeObserver({ onResize });
    return { ref, ...size };
};
