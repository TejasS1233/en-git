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
  async analyzeFile(content, fileInfo, useAI = true) {
    const cacheKey = `${fileInfo.path}-${fileInfo.sha || Date.now()}`;

    // Check cache
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.data;
      }
    }

    // Basic static analysis (fast)
    const basicMetrics = {
      qualityScore: this.calculateQualityScore(content, fileInfo),
      complexity: this.calculateComplexity(content, fileInfo),
      linesOfCode: this.countLines(content),
      issues: this.findIssues(content, fileInfo),
      suggestions: this.generateSuggestions(content, fileInfo),
      breakdown: this.getScoreBreakdown(content, fileInfo),
      // Enhanced metrics
      security: this.analyzeSecurityIssues(content, fileInfo),
      performance: this.analyzePerformance(content, fileInfo),
      codeSmells: this.detectCodeSmells(content, fileInfo),
      maintainability: this.calculateMaintainabilityIndex(content, fileInfo),
      detailedMetrics: this.getDetailedMetrics(content, fileInfo),
      bestPractices: this.checkBestPractices(content, fileInfo),
    };

    // Add AI analysis if enabled and file is reasonable size
    if (useAI && content.length < 50000) {
      try {
        // Dynamically import AI service
        const aiModule = await import("./aiCodeAnalysis.js");
        const aiService = aiModule.aiCodeAnalysisService;

        // Run AI analysis in background (don't block basic results)
        basicMetrics.aiAnalysis = {
          status: "analyzing",
          message: "AI agents are analyzing your code...",
        };

        // Start AI analysis
        aiService
          .analyzeWithAI(content, fileInfo, basicMetrics)
          .then((aiInsights) => {
            // Update cache with AI results
            basicMetrics.aiAnalysis = aiInsights;
            this.cache.set(cacheKey, {
              data: basicMetrics,
              timestamp: Date.now(),
            });

            // Trigger custom event to update UI
            window.dispatchEvent(
              new CustomEvent("en-git-ai-analysis-complete", {
                detail: { fileInfo, aiInsights },
              })
            );
          });
      } catch (error) {
        console.warn("AI analysis not available:", error);
        basicMetrics.aiAnalysis = {
          enabled: false,
          message: "AI analysis unavailable",
        };
      }
    } else {
      basicMetrics.aiAnalysis = {
        enabled: false,
        message: useAI
          ? "File too large for AI analysis"
          : "AI analysis disabled",
      };
    }

    // Cache results
    this.cache.set(cacheKey, {
      data: basicMetrics,
      timestamp: Date.now(),
    });

    return basicMetrics;
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

  /**
   * Analyze security vulnerabilities
   */
  analyzeSecurityIssues(content, fileInfo) {
    const issues = [];
    const ext = fileInfo.extension?.toLowerCase();

    // SQL Injection patterns
    if (
      /\$\{.*\}|`\$\{|String\s*\+|concat\(.*\+/i.test(content) &&
      /(SELECT|INSERT|UPDATE|DELETE|FROM|WHERE)/i.test(content)
    ) {
      issues.push({
        type: "critical",
        category: "SQL Injection",
        message: "Potential SQL injection vulnerability detected",
        description:
          "String concatenation or template literals used in SQL queries. Use parameterized queries instead.",
        severity: "critical",
      });
    }

    // XSS vulnerabilities
    if (
      /innerHTML|outerHTML|document\.write|eval\(/.test(content) &&
      /\$\{|req\.|params\.|query\.|body\./i.test(content)
    ) {
      issues.push({
        type: "critical",
        category: "XSS",
        message: "Potential Cross-Site Scripting (XSS) vulnerability",
        description:
          "Unsafe DOM manipulation with user input. Sanitize all user inputs before inserting into DOM.",
        severity: "critical",
      });
    }

    // Eval usage
    const evalMatches = content.match(/\beval\s*\(/g);
    if (evalMatches) {
      issues.push({
        type: "critical",
        category: "Code Execution",
        message: `Found ${evalMatches.length} eval() usage(s)`,
        description:
          "eval() executes arbitrary code and is a major security risk. Avoid using eval().",
        severity: "critical",
      });
    }

    // Hardcoded secrets/credentials
    const secretPatterns = [
      { pattern: /password\s*=\s*['"][^'"]{4,}['"]/, name: "Password" },
      { pattern: /api[_-]?key\s*=\s*['"][^'"]{10,}['"]/, name: "API Key" },
      { pattern: /secret\s*=\s*['"][^'"]{10,}['"]/, name: "Secret" },
      { pattern: /token\s*=\s*['"][^'"]{20,}['"]/, name: "Token" },
      {
        pattern: /aws[_-]?access[_-]?key/i,
        name: "AWS Access Key",
      },
    ];

    secretPatterns.forEach(({ pattern, name }) => {
      if (pattern.test(content)) {
        issues.push({
          type: "critical",
          category: "Hardcoded Credentials",
          message: `Potential hardcoded ${name} detected`,
          description: `Use environment variables or secure credential storage instead of hardcoding ${name.toLowerCase()}s.`,
          severity: "critical",
        });
      }
    });

    // Insecure random
    if (
      /Math\.random\(\)/.test(content) &&
      /crypto|security|token|session/i.test(content)
    ) {
      issues.push({
        type: "warning",
        category: "Weak Randomness",
        message: "Math.random() used in security context",
        description:
          "Math.random() is not cryptographically secure. Use crypto.randomBytes() or window.crypto.getRandomValues() for security purposes.",
        severity: "high",
      });
    }

    // HTTP instead of HTTPS
    if (/http:\/\/(?!localhost|127\.0\.0\.1)/i.test(content)) {
      issues.push({
        type: "warning",
        category: "Insecure Protocol",
        message: "HTTP URLs detected (use HTTPS)",
        description: "Always use HTTPS for secure communication.",
        severity: "medium",
      });
    }

    // Unsafe file operations
    if (
      /fs\.readFileSync|fs\.writeFileSync|child_process\.exec/.test(content)
    ) {
      issues.push({
        type: "warning",
        category: "Unsafe Operations",
        message: "Potentially unsafe file/process operations",
        description:
          "Synchronous file operations can block the event loop. Validate all file paths and sanitize command inputs.",
        severity: "medium",
      });
    }

    return {
      issues,
      score: Math.max(0, 100 - issues.length * 15),
      critical: issues.filter((i) => i.severity === "critical").length,
      high: issues.filter((i) => i.severity === "high").length,
      medium: issues.filter((i) => i.severity === "medium").length,
    };
  }

  /**
   * Analyze performance issues
   */
  analyzePerformance(content, fileInfo) {
    const issues = [];

    // Nested loops
    const nestedLoopPattern = /for\s*\([^)]*\)[^{]*{[^}]*for\s*\([^)]*\)/g;
    const nestedLoops = content.match(nestedLoopPattern);
    if (nestedLoops) {
      issues.push({
        type: "warning",
        message: `${nestedLoops.length} nested loop(s) detected`,
        description:
          "Nested loops can cause O(n²) or worse complexity. Consider optimizing with maps/sets.",
        impact: "High time complexity",
        severity: "medium",
      });
    }

    // Array methods in loops
    if (/for\s*\([^)]*\)[^{]*{[^}]*\.(push|concat|splice)/.test(content)) {
      issues.push({
        type: "info",
        message: "Array mutations inside loops",
        description:
          "Frequent array mutations in loops can be slow. Consider pre-allocating or using different data structures.",
        impact: "Memory allocation overhead",
        severity: "low",
      });
    }

    // Multiple DOM queries in loops
    if (
      /for\s*\([^)]*\)[^{]*{[^}]*(querySelector|getElementById|getElementsBy)/.test(
        content
      )
    ) {
      issues.push({
        type: "warning",
        message: "DOM queries inside loops",
        description:
          "Cache DOM references outside loops to avoid repeated queries.",
        impact: "Repeated expensive DOM operations",
        severity: "medium",
      });
    }

    // Synchronous operations
    const syncOps = [
      { pattern: /\.readFileSync\(/, name: "Synchronous file read" },
      { pattern: /\.writeFileSync\(/, name: "Synchronous file write" },
      { pattern: /JSON\.parse\([^)]{200,}\)/, name: "Large JSON.parse()" },
    ];

    syncOps.forEach(({ pattern, name }) => {
      if (pattern.test(content)) {
        issues.push({
          type: "warning",
          message: name,
          description:
            "Blocking operations can freeze the event loop. Use async alternatives.",
          impact: "Event loop blocking",
          severity: "medium",
        });
      }
    });

    // Memory leaks
    if (
      /addEventListener\(/.test(content) &&
      !/removeEventListener\(/.test(content)
    ) {
      issues.push({
        type: "info",
        message: "Event listeners without cleanup",
        description:
          "Always remove event listeners to prevent memory leaks, especially in SPAs.",
        impact: "Potential memory leak",
        severity: "low",
      });
    }

    // Large objects/arrays
    const largeArrayMatch = content.match(/\[[^\]]{500,}\]/);
    if (largeArrayMatch) {
      issues.push({
        type: "info",
        message: "Large inline array detected",
        description:
          "Consider loading large datasets from external files or APIs.",
        impact: "Bundle size increase",
        severity: "low",
      });
    }

    // Inefficient string concatenation in loops
    if (/for\s*\([^)]*\)[^{]*{[^}]*\+=\s*['"`]/.test(content)) {
      issues.push({
        type: "warning",
        message: "String concatenation in loops",
        description:
          "Use array.join() or template literals for better performance.",
        impact: "String allocation overhead",
        severity: "low",
      });
    }

    return {
      issues,
      score: Math.max(0, 100 - issues.length * 10),
      optimizationOpportunities: issues.length,
    };
  }

  /**
   * Detect code smells and anti-patterns
   */
  detectCodeSmells(content, fileInfo) {
    const smells = [];

    // God Object/Class (too many methods)
    const methodCount = (content.match(/function\s+\w+|const\s+\w+\s*=/g) || [])
      .length;
    if (methodCount > 20) {
      smells.push({
        type: "God Object",
        message: `File contains ${methodCount} functions/methods`,
        description:
          "Consider breaking this into smaller, focused modules following Single Responsibility Principle.",
        severity: "medium",
      });
    }

    // Long parameter lists
    const longParams = content.match(/function\s+\w+\s*\([^)]{60,}\)/g);
    if (longParams) {
      smells.push({
        type: "Long Parameter List",
        message: `${longParams.length} function(s) with long parameter lists`,
        description: "Use objects/config patterns instead of many parameters.",
        severity: "low",
      });
    }

    // Duplicated code
    const lines = content
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 10);
    const duplicates = lines.filter(
      (line, idx) => lines.indexOf(line) !== idx
    ).length;
    if (duplicates > 10) {
      smells.push({
        type: "Code Duplication",
        message: `~${duplicates} duplicated lines detected`,
        description: "Extract common code into reusable functions/utilities.",
        severity: "medium",
      });
    }

    // Feature Envy (excessive chaining)
    const chainMatches = content.match(
      /\.\w+\(\)[.\s]*\.\w+\(\)[.\s]*\.\w+\(\)/g
    );
    if (chainMatches && chainMatches.length > 5) {
      smells.push({
        type: "Feature Envy",
        message: "Excessive method chaining detected",
        description:
          "Long chains can be hard to debug. Consider intermediate variables.",
        severity: "low",
      });
    }

    // Primitive Obsession
    if (/string|number|boolean/gi.test(content)) {
      const primitiveCount = (
        content.match(/:\s*(string|number|boolean)/gi) || []
      ).length;
      if (primitiveCount > 15) {
        smells.push({
          type: "Primitive Obsession",
          message: "Heavy use of primitive types",
          description:
            "Consider using custom types/classes for better type safety.",
          severity: "low",
        });
      }
    }

    // Shotgun Surgery (try-catch everywhere)
    const tryCatchCount = (content.match(/try\s*{/g) || []).length;
    if (tryCatchCount > 5) {
      smells.push({
        type: "Shotgun Surgery",
        message: `${tryCatchCount} try-catch blocks`,
        description:
          "Centralize error handling with error boundaries or middleware.",
        severity: "low",
      });
    }

    // Dead code
    const unusedVars = content.match(/const\s+\w+\s*=.*;\s*$(?![\s\S]*\1)/gm);
    if (unusedVars && unusedVars.length > 3) {
      smells.push({
        type: "Dead Code",
        message: "Potentially unused variables detected",
        description:
          "Remove unused code to reduce bundle size and improve readability.",
        severity: "low",
      });
    }

    // Magic strings/numbers
    const magicStrings = content.match(/['"][A-Z_]{4,}['"]/g);
    if (magicStrings && magicStrings.length > 5) {
      smells.push({
        type: "Magic Values",
        message: "Many hardcoded strings detected",
        description:
          "Extract constants to named variables for better maintainability.",
        severity: "low",
      });
    }

    return {
      smells,
      score: Math.max(0, 100 - smells.length * 8),
      totalSmells: smells.length,
    };
  }

  /**
   * Calculate Maintainability Index (0-100)
   * Based on Halstead metrics and cyclomatic complexity
   */
  calculateMaintainabilityIndex(content, fileInfo) {
    const lines = content.split("\n");
    const linesOfCode = this.countLines(content);
    const complexity = this.getNumericComplexity(content);
    const commentRatio =
      this.countCommentLines(content, fileInfo.extension) / lines.length;

    // Simplified maintainability index
    let mi = 100;

    // Volume penalty (based on LOC)
    if (linesOfCode > 500) mi -= 30;
    else if (linesOfCode > 300) mi -= 20;
    else if (linesOfCode > 150) mi -= 10;

    // Complexity penalty
    mi -= Math.min(complexity, 40);

    // Documentation bonus
    if (commentRatio >= 0.15) mi += 10;
    else if (commentRatio < 0.05) mi -= 15;

    // Coupling (imports/requires)
    const imports = (content.match(/import\s|require\s*\(/g) || []).length;
    mi -= Math.min(imports * 2, 20);

    mi = Math.max(0, Math.min(100, Math.round(mi)));

    let rating;
    if (mi >= 80) rating = "Excellent";
    else if (mi >= 65) rating = "Good";
    else if (mi >= 50) rating = "Fair";
    else if (mi >= 25) rating = "Poor";
    else rating = "Critical";

    return {
      index: mi,
      rating,
      technicalDebt: this.estimateTechnicalDebt(mi, linesOfCode),
    };
  }

  /**
   * Get numeric complexity value
   */
  getNumericComplexity(content) {
    const patterns = {
      if: /\bif\s*\(/g,
      for: /\bfor\s*\(/g,
      while: /\bwhile\s*\(/g,
      switch: /\bswitch\s*\(/g,
      case: /\bcase\s+/g,
      catch: /\bcatch\s*\(/g,
      ternary: /\?[^:]+:/g,
      logicalAnd: /&&/g,
      logicalOr: /\|\|/g,
    };

    let complexity = 0;
    for (const pattern of Object.values(patterns)) {
      const matches = content.match(pattern);
      if (matches) complexity += matches.length;
    }

    return complexity;
  }

  /**
   * Estimate technical debt in hours
   */
  estimateTechnicalDebt(mi, linesOfCode) {
    // Lower maintainability = more debt
    const debtFactor = (100 - mi) / 100;
    const hoursPerLine = 0.05; // Avg 3 minutes per line to refactor
    const estimatedHours = Math.round(debtFactor * linesOfCode * hoursPerLine);

    return {
      hours: estimatedHours,
      days: Math.round(estimatedHours / 8),
      priority: mi < 50 ? "High" : mi < 65 ? "Medium" : "Low",
    };
  }

  /**
   * Get detailed code metrics
   */
  getDetailedMetrics(content, fileInfo) {
    const lines = content.split("\n");

    return {
      totalLines: lines.length,
      codeLines: this.countLines(content),
      commentLines: this.countCommentLines(content, fileInfo.extension),
      blankLines: lines.filter((l) => l.trim().length === 0).length,
      functions: (content.match(/function\s+\w+|const\s+\w+\s*=/g) || [])
        .length,
      classes: (content.match(/class\s+\w+/g) || []).length,
      imports: (content.match(/import\s|require\s*\(/g) || []).length,
      exports: (content.match(/export\s|module\.exports/g) || []).length,
      conditionals: (content.match(/\bif\s*\(|\belse\b|\bswitch\s*\(/g) || [])
        .length,
      loops: (content.match(/\bfor\s*\(|\bwhile\s*\(/g) || []).length,
      tryCatch: (content.match(/\btry\s*{|\bcatch\s*\(/g) || []).length,
      avgLineLength: Math.round(
        lines.reduce((sum, line) => sum + line.length, 0) / lines.length
      ),
      maxLineLength: Math.max(...lines.map((l) => l.length)),
      cyclomaticComplexity: this.getNumericComplexity(content),
    };
  }

  /**
   * Check language-specific best practices
   */
  checkBestPractices(content, fileInfo) {
    const violations = [];
    const ext = fileInfo.extension?.toLowerCase();

    // JavaScript/TypeScript specific
    if (ext === ".js" || ext === ".jsx" || ext === ".ts" || ext === ".tsx") {
      // Use const/let instead of var
      if (/\bvar\s+\w+/.test(content)) {
        violations.push({
          rule: "Use const/let",
          message: "Avoid 'var', use 'const' or 'let' instead",
          severity: "low",
        });
      }

      // Arrow functions for callbacks
      if (/\.map\s*\(\s*function\s*\(/.test(content)) {
        violations.push({
          rule: "Arrow Functions",
          message: "Use arrow functions for cleaner callback syntax",
          severity: "low",
        });
      }

      // Async/await vs promises
      if (
        /\.then\s*\([^)]*\)\.then\s*\(/.test(content) &&
        !/async\s+/.test(content)
      ) {
        violations.push({
          rule: "Async/Await",
          message: "Consider using async/await instead of promise chains",
          severity: "low",
        });
      }

      // Strict equality
      if (/[^=!]==[^=]|!=[^=]/.test(content)) {
        violations.push({
          rule: "Strict Equality",
          message: "Use === and !== instead of == and !=",
          severity: "medium",
        });
      }

      // Optional chaining
      if (/&&\s*\w+\.\w+\s*&&\s*\w+\.\w+\.\w+/.test(content)) {
        violations.push({
          rule: "Optional Chaining",
          message:
            "Consider using optional chaining (?.) for safer property access",
          severity: "low",
        });
      }
    }

    // React specific
    if (ext === ".jsx" || ext === ".tsx") {
      // Missing key prop in lists
      if (
        /\.map\s*\([^)]*\)\s*=>\s*</.test(content) &&
        !/key=/i.test(content)
      ) {
        violations.push({
          rule: "React Keys",
          message: "Add 'key' prop to elements in lists",
          severity: "medium",
        });
      }

      // Inline functions in JSX
      if (/<\w+[^>]*\s+on\w+={[^}]*=>/g.test(content)) {
        violations.push({
          rule: "React Performance",
          message:
            "Avoid inline functions in JSX (use useCallback or class methods)",
          severity: "low",
        });
      }
    }

    // Python specific
    if (ext === ".py") {
      // PEP 8 line length
      const longLines = content
        .split("\n")
        .filter((line) => line.length > 79).length;
      if (longLines > 0) {
        violations.push({
          rule: "PEP 8",
          message: `${longLines} line(s) exceed 79 characters`,
          severity: "low",
        });
      }
    }

    return {
      violations,
      score: Math.max(0, 100 - violations.length * 10),
      compliant: violations.length === 0,
    };
  }
}

// Export singleton instance
export const codeQualityAnalyzer = new CodeQualityAnalyzer();
