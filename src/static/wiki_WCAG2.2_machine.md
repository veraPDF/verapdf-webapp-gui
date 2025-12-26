# WCAG2.2 validation rules
## Rule 1.3.1-1

### Requirement

>*Repeated ASCII characters are used for presentational purpose and are not marked as artifact*

### Error details

ASCII text is used as a pseudographics

* Object type: `SARepeatedCharacters`
* Test condition: `isNonSpace == false || numberOfRepeatedCharacters < 5`
* Severity: cosmetic

## Rule 1.3.1-2

### Requirement

>*Repeated SPACE characters are used for formatting purpose and are not marked as artifact*

### Error details

Space characters are used for formatting purpose

* Object type: `SARepeatedCharacters`
* Test condition: `isNonSpace == true || numberOfRepeatedCharacters < 3`
* Severity: cosmetic

## Rule 1.3.4-1

### Requirement

>*Pages shall have the same orientation within the document unless specific display orientation is essential*

### Error details

Pages have different orientation

* Object type: `PDPage`
* Test condition: `orientation == 'Square' || gMostCommonPageOrientation == orientation`
* Severity: minor

## Rule 1.4.3-1

### Requirement

>*The visual presentation of text and images of text has a contrast ratio of at least 4.5:1. Large-scale text and images of large-scale text have a contrast ratio of at least 3:1*

### Error details

Insufficient text contrast

* Object type: `SATextChunk`
* Test condition: `textSize < 4.5 || ((textSize >= 18.0 || (textSize >= 14.0 && textWeight >= 700.0)) ? (contrastRatio >= 3) : (contrastRatio >= 4.5)) || parentsStandardTypes.split('&').filter(elem => elem == 'Figure').length > 0`
* Severity: major

## Rule 1.4.4-1

### Requirement

>*Text is too small and may not be resized without assistive technology up to 200 percent without loss of content or functionality*

### Error details

Text size is too small

* Object type: `SATextChunk`
* Test condition: `textSize >= 4.5 || isWhiteSpaceChunk == true || parentsStandardTypes.split('&').filter(elem => elem == 'Figure').length > 0`
* Severity: major

## Rule 1.4.10-1

### Requirement

>*Bounding box should be present for a figure appearing in its entirety on a single page to indicate the area of the figure on the page*

### Error details

Figure has no BBox attribute

* Object type: `SAFigure`
* Test condition: `page != lastPage || hasBBox == true`
* Severity: minor
* Additional references:
  * ISO 32000-1:2008, 14.8.5.4.3

## Rule 2.4.9-1

### Requirement

>*The Link annotation has no Alt entry and is not associated with a meaningful text on the page*

### Error details

Missing alternate Link description

* Object type: `SALinkAnnotation`
* Test condition: `(Contents != null && Contents != '' && contentsIsLink == false) || isOutsideCropBox == true || (F & 2) == 2 || (textValue != null && textValue != '' && textValueIsLink == false) || (Alt != null && Alt != '' && altIsLink == false)`
* Severity: major
* Additional references:
  * ISO 32000-1:2008, 14.9.3

## Rule 4.1.1-1

### Requirement

>*Merged table cells deteriorate the document accessibility and are not recommended*

### Error details

Table body contains merged cells

* Object type: `SETD`
* Test condition: `ColSpan == 1 && RowSpan == 1`
* Severity: cosmetic

## Rule 4.1.1-2

### Requirement

>*Merged table cells deteriorate the document accessibility and are not recommended*

### Error details

Table header contains merged cells

* Object type: `SETH`
* Test condition: `ColSpan == 1 && RowSpan == 1`
* Severity: cosmetic

## Rule 4.1.2-16

### Requirement

>*Paragraph structure element has no real content*

### Error details

Paragraph structure element is empty

* Object type: `SAP`
* Test condition: `correctType != null`
* Severity: minor

## Rule 4.1.2-17

### Requirement

>*Span structure element has no real content*

### Error details

Span structure element is empty

* Object type: `SASpan`
* Test condition: `correctType != null`
* Severity: minor

## Rule 4.1.2-18

### Requirement

>*Heading structure element has no real content*

### Error details

Heading structure element is empty

* Object type: `SAH`
* Test condition: `correctType != null`
* Severity: minor

## Rule 4.1.2-19

### Requirement

>*Numbered heading structure element has no real content*

### Error details

Numbered heading structure element is empty

* Object type: `SAHn`
* Test condition: `correctType != null`
* Severity: minor

## Rule 4.1.2-29

### Requirement

>*<TOCI> structure element (Table of Content item) contains no text*

### Error details

Empty TOC item

* Object type: `SATOCI`
* Test condition: `errorCodes.split(',').filter(elem => elem == 1000).length == 0`
* Severity: minor

