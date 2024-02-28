# About

This  [WCAG 2.2](https://www.w3.org/TR/WCAG22/) and [PDF/UA](https://en.wikipedia.org/wiki/PDF/UA) validation interface is powered by the [veraPDF](https://verapdf.org/) validation architecture and implements the following validation profiles:

- **WCAG 2.2 (Machine)**: checks of WCAG 2.2 requirements as applicable to PDF. This profile includes only so-called **Machine** checks, which can be performed by deterministic software algorithms and do not require human interaction. 
- **PDF/UA-1**: PDF/UA-1 syntax checks based on the [Matterhorn 1.10](https://pdfa.org/resource/the-matterhorn-protocol/). Only Machine verifiable checkpoints are included.
- **PDF/UA-2**: PDF/UA-2 (draft) syntax checks. Only Machine verifiable checkpoints are included. This profile does not verify inclusion rules between structure tags in PDF document, as defined by [ISO 32005](https://www.iso.org/standard/45878.html). 
- **ISO 32005**: all inclusion rules is the structure tree of PDF document as specified in [ISO 32005](https://www.iso.org/standard/45878.html).
- **PDF/UA-2 and ISO 32005**: combined profile including PDF/UA-2 (draft, machine only) and ISO 32005 requirements.
- **WCAG 2.2 (Machine and Human)**: an experimental implementation of all Machine and some **Human** checks of WCAG 2.2 requirements as applicable to PDF. The implementation of **Human** rules is based on heuristic layout recognition algorithm, which may be confused by the complexity of the document. This profile may provide useful information on the WCAG validity of the document. However, it should only be used for exploratory purposes and not for any definitive resolutions. The complete WCAG or PDF/UA conformance of a PDF document does require a human inspection.   

The source files of validation profiles can be found at [veraPDF GitHub](https://github.com/veraPDF/veraPDF-validation-profiles/tree/integration/PDF_UA).
