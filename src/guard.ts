import {
    CHAR_0,
    CHAR_9,
    CHAR_A_LOWER,
    CHAR_A_UPPER,
    CHAR_COLON,
    CHAR_GREATER,
    CHAR_MINUS,
    CHAR_LINE_FEED,
    CHAR_SPACE,
    CHAR_Z_LOWER,
    CHAR_Z_UPPER,
    CHAR_CARRIAGE_RETURN,
    CHAR_DOT,
    CHAR_UNDERSCORE
} from "./char.js";

export function isLetter(char: number) {
    return (CHAR_A_UPPER <= char && char <= CHAR_Z_UPPER) || (CHAR_A_LOWER <= char && char <= CHAR_Z_LOWER);
}

export function isDigit(char: number) {
    return CHAR_0 <= char && char <= CHAR_9;
}

/**
 * vired bihavour due to chrome (support any names like ```center"``` or ```ele=ment``` )
 */
export function isValidTagNameSymbol(char: number) {
    return !(isSpace(char) || char == CHAR_GREATER);
}

export function isValidAttrNameSymbol(char: number) {
    return isLetter(char) || isDigit(char) || char == CHAR_MINUS || char == CHAR_COLON;
}

export function isSpace(char: number) {
    return char == CHAR_SPACE || char == CHAR_LINE_FEED || char == CHAR_CARRIAGE_RETURN;
}

export function toValidTagName(name: string) {
    const buffer: string[] = [];
    for (let i = 0; i < name.length; i++) {
        if (isValidHTMLElementNameChar(name.charCodeAt(i))) {
            buffer.push(name[i]);
        }   
    }
    return buffer.join("");
}

function isValidHTMLElementNameChar(char: number) {
    return isDigit(char) || isLetter(char);
}

/**
 * ```"-" | "." | [0-9] | "_" | [a-z] | #xB7 | [#xC0-#xD6] | [#xD8-#xF6] | [#xF8-#x37D] | [#x37F-#x1FFF] | [#x200C-#x200D] | [#x203F-#x2040] | [#x2070-#x218F] | [#x2C00-#x2FEF] | [#x3001-#xD7FF] | [#xF900-#xFDCF] | [#xFDF0-#xFFFD] | [#x10000-#xEFFFF]```
 */
function isPCENChar(codePoint: number) {
    if (codePoint == CHAR_MINUS) return true;
    if (codePoint == CHAR_DOT) return true;
    if (isDigit(codePoint)) return true;
    if (codePoint == CHAR_UNDERSCORE) return true;
    if (isLetter(codePoint)) return true;
    if (codePoint == 0xB7) return true;
    if (0x0C <= codePoint && codePoint <= 0xD6) return true;
    if (0xD8 <= codePoint && codePoint <= 0xF6) return true;
    if (0xF8 <= codePoint && codePoint <= 0x37D) return true;
    if (0x37F <= codePoint && codePoint <= 0x1FFF) return true;
    if (0x200C <= codePoint && codePoint <= 0x200D) return true;
    if (0x203F <= codePoint && codePoint <= 0x2040) return true;
    if (0x2070 <= codePoint && codePoint <= 0x218F) return true;
    if (0x2C00 <= codePoint && codePoint <= 0x2FEF) return true;
    if (0x3001 <= codePoint && codePoint <= 0xD7FF) return true;
    if (0xF900 <= codePoint && codePoint <= 0xFDCF) return true;
    if (0xFDF0 <= codePoint && codePoint <= 0xFFFD) return true;
    if (0x10000 <= codePoint && codePoint <= 0xEFFFF) return true;
    return false;
}