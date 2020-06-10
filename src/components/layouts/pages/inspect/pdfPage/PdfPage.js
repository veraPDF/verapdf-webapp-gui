import React, { useEffect, useState, useCallback } from 'react';
import { Page } from 'react-pdf';

function PdfPage(props) {
    const { pageIndex, onPageRenderSuccess, scale, style, loading, height, width } = props;
    const [loadingState, setLoading] = useState(loading);
    const [initPage, setInitPage] = useState(!loading);
    const onLoadPage = useCallback(
        e => {
            if (e.pageNumber === pageIndex) {
                setInitPage(true);
                document.removeEventListener('loadPage', onLoadPage);
            }
        },
        [pageIndex]
    );

    useEffect(() => {
        document.addEventListener('loadPage', onLoadPage);
    }, [onLoadPage]);

    return (
        <div
            key={`pdf-page--wrap${pageIndex}`}
            className="pdf-page"
            data-page={pageIndex}
            data-loading={loadingState}
            style={{
                ...style,
                height: loadingState ? height : 'auto',
                width: loadingState ? width : 'auto',
            }}
        >
            {!initPage ? (
                []
            ) : (
                <Page
                    pageNumber={pageIndex}
                    renderAnnotationLayer
                    renderTextLayer
                    onRenderSuccess={page => {
                        setLoading(false);
                        return onPageRenderSuccess(page);
                    }}
                    scale={scale}
                    customTextRenderer={({ str }) => {
                        /*
                              height: height of text
                              width: width of text
                              transform: contain coordinates of text
                              scale: will be used for coords. conversing
                               */
                        return str;
                    }}
                />
            )}
        </div>
    );
}

export default React.memo(PdfPage);
