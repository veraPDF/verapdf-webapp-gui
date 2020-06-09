# About

This  [WCAG 2.1](https://www.w3.org/TR/WCAG21/) and [PDF/UA-1](https://en.wikipedia.org/wiki/PDF/UA) validation interface is based on veraPDF model and implements the following validation profiles:

- **PDF/UA-1 (Machine)**: PDF/UA-1 syntax checks based on the [Matterhorn 1.02](https://www.pdfa.org/resource/the-matterhorn-protocol-1-02/) Machine verifiable checkpoints.
- **PDF/UA-1 (Human)**: prototype of several Matterhorn 1.02 Human verifiable tests based on heuristics of page layout recognition
- **WCAG 2.1 (Extra)**: prototype of several WCAG 2.1 requirements that are not part of the PDF/UA-1 standard.
- **WCAG 2.1 (All)**: combined profile including PDF/UA-1 (both Matterhorn and Human) and additional WCAG 2.1 requirements. This profile is used by default.
- **Tagged PDF**: the tagged PDF structure checks based on ISO 32000-1 and ISO 32000-2 requirements.

The source files of these validation profiles can be found at [veraPDF GitHub](https://github.com/veraPDF/veraPDF-validation-profiles/tree/pdfua/PDF_UA).
