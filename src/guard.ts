import {
    CHAR_0,
    CHAR_9,
    CHAR_A_LOWER,
    CHAR_A_UPPER,
    CHAR_COLON,
    CHAR_GREATER,
    CHAR_MINUS,
    CHAR_NEW_LINE,
    CHAR_SPACE,
    CHAR_Z_LOWER,
    CHAR_Z_UPPER
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
    return char == CHAR_SPACE || char == CHAR_NEW_LINE;
}