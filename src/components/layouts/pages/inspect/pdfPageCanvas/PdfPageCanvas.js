import React, { useRef, useEffect, useCallback } from 'react';

function PdfPageCanvas(props) {
    const { id, style, pageIndex, height, width, onMount } = props;
    const canvas = useRef();

    useEffect(
        useCallback(() => {
            const ctx = canvas.current.getContext('2d');
            ctx.translate(0, height); // reset where 0,0 is located
            ctx.scale(1, -1);
            onMount();
        }, [height, onMount]),
        [height]
    );

    return (
        <canvas
            id={id}
            style={style}
            data-page={pageIndex}
            height={height}
            width={width}
            ref={canvas}
        />
    );
}

export default React.memo(PdfPageCanvas);
