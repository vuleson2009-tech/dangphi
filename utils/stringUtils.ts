export function removeVietnameseTones(str: string): string {
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
    str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
    str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
    str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
    str = str.replace(/Đ/g, "D");
    // Combining Diacritical Marks
    str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); 
    return str;
}

function levenshteinDistance(s1: string, s2: string): number {
    const len1 = s1.length;
    const len2 = s2.length;
    
    // Use two rows algorithm to save memory
    let prevRow = Array(len2 + 1).fill(0).map((_, i) => i);
    let currentRow = Array(len2 + 1).fill(0);

    for (let i = 1; i <= len1; i++) {
        currentRow[0] = i;
        for (let j = 1; j <= len2; j++) {
            const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
            currentRow[j] = Math.min(
                prevRow[j] + 1,      // deletion
                currentRow[j - 1] + 1,  // insertion
                prevRow[j - 1] + cost   // substitution
            );
        }
        // Swap rows for next iteration
        [prevRow, currentRow] = [currentRow, prevRow];
    }
    
    return prevRow[len2];
}

export function fuzzyMatch(text: string, query: string): boolean {
    if (!text || !query) return false;
    
    // Normalize: lowercase and remove tones for Vietnamese support
    const cleanText = removeVietnameseTones(text.toLowerCase());
    const cleanQuery = removeVietnameseTones(query.toLowerCase());

    // 1. Direct inclusion (covers exact matches, substring matches ignoring case/accents)
    // This handles "pho" finding "phở bò"
    if (cleanText.includes(cleanQuery)) return true;

    // 2. Fuzzy match for typos
    // Only apply if query is long enough (3+ chars) to avoid matching noise
    if (cleanQuery.length < 3) return false;

    // Split text into words to check against query words
    // This allows query "pjo" (typo of pho) to match "phở" in "ăn phở"
    const words = cleanText.split(/[\s,.-]+/);
    
    // Dynamic tolerance: 1 error for short words, 2 for longer queries
    const maxDistance = cleanQuery.length > 5 ? 2 : 1;

    for (const word of words) {
        // Optimization: skip if length difference is too large
        if (Math.abs(word.length - cleanQuery.length) > maxDistance) continue;
        
        if (levenshteinDistance(word, cleanQuery) <= maxDistance) {
            return true;
        }
    }

    return false;
}