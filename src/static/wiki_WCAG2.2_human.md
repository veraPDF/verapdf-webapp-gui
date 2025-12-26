# WCAG2.2 validation rules
## Rule 1.3.1-3

### Requirement

>*Underlined text is used outside of the link context*

### Error details

Non-link underlined text

* Object type: `SATextChunk`
* Test condition: `isUnderlined == false || parentsStandardTypes.split('&').filter(elem => (elem == 'Link' || elem == 'Reference')).length > 0`
* Severity: cosmetic

## Rule 1.3.1-4

### Requirement

>*Text has visually different presentation suggesting the semantics of Span, Em, Strong or other appropriate inline element*

### Error details

Text has a different style but no semantic tagging

* Object type: `SATextChunk`
* Test condition: `hasSpecialStyle == false || parentsStandardTypes.split('&').filter(elem => elem == 'Figure').length > 0`
* Severity: minor

## Rule 1.4.8-1

### Requirement

>*Font used for text rendering is not recommended for accessibility*

### Error details

Inaccessible font

* Object type: `PDFont`
* Test condition: `fontName != null && fontName.indexOf('AdobeDevanagari') == -1 && fontName.indexOf('AgencyFB') == -1 && fontName.indexOf('BlackadderITC') == -1 && fontName.indexOf('BodoniMTPosterCompressed') == -1 && fontName.indexOf('BradleyHandITC') == -1 && fontName.indexOf('BrushScriptMT') == -1 && fontName.indexOf('Chiller') == -1 && fontName.indexOf('ColonnaMT') == -1 && fontName.indexOf('CurlzMT') == -1 && fontName.indexOf('EdwardianScriptITC') == -1 && fontName.indexOf('ESRIArcGISTDN') == -1 && fontName.indexOf('FreestyleScript') == -1 && fontName.indexOf('FrenchScriptMT') == -1 && fontName.indexOf('Gabriola') == -1 && fontName.indexOf('Gigi') == -1 && fontName.indexOf('GillSansMT-ExtraCondensedBold') == -1 && fontName.indexOf('HarlowSolidItalic') == -1 && fontName.indexOf('Harrington') == -1 && fontName.indexOf('InformalRoman') == -1 && fontName.indexOf('Jokerman') == -1 && fontName.indexOf('FrenchScriptMT') == -1 && fontName.indexOf('Gabriola') == -1 && fontName.indexOf('JuiceITC') == -1 && fontName.indexOf('KunstlerScript') == -1 && fontName.indexOf('Magneto') == -1 && fontName.indexOf('MaturaMTScriptCapitals') == -1 && fontName.indexOf('MicrosoftUighur') == -1 && fontName.indexOf('Mistral') == -1 && fontName.indexOf('OldEnglishTextMT') == -1 && fontName.indexOf('Onyx') == -1 && fontName.indexOf('PalaceScriptMT') == -1 && fontName.indexOf('Parchment') == -1 && fontName.indexOf('Playbill') == -1 && fontName.indexOf('Pristina') == -1 && fontName.indexOf('RageItalic') == -1 && fontName.indexOf('Ravie') == -1 && fontName.indexOf('SegoeScript') == -1 && fontName.indexOf('ShowcardGothic') == -1 && fontName.indexOf('SnapITC') == -1 && fontName.indexOf('Vivaldi') == -1 && fontName.indexOf('VladimirScript') == -1 && (fontName.indexOf('HarlowSolid') == -1 || isItalic != true)`
* Severity: cosmetic

## Rule 4.1.1-3

### Requirement

>*Merged cells in tables are advised to be avoided for accessibility reasons*

### Error details

Table visual appearance has merged cells

* Object type: `SATableBorderCell`
* Test condition: `colSpan == 1 && rowSpan == 1`
* Severity: cosmetic

## Rule 4.1.2-1

### Requirement

>*The content is not identified as a single paragraph*

### Error details

Incorrect use of P tag

* Object type: `SAP`
* Test condition: `correctSemanticScore >= 0.75 || correctType == null || correctType == 'H'`
* Severity: minor

## Rule 4.1.2-2

### Requirement

>*The content is not identified as a single span of text*

### Error details

Incorrect use of Span tag

* Object type: `SASpan`
* Test condition: `correctSemanticScore >= 0.75 || correctType == null`
* Severity: minor

## Rule 4.1.2-4

### Requirement

>*The content is marked with <H> tag, but is not identified as a heading*

### Error details

Incorrect use of H tag

* Object type: `SAH`
* Test condition: `correctSemanticScore >= 0.75 || correctType == null`
* Severity: minor

## Rule 4.1.2-5

### Requirement

>*The content is marked with one of <H1>, ..., <H7> tags, but is not identified as a heading*

### Error details

Incorrect use of Hn tag

* Object type: `SAHn`
* Test condition: `correctSemanticScore >= 0.75 || correctType == null`
* Severity: minor

## Rule 4.1.2-8

### Requirement

>*Part of the document is identified as a table, but is not marked as a different Table related structure element*

### Error details

Incorrect Table element(s)

* Object type: `SAStructElem`
* Test condition: `hasLowestDepthError == false || (correctSemanticScore >= 0.75 && standardType == correctType) || (isTableElem != true) || ((correctType != 'TD' || standardType == 'TH') && correctType != 'TR' && correctType != 'TH' && correctType != 'TBody' && correctType != 'THead' && correctType != 'TFoot' && correctType != 'Table') || (standardType == 'L' || parentsStandardTypes.split('&').filter(elem => elem == 'L').length > 0)`
* Severity: minor

## Rule 4.1.2-9

### Requirement

>*Part of the document is recognized as a table, but is not marked as a Table related structure element*

### Error details

Missing Table element(s)

* Object type: `SAStructElem`
* Test condition: `hasLowestDepthError == false || (correctSemanticScore >= 0.75 && standardType == correctType) || (isTableElem == true) || (correctType != 'TD' && correctType != 'TR' && correctType != 'TH' && correctType != 'TBody' && correctType != 'THead' && correctType != 'TFoot' && correctType != 'Table') || (standardType == 'L' || parentsStandardTypes.split('&').filter(elem => elem == 'L').length > 0)`
* Severity: minor

## Rule 4.1.2-10

### Requirement

>*Structure element uses <P> tag, but is recognized as a heading*

### Error details

Heading is incorrectly tagged as a paragraph

* Object type: `SAP`
* Test condition: `correctType != 'H' && correctType != 'Hn'`
* Severity: minor

## Rule 4.1.2-11

### Requirement

>*Structure element uses <P> tag, but is recognized as a span*

### Error details

Span is incorrectly tagged as a paragraph

* Object type: `SAP`
* Test condition: `correctType != 'Span'`
* Severity: minor

## Rule 4.1.2-12

### Requirement

>*Structure element uses <Span> tag, but is recognized as a paragraph*

### Error details

Paragraph is incorrectly tagged as a span

* Object type: `SASpan`
* Test condition: `correctType != 'P'`
* Severity: minor

## Rule 4.1.2-13

### Requirement

>*Structure element uses <Span> tag, but is recognized as a heading*

### Error details

Heading is incorrectly tagged as a span

* Object type: `SASpan`
* Test condition: `correctType != 'H' && correctType != 'Hn'`
* Severity: minor

## Rule 4.1.2-14

### Requirement

>*Structure element uses <H>, but is recognized as a paragraph*

### Error details

Paragraph is incorrectly tagged as a heading

* Object type: `SAH`
* Test condition: `correctType != 'P'`
* Severity: minor

## Rule 4.1.2-15

### Requirement

>*Structure element uses one of <H1>, ..., <H7> tags, but is recognized as a paragraph*

### Error details

Paragraph is incorrectly tagged as a numbered heading

* Object type: `SAHn`
* Test condition: `correctType != 'P'`
* Severity: minor

## Rule 4.1.2-20

### Requirement

>*Structure element uses <P> tag, but is recognized as a figure caption*

### Error details

Caption is incorrectly tagged as a paragraph

* Object type: `SAP`
* Test condition: `correctType != 'Caption'`
* Severity: minor

## Rule 4.1.2-21

### Requirement

>*Part of the document is recognized as a list, but is not marked as a List related structure element*

### Error details

Missing List element(s)

* Object type: `SAStructElem`
* Test condition: `hasLowestDepthError == false || (correctSemanticScore >= 0.75 && standardType == correctType) || (correctType != 'LI' && correctType != 'Lbl' && correctType != 'LBody' && correctType != 'L') || (isTableElem == true)`
* Severity: minor

## Rule 4.1.2-22

### Requirement

>*The content is marked with <L> tag, but is not identified as a part of a list*

### Error details

Invalid List element

* Object type: `SAL`
* Test condition: `hasLowestDepthError == false || (correctType == 'L' && correctSemanticScore >= 0.75) || correctType == 'TR' || correctType == 'TD' || correctType == 'TH' || correctType == 'TBody' || correctType == 'LI' || correctType == 'Lbl' || correctType == 'LBody' || correctType == 'THead' || correctType == 'TFoot' || correctType == 'Table' || correctType == 'TOC' || correctType == 'TOCI'`
* Severity: minor

## Rule 4.1.2-23

### Requirement

>*The content is marked with <LI> tag, but is not identified as a part of a list*

### Error details

Invalid List item element

* Object type: `SALI`
* Test condition: `hasLowestDepthError == false || (correctType == 'LI' && correctSemanticScore >= 0.75) || correctType == 'L' || correctType == 'Lbl' || correctType == 'LBody' || correctType == 'TR' || correctType == 'TD' || correctType == 'TH' || correctType == 'TBody' || correctType == 'THead' || correctType == 'TFoot' || correctType == 'Table' || correctType == 'TOC' || correctType == 'TOCI'`
* Severity: minor

## Rule 4.1.2-25

### Requirement

>*The content is marked with <LBody> tag, but is not identified as a part of a list*

### Error details

Invalid List body element

* Object type: `SALBody`
* Test condition: `hasLowestDepthError == false || (correctType == 'LBody' && correctSemanticScore >= 0.75) || correctType == 'L' || correctType == 'LI' || correctType == 'Lbl' || correctType == 'TR' || correctType == 'TD' || correctType == 'TH' || correctType == 'TBody' || correctType == 'THead' || correctType == 'TFoot' || correctType == 'Table' || correctType == 'TOC' || correctType == 'TOCI'`
* Severity: minor

## Rule 4.1.2-26

### Requirement

>*The content is identified as a part of a table, but is tagged as a list*

### Error details

Table is incorrectly tagged as a list, or a list has invalid numbering

* Object type: `SAStructElem`
* Test condition: `hasLowestDepthError == false || (correctType != 'TD' && correctType != 'TR' && correctType != 'TH' && correctType != 'TBody' && correctType != 'THead' && correctType != 'TFoot' && correctType != 'Table') || (standardType != 'L' && standardType != 'LI' && standardType != 'Lbl' && standardType != 'LBody')`
* Severity: minor

## Rule 4.1.2-27

### Requirement

>*The content is identified as two or more paragraphs, but is marked with a single <P> tag*

### Error details

Several paragraphs tagged as one

* Object type: `SAP`
* Test condition: `correctType != 'Part' || correctSemanticScore < 0.75`
* Severity: minor

## Rule 4.1.2-28

### Requirement

>*The content is identified as a part of the table of content, but is not marked with a <TOCI> tag*

### Error details

Missing TOC item

* Object type: `SAStructElem`
* Test condition: `correctType != 'TOCI' || standardType == 'TOCI'`
* Severity: minor

## Rule 4.1.2-31

### Requirement

>*Page number inside the TOCI element (Table of Content item) does not match the page number of its link destination*

### Error details

TOC item points to the wrong page

* Object type: `SATOCI`
* Test condition: `errorCodes.split(',').filter(elem => elem == 1002).length == 0`
* Severity: minor

## Rule 4.1.2-32

### Requirement

>*<TOCI> structure element (Table of Content item) is not right aligned with other <TOCI> elements in the same <TOC>*

### Error details

TOC items are not right aligned

* Object type: `SATOCI`
* Test condition: `errorCodes.split(',').filter(elem => elem == 1003).length == 0`
* Severity: minor

## Rule 4.1.2-34

### Requirement

>*The context is identified as a continued list, but is split into multiple structure elements*

### Error details

Single list is tagged as multiple structure elements

* Object type: `SAStructElem`
* Test condition: `errorCodes.split(',').filter(elem => elem == 1200).length == 0`
* Severity: minor

## Rule 4.1.2-35

### Requirement

>*The context is identified as a single TOC, but is split into multiple <TOC> tags*

### Error details

Single TOC is tagged as multiple ones

* Object type: `SATOC`
* Test condition: `errorCodes.split(',').filter(elem => elem == 1006).length == 0`
* Severity: minor

## Rule 4.1.2-36

### Requirement

>*The number of <TR> tags in a <Table> structure element does not match the number of rows of the visual representation of this table*

### Error details

Invalid number of rows in a table

* Object type: `SATable`
* Test condition: `errorCodes.split(',').filter(elem => elem == 1104).length == 0`
* Severity: minor

## Rule 4.1.2-37

### Requirement

>*The number of columns in a <Table> structure element does not match the number of rows of the visual representation of this table*

### Error details

Invalid number of columns in a table

* Object type: `SATable`
* Test condition: `errorCodes.split(',').filter(elem => elem == 1105).length == 0`
* Severity: minor

## Rule 4.1.2-38

### Requirement

>*The row span of a <TD> or <TH> structure element (table cell) does not match the row span of the visual representation of this table cell*

### Error details

Invalid row span of a table cell

* Object type: `SATableCell`
* Test condition: `errorCodes.split(',').filter(elem => elem == 1106).length == 0`
* Severity: minor

## Rule 4.1.2-39

### Requirement

>*The column span of a <TD> or <TH> structure element (table cell) does not match the column span of the visual representation of this table cell*

### Error details

Invalid column span of a table cell

* Object type: `SATableCell`
* Test condition: `errorCodes.split(',').filter(elem => elem == 1107).length == 0`
* Severity: minor

## Rule 4.1.2-40

### Requirement

>*The content is recognized as a list item, but is not marked with <LI> tag*

### Error details

Missing list item

* Object type: `SAListItem`
* Test condition: `false`
* Severity: minor

## Rule 4.1.2-41

### Requirement

>*The content of a <TD> or <TH> structure element (table cell) is located below than some of the table cells of the next table row*

### Error details

Table cell is lower than expected

* Object type: `SATableCell`
* Test condition: `errorCodes.split(',').filter(elem => elem == 1100).length == 0`
* Severity: minor

## Rule 4.1.2-42

### Requirement

>*The content of a <TD> or <TH> structure element (table cell) is located above than some of the table cells of the previous table row*

### Error details

Table cell is higher than expected

* Object type: `SATableCell`
* Test condition: `errorCodes.split(',').filter(elem => elem == 1101).length == 0`
* Severity: minor

## Rule 4.1.2-43

### Requirement

>*The content of a <TD> or <TH> structure element (table cell) is located to the right to some of the table cells of the next table column*

### Error details

Table cell is shifted right

* Object type: `SATableCell`
* Test condition: `errorCodes.split(',').filter(elem => elem == 1102).length == 0`
* Severity: minor

## Rule 4.1.2-44

### Requirement

>*The content of a <TD> or <TH> structure element (table cell) is located to the left to some of the table cells of the previous table column*

### Error details

Table cell is shifted left

* Object type: `SATableCell`
* Test condition: `errorCodes.split(',').filter(elem => elem == 1103).length == 0`
* Severity: minor

## Rule 4.1.2-45

### Requirement

>*This structure element is recognized as <TD> (regular table cell), but is tagged as <TH> (table header)*

### Error details

Invalid table header

* Object type: `SATH`
* Test condition: `correctType != 'TD'`
* Severity: minor

## Rule 4.1.2-46

### Requirement

>*Table of Content item text does not match any heading in the document*

### Error details

TOC item text is not found in the document

* Object type: `SATOCI`
* Test condition: `errorCodes.split(',').filter(elem => elem == 1007).length == 0`
* Severity: major

## Rule 4.1.2-47

### Requirement

>*Table of Content item text is not found on the destination page*

### Error details

TOC item is not found on the destination page

* Object type: `SATOCI`
* Test condition: `errorCodes.split(',').filter(elem => elem == 1008).length == 0`
* Severity: major

## Rule 4.1.2-48

### Requirement

>*Table of Content item does not have an interactive link to the destination page*

### Error details

TOC item has no destination link

* Object type: `SATOCI`
* Test condition: `errorCodes.split(',').filter(elem => elem == 1009).length == 0`
* Severity: major

## Rule 4.1.2-49

### Requirement

>*Table of Content item has invalid page number (label)*

### Error details

Incorrect page number in TOC item

* Object type: `SATOCI`
* Test condition: `errorCodes.split(',').filter(elem => elem == 1010).length == 0`
* Severity: major

## Rule 4.1.2-50

### Requirement

>*Table of Content items numbering is inconsistent / does not follow any pattern*

### Error details

Inconsistent TOC item numbering

* Object type: `SATOCI`
* Test condition: `errorCodes.split(',').filter(elem => elem == 1011).length == 0`
* Severity: major

## Rule 4.1.2-51

### Requirement

>*<L> (List) element has another <L> element as its only immediate child*

### Error details

Single List inside List

* Object type: `SAL`
* Test condition: `errorCodes.split(',').filter(elem => elem == 1201).length == 0`
* Severity: minor

## Rule 4.1.2-52

### Requirement

>*Several list items are tagged as a single <LI> element*

### Error details

Several List items are tagged as one

* Object type: `SALI`
* Test condition: `errorCodes.split(',').filter(elem => elem == 1202).length == 0`
* Severity: minor

## Rule 4.1.2-53

### Requirement

>*A part of the text is recognized as a Note, but tagged as <Span> element*

### Error details

Note is tagged as a Span

* Object type: `SASpan`
* Test condition: `correctType != 'Note'`
* Severity: minor

## Rule 4.1.2-54

### Requirement

>*A part of the text is recognized as a Note, but tagged as <P> element*

### Error details

Note is tagged as a Paragraph

* Object type: `SAP`
* Test condition: `correctType != 'Note'`
* Severity: minor

## Rule 4.1.2-55

### Requirement

>*The heading is a single child of its ancestor structure element and is not grouped with the related content*

### Error details

The heading is not grouped with the related content

* Object type: `SAStructElem`
* Test condition: `errorCodes.split(',').filter(elem => elem == 1300).length == 0`
* Severity: minor

