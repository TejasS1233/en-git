/**
 * Code Quality Analyzer
 * Analyzes code files and provides quality metrics
 */

export class CodeQualityAnalyzer {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Analyze a code file and return quality metrics
   */
  async analyzeFile(content, fileInfo) {
    const cacheKey = `${fileInfo.path}-${fileInfo.sha || Date.now()}`;

    // Check cache
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.data;
      }
    }

    const metrics = {
      qualityScore: this.calculateQualityScore(content, fileInfo),
      complexity: this.calculateComplexity(content, fileInfo),
      linesOfCode: this.countLines(content),
      issues: this.findIssues(content, fileInfo),
      suggestions: this.generateSuggestions(content, fileInfo),
      breakdown: this.getScoreBreakdown(content, fileInfo),
    };

    // Cache results
    this.cache.set(cacheKey, {
      data: metrics,
      timestamp: Date.now(),
    });

    return metrics;
  }

  /**
   * Calculate overall quality score (0-100)
   */
  calculateQualityScore(content, fileInfo) {
    let score = 100;
    const lines = content.split("\n");
    const ext = fileInfo.extension?.toLowerCase();

    // File size penalty
    if (lines.length > 500) score -= 10;
    else if (lines.length > 300) score -= 5;

    // Long lines penalty
    const longLines = lines.filter((line) => line.length > 120).length;
    score -= Math.min(longLines * 2, 15);

    // Comment ratio (good to have 10-20% comments)
    const commentLines = this.countCommentLines(content, ext);
    const commentRatio = commentLines / lines.length;
    if (commentRatio < 0.05) score -= 15; // Too few comments
    else if (commentRatio > 0.4) score -= 5; // Too many comments

    // Function length check
    const longFunctions = this.findLongFunctions(content, ext);
    score -= Math.min(longFunctions.length * 5, 20);

    // Deep nesting penalty
    const deepNesting = this.findDeepNesting(content);
    score -= Math.min(deepNesting * 10, 20);

    // TODO/FIXME comments (technical debt)
    const todoCount = (content.match(/TODO|FIXME|HACK|XXX/gi) || []).length;
    score -= Math.min(todoCount * 5, 15);

    // Console.log/print statements (should be removed in production)
    const debugStatements = this.countDebugStatements(content, ext);
    score -= Math.min(debugStatements * 3, 10);

    // Magic numbers (hardcoded values)
    const magicNumbers = this.findMagicNumbers(content, ext);
    score -= Math.min(magicNumbers * 2, 10);

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Calculate code complexity
   */
  calculateComplexity(content, fileInfo) {
    let complexity = 0;
    const ext = fileInfo.extension?.toLowerCase();

    // Count control flow statements
    const patterns = {
      if: /\bif\s*\(/g,
      else: /\belse\b/g,
      for: /\bfor\s*\(/g,
      while: /\bwhile\s*\(/g,
      switch: /\bswitch\s*\(/g,
      case: /\bcase\s+/g,
      catch: /\bcatch\s*\(/g,
      ternary: /\?[^:]+:/g,
      logicalAnd: /&&/g,
      logicalOr: /\|\|/g,
    };

    for (const [key, pattern] of Object.entries(patterns)) {
      const matches = content.match(pattern);
      if (matches) {
        complexity += matches.length;
      }
    }

    // Classify complexity
    if (complexity < 10) return "Low";
    if (complexity < 25) return "Medium";
    return "High";
  }

  /**
   * Count lines of code (excluding comments and blank lines)
   */
  countLines(content) {
    const lines = content.split("\n");
    return lines.filter((line) => {
      const trimmed = line.trim();
      return (
        trimmed.length > 0 &&
        !trimmed.startsWith("//") &&
        !trimmed.startsWith("/*") &&
        !trimmed.startsWith("*") &&
        !trimmed.startsWith("#")
      );
    }).length;
  }

  /**
   * Count comment lines
   */
  countCommentLines(content, ext) {
    const lines = content.split("\n");
    let commentLines = 0;
    let inBlockComment = false;

    for (const line of lines) {
      const trimmed = line.trim();

      // Block comments
      if (trimmed.includes("/*")) inBlockComment = true;
      if (inBlockComment) {
        commentLines++;
        if (trimmed.includes("*/")) inBlockComment = false;
        continue;
      }

      // Single line comments
      if (trimmed.startsWith("//") || trimmed.startsWith("#")) {
        commentLines++;
      }
    }

    return commentLines;
  }

  /**
   * Find long functions (>50 lines)
   */
  findLongFunctions(content, ext) {
    const longFunctions = [];
    const lines = content.split("\n");
    let inFunction = false;
    let functionStart = 0;
    let functionName = "";
    let braceCount = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Detect function start
      if (/function\s+\w+|const\s+\w+\s*=\s*\(|=>\s*{/.test(line)) {
        inFunction = true;
        functionStart = i;
        const match = line.match(/function\s+(\w+)|const\s+(\w+)/);
        functionName = match ? match[1] || match[2] : "anonymous";
        braceCount =
          (line.match(/{/g) || []).length - (line.match(/}/g) || []).length;
      } else if (inFunction) {
        braceCount +=
          (line.match(/{/g) || []).length - (line.match(/}/g) || []).length;

        if (braceCount === 0) {
          const functionLength = i - functionStart + 1;
          if (functionLength > 50) {
            longFunctions.push({
              name: functionName,
              length: functionLength,
              line: functionStart + 1,
            });
          }
          inFunction = false;
        }
      }
    }

    return longFunctions;
  }

  /**
   * Find deep nesting (>3 levels)
   */
  findDeepNesting(content) {
    const lines = content.split("\n");
    let maxNesting = 0;
    let currentNesting = 0;
    let deepNestingCount = 0;

    for (const line of lines) {
      const openBraces = (line.match(/{/g) || []).length;
      const closeBraces = (line.match(/}/g) || []).length;

      currentNesting += openBraces - closeBraces;
      maxNesting = Math.max(maxNesting, currentNesting);

      if (currentNesting > 3) {
        deepNestingCount++;
      }
    }

    return deepNestingCount;
  }

  /**
   * Count debug statements
   */
  countDebugStatements(content, ext) {
    const patterns = [
      /console\.(log|debug|info|warn|error)/g,
      /print\s*\(/g,
      /println\s*\(/g,
      /System\.out\.println/g,
      /debugger;/g,
    ];

    let count = 0;
    for (const pattern of patterns) {
      const matches = content.match(pattern);
      if (matches) count += matches.length;
    }

    return count;
  }

  /**
   * Find magic numbers (hardcoded numeric values)
   */
  findMagicNumbers(content, ext) {
    // Exclude common values like 0, 1, 2, 100, 1000
    const magicNumberPattern = /\b(?!0\b|1\b|2\b|10\b|100\b|1000\b)\d{2,}\b/g;
    const matches = content.match(magicNumberPattern);
    return matches ? matches.length : 0;
  }

  /**
   * Find specific issues in the code
   */
  findIssues(content, fileInfo) {
    const issues = [];
    const ext = fileInfo.extension?.toLowerCase();

    // Long functions
    const longFunctions = this.findLongFunctions(content, ext);
    longFunctions.forEach((fn) => {
      issues.push({
        type: "warning",
        message: `Function '${fn.name}' is too long (${fn.length} lines)`,
        line: fn.line,
        severity: "medium",
      });
    });

    // Missing comments
    const commentRatio =
      this.countCommentLines(content, ext) / content.split("\n").length;
    if (commentRatio < 0.05) {
      issues.push({
        type: "warning",
        message: "Low comment ratio - consider adding more documentation",
        severity: "low",
      });
    }

    // Debug statements
    const debugCount = this.countDebugStatements(content, ext);
    if (debugCount > 0) {
      issues.push({
        type: "warning",
        message: `Found ${debugCount} debug statement(s) - should be removed in production`,
        severity: "medium",
      });
    }

    // TODO comments
    const todoCount = (content.match(/TODO|FIXME/gi) || []).length;
    if (todoCount > 0) {
      issues.push({
        type: "info",
        message: `Found ${todoCount} TODO/FIXME comment(s)`,
        severity: "low",
      });
    }

    return issues;
  }

  /**
   * Generate improvement suggestions
   */
  generateSuggestions(content, fileInfo) {
    const suggestions = [];
    const score = this.calculateQualityScore(content, fileInfo);

    if (score < 70) {
      suggestions.push("Consider refactoring to improve code quality");
    }

    const longFunctions = this.findLongFunctions(content, fileInfo.extension);
    if (longFunctions.length > 0) {
      suggestions.push(
        "Break down long functions into smaller, reusable functions"
      );
    }

    const commentRatio =
      this.countCommentLines(content, fileInfo.extension) /
      content.split("\n").length;
    if (commentRatio < 0.1) {
      suggestions.push("Add JSDoc/docstring comments to document functions");
    }

    if (this.countDebugStatements(content, fileInfo.extension) > 0) {
      suggestions.push("Remove console.log/debug statements before production");
    }

    const complexity = this.calculateComplexity(content, fileInfo);
    if (complexity === "High") {
      suggestions.push("Reduce complexity by simplifying control flow");
    }

    if (content.split("\n").length > 300) {
      suggestions.push("Consider splitting this file into smaller modules");
    }

    return suggestions;
  }

  /**
   * Get detailed score breakdown
   */
  getScoreBreakdown(content, fileInfo) {
    const breakdown = {
      structure: 100,
      documentation: 100,
      complexity: 100,
      bestPractices: 100,
    };

    // Structure score
    const lines = content.split("\n").length;
    if (lines > 500) breakdown.structure -= 30;
    else if (lines > 300) breakdown.structure -= 15;

    const longFunctions = this.findLongFunctions(content, fileInfo.extension);
    breakdown.structure -= Math.min(longFunctions.length * 10, 40);

    // Documentation score
    const commentRatio =
      this.countCommentLines(content, fileInfo.extension) / lines;
    if (commentRatio < 0.05) breakdown.documentation -= 50;
    else if (commentRatio < 0.1) breakdown.documentation -= 30;
    else if (commentRatio < 0.15) breakdown.documentation -= 15;

    // Complexity score
    const complexityLevel = this.calculateComplexity(content, fileInfo);
    if (complexityLevel === "High") breakdown.complexity -= 40;
    else if (complexityLevel === "Medium") breakdown.complexity -= 20;

    const deepNesting = this.findDeepNesting(content);
    breakdown.complexity -= Math.min(deepNesting * 5, 30);

    // Best practices score
    const debugCount = this.countDebugStatements(content, fileInfo.extension);
    breakdown.bestPractices -= Math.min(debugCount * 10, 30);

    const magicNumbers = this.findMagicNumbers(content, fileInfo.extension);
    breakdown.bestPractices -= Math.min(magicNumbers * 5, 20);

    const todoCount = (content.match(/TODO|FIXME/gi) || []).length;
    breakdown.bestPractices -= Math.min(todoCount * 5, 20);

    // Ensure scores are between 0-100
    for (const key in breakdown) {
      breakdown[key] = Math.max(0, Math.min(100, breakdown[key]));
    }

    return breakdown;
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }
}

// Export singleton instance
export const codeQualityAnalyzer = new CodeQualityAnalyzer();
