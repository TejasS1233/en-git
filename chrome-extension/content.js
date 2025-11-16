// Content script that runs on GitHub pages
console.log("en-git content script loaded");

// Helper function to check if extension context is valid
function isExtensionContextValid() {
  try {
    return chrome.runtime && chrome.runtime.id;
  } catch (e) {
    return false;
  }
}

// Global error handler for extension context invalidation
window.addEventListener("error", (event) => {
  if (
    event.message &&
    event.message.includes("Extension context invalidated")
  ) {
    console.log("en-git: Extension was reloaded. Please refresh the page.");
    event.preventDefault();
  }
});

// ==================== CODE QUALITY ANALYZER (Inline) ====================
// Inlined to avoid ES6 module import issues in content scripts

class CodeQualityAnalyzer {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
  }

  async analyzeFile(content, fileInfo) {
    const cacheKey = `${fileInfo.path}-${fileInfo.sha || Date.now()}`;

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
      // Enhanced metrics
      security: this.analyzeSecurityIssues
        ? this.analyzeSecurityIssues(content, fileInfo)
        : null,
      performance: this.analyzePerformance
        ? this.analyzePerformance(content, fileInfo)
        : null,
      codeSmells: this.detectCodeSmells
        ? this.detectCodeSmells(content, fileInfo)
        : null,
      maintainability: this.calculateMaintainabilityIndex
        ? this.calculateMaintainabilityIndex(content, fileInfo)
        : null,
      detailedMetrics: this.getDetailedMetrics
        ? this.getDetailedMetrics(content, fileInfo)
        : null,
      bestPractices: this.checkBestPractices
        ? this.checkBestPractices(content, fileInfo)
        : null,
    };

    this.cache.set(cacheKey, {
      data: metrics,
      timestamp: Date.now(),
    });

    return metrics;
  }

  calculateQualityScore(content, fileInfo) {
    let score = 100;
    const lines = content.split("\n");
    const ext = fileInfo.extension?.toLowerCase();

    if (lines.length > 500) score -= 10;
    else if (lines.length > 300) score -= 5;

    const longLines = lines.filter((line) => line.length > 120).length;
    score -= Math.min(longLines * 2, 15);

    const commentLines = this.countCommentLines(content, ext);
    const commentRatio = commentLines / lines.length;
    if (commentRatio < 0.05) score -= 15;
    else if (commentRatio > 0.4) score -= 5;

    const longFunctions = this.findLongFunctions(content, ext);
    score -= Math.min(longFunctions.length * 5, 20);

    const deepNesting = this.findDeepNesting(content);
    score -= Math.min(deepNesting * 10, 20);

    const todoCount = (content.match(/TODO|FIXME|HACK|XXX/gi) || []).length;
    score -= Math.min(todoCount * 5, 15);

    const debugStatements = this.countDebugStatements(content, ext);
    score -= Math.min(debugStatements * 3, 10);

    const magicNumbers = this.findMagicNumbers(content, ext);
    score -= Math.min(magicNumbers * 2, 10);

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  calculateComplexity(content, fileInfo) {
    let complexity = 0;

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

    if (complexity < 10) return "Low";
    if (complexity < 25) return "Medium";
    return "High";
  }

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

  countCommentLines(content, ext) {
    const lines = content.split("\n");
    let commentLines = 0;
    let inBlockComment = false;

    for (const line of lines) {
      const trimmed = line.trim();

      if (trimmed.includes("/*")) inBlockComment = true;
      if (inBlockComment) {
        commentLines++;
        if (trimmed.includes("*/")) inBlockComment = false;
        continue;
      }

      if (trimmed.startsWith("//") || trimmed.startsWith("#")) {
        commentLines++;
      }
    }

    return commentLines;
  }

  findLongFunctions(content, ext) {
    const longFunctions = [];
    const lines = content.split("\n");
    let inFunction = false;
    let functionStart = 0;
    let functionName = "";
    let braceCount = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

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

  findDeepNesting(content) {
    const lines = content.split("\n");
    let currentNesting = 0;
    let deepNestingCount = 0;

    for (const line of lines) {
      const openBraces = (line.match(/{/g) || []).length;
      const closeBraces = (line.match(/}/g) || []).length;

      currentNesting += openBraces - closeBraces;

      if (currentNesting > 3) {
        deepNestingCount++;
      }
    }

    return deepNestingCount;
  }

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

  findMagicNumbers(content, ext) {
    const magicNumberPattern = /\b(?!0\b|1\b|2\b|10\b|100\b|1000\b)\d{2,}\b/g;
    const matches = content.match(magicNumberPattern);
    return matches ? matches.length : 0;
  }

  findIssues(content, fileInfo) {
    const issues = [];
    const ext = fileInfo.extension?.toLowerCase();

    const longFunctions = this.findLongFunctions(content, ext);
    longFunctions.forEach((fn) => {
      issues.push({
        type: "warning",
        message: `Function '${fn.name}' is too long (${fn.length} lines)`,
        line: fn.line,
        severity: "medium",
      });
    });

    const commentRatio =
      this.countCommentLines(content, ext) / content.split("\n").length;
    if (commentRatio < 0.05) {
      issues.push({
        type: "warning",
        message: "Low comment ratio - consider adding more documentation",
        severity: "low",
      });
    }

    const debugCount = this.countDebugStatements(content, ext);
    if (debugCount > 0) {
      issues.push({
        type: "warning",
        message: `Found ${debugCount} debug statement(s) - should be removed in production`,
        severity: "medium",
      });
    }

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

  getScoreBreakdown(content, fileInfo) {
    const breakdown = {
      structure: 100,
      documentation: 100,
      complexity: 100,
      bestPractices: 100,
    };

    const lines = content.split("\n").length;
    if (lines > 500) breakdown.structure -= 30;
    else if (lines > 300) breakdown.structure -= 15;

    const longFunctions = this.findLongFunctions(content, fileInfo.extension);
    breakdown.structure -= Math.min(longFunctions.length * 10, 40);

    const commentRatio =
      this.countCommentLines(content, fileInfo.extension) / lines;
    if (commentRatio < 0.05) breakdown.documentation -= 50;
    else if (commentRatio < 0.1) breakdown.documentation -= 30;
    else if (commentRatio < 0.15) breakdown.documentation -= 15;

    const complexityLevel = this.calculateComplexity(content, fileInfo);
    if (complexityLevel === "High") breakdown.complexity -= 40;
    else if (complexityLevel === "Medium") breakdown.complexity -= 20;

    const deepNesting = this.findDeepNesting(content);
    breakdown.complexity -= Math.min(deepNesting * 5, 30);

    const debugCount = this.countDebugStatements(content, fileInfo.extension);
    breakdown.bestPractices -= Math.min(debugCount * 10, 30);

    const magicNumbers = this.findMagicNumbers(content, fileInfo.extension);
    breakdown.bestPractices -= Math.min(magicNumbers * 5, 20);

    const todoCount = (content.match(/TODO|FIXME/gi) || []).length;
    breakdown.bestPractices -= Math.min(todoCount * 5, 20);

    for (const key in breakdown) {
      breakdown[key] = Math.max(0, Math.min(100, breakdown[key]));
    }

    return breakdown;
  }

  // ==================== ENHANCED ANALYSIS METHODS ====================

  analyzeSecurityIssues(content, fileInfo) {
    const issues = [];

    // SQL Injection
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

    return {
      issues,
      score: Math.max(0, 100 - issues.length * 15),
      critical: issues.filter((i) => i.severity === "critical").length,
      high: issues.filter((i) => i.severity === "high").length,
      medium: issues.filter((i) => i.severity === "medium").length,
    };
  }

  analyzePerformance(content, fileInfo) {
    const issues = [];

    // Nested loops
    const nestedLoops = content.match(
      /for\s*\([^)]*\)[^{]*{[^}]*for\s*\([^)]*\)/g
    );
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

    // DOM queries in loops
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

    return {
      issues,
      score: Math.max(0, 100 - issues.length * 10),
      optimizationOpportunities: issues.length,
    };
  }

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
    const longParams = content.match(
      /function\s+\w+\s*\([^)]{50,}\)|=>\s*\([^)]{50,}\)/g
    );
    if (longParams) {
      smells.push({
        type: "Long Parameter List",
        message: `${longParams.length} function(s) with long parameter lists`,
        description:
          "Functions with many parameters are hard to use. Consider using an options object.",
        severity: "low",
      });
    }

    return { smells };
  }

  calculateMaintainabilityIndex(content, fileInfo) {
    const lines = content.split("\n");
    const codeLines = lines.filter(
      (l) =>
        l.trim() && !l.trim().startsWith("//") && !l.trim().startsWith("/*")
    ).length;
    const complexity = this.countComplexity(content);
    const commentRatio =
      this.countCommentLines(content, fileInfo.extension) / lines.length;

    // Maintainability Index formula (simplified)
    let index =
      171 -
      5.2 * Math.log(codeLines) -
      0.23 * complexity -
      16.2 * Math.log(codeLines * (1 - commentRatio));
    index = Math.max(0, Math.min(100, Math.round(index)));

    let rating = "Low";
    if (index >= 85) rating = "Excellent";
    else if (index >= 65) rating = "Good";
    else if (index >= 50) rating = "Moderate";

    const hours = Math.ceil(codeLines / 50);
    const days = Math.ceil(hours / 8);

    return {
      index,
      rating,
      technicalDebt: {
        hours,
        days,
        priority: index < 50 ? "High" : index < 65 ? "Medium" : "Low",
      },
    };
  }

  getDetailedMetrics(content, fileInfo) {
    const lines = content.split("\n");
    return {
      totalLines: lines.length,
      codeLines: lines.filter((l) => l.trim() && !l.trim().startsWith("//"))
        .length,
      commentLines: this.countCommentLines(content, fileInfo.extension),
      blankLines: lines.filter((l) => !l.trim()).length,
      functions: (content.match(/function\s+\w+|const\s+\w+\s*=\s*\(/g) || [])
        .length,
      classes: (content.match(/class\s+\w+/g) || []).length,
      cyclomaticComplexity: this.countComplexity(content),
      avgLineLength: Math.round(content.length / lines.length),
    };
  }

  checkBestPractices(content, fileInfo) {
    const violations = [];
    const ext = fileInfo.extension?.toLowerCase();

    // Check for console.log in production code
    if (/console\.(log|debug|info)/.test(content)) {
      violations.push({
        rule: "Remove debug statements",
        message:
          "Found console.log statements that should be removed before production",
      });
    }

    // Check for TODO/FIXME comments
    if (/TODO|FIXME/.test(content)) {
      violations.push({
        rule: "Resolve TODOs",
        message: "Found TODO/FIXME comments that need to be addressed",
      });
    }

    return { violations };
  }

  countComplexity(content) {
    let complexity = 1;
    complexity += (content.match(/\bif\s*\(/g) || []).length;
    complexity += (content.match(/\belse\b/g) || []).length;
    complexity += (content.match(/\bfor\s*\(/g) || []).length;
    complexity += (content.match(/\bwhile\s*\(/g) || []).length;
    complexity += (content.match(/\bcase\s+/g) || []).length;
    complexity += (content.match(/&&|\|\|/g) || []).length;
    return complexity;
  }

  clearCache() {
    this.cache.clear();
  }
}

const codeQualityAnalyzer = new CodeQualityAnalyzer();

// ==================== END CODE QUALITY ANALYZER ====================

// ==================== AI CODE ANALYSIS SERVICE ====================

class AICodeAnalysisService {
  constructor() {
    this.apiKey = null;
    this.apiEndpoint =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
    this.agents = {
      security: this.createSecurityAgent(),
      performance: this.createPerformanceAgent(),
      architecture: this.createArchitectureAgent(),
      bestPractices: this.createBestPracticesAgent(),
      refactoring: this.createRefactoringAgent(),
    };
  }

  async initialize() {
    // Get API key from Chrome storage
    return new Promise((resolve) => {
      chrome.storage.sync.get(["geminiApiKey"], (result) => {
        if (result.geminiApiKey) {
          this.apiKey = result.geminiApiKey;
          console.log("Gemini API key loaded from storage");
        } else {
          console.warn(
            "No Gemini API key found in storage. Please configure it in extension settings."
          );
        }
        resolve();
      });
    });
  }

  createSecurityAgent() {
    return {
      name: "Security Sentinel",
      role: "security-expert",
      systemPrompt: `Analyze for security issues: SQL injection, XSS, auth flaws, crypto issues, input validation, data exposure. List only the TOP 3 most critical findings.`,
    };
  }

  createPerformanceAgent() {
    return {
      name: "Performance Optimizer",
      role: "performance-expert",
      systemPrompt: `Analyze for performance issues: inefficient algorithms, memory leaks, N+1 queries, blocking operations. List only TOP 3 most impactful findings.

Analyze for:
- Time complexity issues (O(n²), O(n³))
- Memory leaks and excessive allocations
- Inefficient algorithms and data structures
- Blocking operations
- Redundant computations
- Cache inefficiencies
- Bundle size concerns
- Database query optimization

Provide:
1. Performance impact (High/Medium/Low)
2. Specific bottleneck description
3. Current time/space complexity
4. Optimization strategy
5. Expected improvement
6. Code refactoring suggestion

Focus on real-world impact and practical optimizations.`,
    };
  }

  createArchitectureAgent() {
    return {
      name: "Architecture Advisor",
      role: "architecture-expert",
      systemPrompt: `Analyze architecture: design patterns, SOLID principles, coupling, modularity, technical debt. List only TOP 3 architectural issues.`,
    };
  }

  createBestPracticesAgent() {
    return {
      name: "Standards Guardian",
      role: "best-practices-expert",
      systemPrompt: `Check best practices: naming conventions, error handling, documentation, modern syntax, framework patterns. List only TOP 3 violations.`,
    };
  }

  createRefactoringAgent() {
    return {
      name: "Refactoring Specialist",
      role: "refactoring-expert",
      systemPrompt: `Suggest refactorings: reduce complexity, improve naming, extract functions, eliminate duplication, modernize syntax. List only TOP 3 refactoring opportunities.`,
    };
  }

  async analyzeWithAI(code, fileInfo, basicMetrics) {
    if (!this.apiKey) {
      await this.initialize();
    }

    if (!this.apiKey) {
      console.warn(
        "AI analysis skipped: No API key configured. Please add your Gemini API key in extension settings."
      );
      return {
        enabled: false,
        message:
          "AI analysis not available - API key not configured. Please add your Gemini API key in extension settings.",
      };
    }

    console.log(
      "Starting AI analysis with",
      Object.keys(this.agents).length,
      "agents..."
    );

    try {
      const codeContext = this.prepareCodeContext(code, fileInfo, basicMetrics);

      const [
        securityAnalysis,
        performanceAnalysis,
        architectureAnalysis,
        bestPracticesAnalysis,
        refactoringAnalysis,
      ] = await Promise.allSettled([
        this.runAgent(this.agents.security, codeContext),
        this.runAgent(this.agents.performance, codeContext),
        this.runAgent(this.agents.architecture, codeContext),
        this.runAgent(this.agents.bestPractices, codeContext),
        this.runAgent(this.agents.refactoring, codeContext),
      ]);

      const aiInsights = {
        enabled: true,
        timestamp: new Date().toISOString(),
        agents: {
          security: this.extractResult(securityAnalysis),
          performance: this.extractResult(performanceAnalysis),
          architecture: this.extractResult(architectureAnalysis),
          bestPractices: this.extractResult(bestPracticesAnalysis),
          refactoring: this.extractResult(refactoringAnalysis),
        },
        summary: await this.generateSummary(
          this.extractResult(securityAnalysis),
          this.extractResult(performanceAnalysis),
          this.extractResult(architectureAnalysis),
          this.extractResult(bestPracticesAnalysis),
          this.extractResult(refactoringAnalysis)
        ),
      };

      return aiInsights;
    } catch (error) {
      console.error("AI analysis error:", error);
      return {
        enabled: false,
        error: error.message,
      };
    }
  }

  prepareCodeContext(code, fileInfo, basicMetrics) {
    const maxCodeLength = 400; // EXTREMELY reduced to avoid MAX_TOKENS
    let truncatedCode;

    if (code.length > maxCodeLength) {
      // Smart truncation: show beginning and end
      const headSize = 250;
      const tailSize = 100;
      truncatedCode =
        code.substring(0, headSize) +
        "\n...\n" +
        code.substring(code.length - tailSize);
    } else {
      truncatedCode = code;
    }

    return {
      fileName: fileInfo.name,
      language: this.detectLanguage(fileInfo.extension),
      code: truncatedCode,
      loc: basicMetrics.linesOfCode,
      complexity: basicMetrics.complexity,
      score: basicMetrics.qualityScore,
    };
  }

  async runAgent(agent, context) {
    const prompt = `${agent.systemPrompt}

${context.code}

JSON: {"findings":[{"severity":"High|Medium|Low","title":"","description":"","recommendation":""}],"overallAssessment":"","priorityActions":[]}`;

    console.log(
      `Agent ${agent.name} - Prompt length: ${prompt.length} chars, Code length: ${context.code.length} chars`
    );

    try {
      const response = await fetch(`${this.apiEndpoint}?key=${this.apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            topK: 20,
            topP: 0.8,
            maxOutputTokens: 800,
          },
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_NONE",
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_NONE",
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `API request failed: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();

      // Check if response has expected structure
      if (!data.candidates || !data.candidates[0]) {
        console.error(`Agent ${agent.name} - No candidates in response:`, data);
        throw new Error("No candidates in API response");
      }

      const candidate = data.candidates[0];

      // Check for MAX_TOKENS - this means response was cut off but we still have partial data
      if (candidate.finishReason === "MAX_TOKENS") {
        console.warn(
          `Agent ${agent.name} - Response truncated (MAX_TOKENS). Full candidate structure:`,
          JSON.stringify(candidate, null, 2)
        );
      }

      if (
        !candidate.content ||
        !candidate.content.parts ||
        !candidate.content.parts[0]
      ) {
        console.error(
          `Agent ${agent.name} - Incomplete response structure. Has content?`,
          !!candidate.content,
          "Has parts?",
          !!candidate.content?.parts,
          "Parts length:",
          candidate.content?.parts?.length
        );

        // When MAX_TOKENS, sometimes the response is EMPTY - we need to handle this gracefully
        if (candidate.finishReason === "MAX_TOKENS") {
          console.error(
            `Agent ${agent.name} - MAX_TOKENS with no content. The input prompt is too large!`
          );
          return {
            findings: [],
            overallAssessment: "Input code too large for analysis",
            priorityActions: ["Reduce code size or analyze specific sections"],
          };
        }

        throw new Error("Incomplete API response structure");
      }

      const text = candidate.content.parts[0].text;

      if (!text || text.trim().length === 0) {
        console.error(`Agent ${agent.name} - Empty response text`);
        throw new Error("Empty response from API");
      }

      // Log partial text for debugging MAX_TOKENS
      if (candidate.finishReason === "MAX_TOKENS") {
        console.log(
          `Agent ${agent.name} - Partial text (first 200 chars):`,
          text.substring(0, 200)
        );
        console.log(`Agent ${agent.name} - Text length:`, text.length);
      }

      // Try to extract JSON from markdown code blocks - try multiple patterns
      let jsonText = text.trim();

      // Remove markdown code fences if present
      if (jsonText.startsWith("```")) {
        // Find the first newline after ```json or ```
        const firstNewline = jsonText.indexOf("\n");
        if (firstNewline > -1) {
          // Remove the opening ```json or ```
          jsonText = jsonText.substring(firstNewline + 1);
        }

        // Find the closing ```
        const lastBackticks = jsonText.lastIndexOf("```");
        if (lastBackticks > -1) {
          // Remove the closing ```
          jsonText = jsonText.substring(0, lastBackticks);
        }

        jsonText = jsonText.trim();
      }

      // If still no valid JSON, try to extract just the object
      if (!jsonText.startsWith("{")) {
        const objectMatch = jsonText.match(/(\{[\s\S]*\})/);
        if (objectMatch) {
          jsonText = objectMatch[1].trim();
        }
      }

      // Parse JSON
      try {
        const parsed = JSON.parse(jsonText);
        // Validate structure
        if (!parsed.findings) parsed.findings = [];
        if (!parsed.overallAssessment)
          parsed.overallAssessment = "Analysis completed";
        if (!parsed.priorityActions) parsed.priorityActions = [];
        return parsed;
      } catch (parseError) {
        console.warn(
          `Agent ${agent.name} - JSON parse failed, attempting recovery...`
        );

        // Try to extract partial findings if JSON is truncated
        try {
          // Add closing braces to make it valid
          let fixedJson = jsonText;
          if (!fixedJson.endsWith("}")) {
            // Count opening and closing braces
            const openBraces = (fixedJson.match(/\{/g) || []).length;
            const closeBraces = (fixedJson.match(/\}/g) || []).length;
            const bracesToAdd = openBraces - closeBraces;

            // Try to close open strings
            if (fixedJson.includes('"') && !fixedJson.match(/"[^"]*$/)) {
              fixedJson += '"';
            }

            // Add missing closing brackets/braces
            fixedJson += "]".repeat(
              Math.max(
                0,
                (fixedJson.match(/\[/g) || []).length -
                  (fixedJson.match(/\]/g) || []).length
              )
            );
            fixedJson += "}".repeat(Math.max(0, bracesToAdd));
          }

          const recovered = JSON.parse(fixedJson);
          console.log(
            `Agent ${agent.name} - Successfully recovered partial data`
          );
          if (!recovered.findings) recovered.findings = [];
          if (!recovered.overallAssessment)
            recovered.overallAssessment =
              "Partial analysis (response was truncated)";
          if (!recovered.priorityActions) recovered.priorityActions = [];
          return recovered;
        } catch (recoveryError) {
          console.error(
            `Agent ${agent.name} - Recovery failed:`,
            parseError.message
          );
          throw new Error(`Failed to parse JSON: ${parseError.message}`);
        }
      }
    } catch (error) {
      console.error(`Agent ${agent.name} final error:`, error.message);
      return {
        findings: [],
        overallAssessment: `Analysis failed: ${error.message}`,
        priorityActions: [],
      };
    }
  }

  extractResult(settledPromise) {
    if (settledPromise.status === "fulfilled") {
      return settledPromise.value;
    }
    return {
      findings: [],
      overallAssessment: "Analysis failed",
      priorityActions: [],
    };
  }

  async generateSummary(
    security,
    performance,
    architecture,
    bestPractices,
    refactoring
  ) {
    const allFindings = [
      ...(security.findings || []),
      ...(performance.findings || []),
      ...(architecture.findings || []),
      ...(bestPractices.findings || []),
      ...(refactoring.findings || []),
    ];

    const criticalCount = allFindings.filter(
      (f) => f.severity === "Critical"
    ).length;
    const highCount = allFindings.filter((f) => f.severity === "High").length;
    const mediumCount = allFindings.filter(
      (f) => f.severity === "Medium"
    ).length;

    let overallRating;
    if (criticalCount > 0) overallRating = "Needs Immediate Attention";
    else if (highCount > 2) overallRating = "Requires Improvement";
    else if (highCount > 0 || mediumCount > 3)
      overallRating = "Good with Minor Issues";
    else overallRating = "Excellent";

    return {
      overallRating,
      totalFindings: allFindings.length,
      bySeverity: {
        critical: criticalCount,
        high: highCount,
        medium: mediumCount,
        low: allFindings.length - criticalCount - highCount - mediumCount,
      },
      topPriorities: [
        ...(security.priorityActions || []).slice(0, 2),
        ...(performance.priorityActions || []).slice(0, 1),
        ...(architecture.priorityActions || []).slice(0, 1),
      ].slice(0, 4),
    };
  }

  detectLanguage(extension) {
    const langMap = {
      ".js": "javascript",
      ".jsx": "javascript",
      ".ts": "typescript",
      ".tsx": "typescript",
      ".py": "python",
      ".java": "java",
      ".cpp": "cpp",
      ".c": "c",
      ".go": "go",
      ".rs": "rust",
      ".rb": "ruby",
      ".php": "php",
      ".cs": "csharp",
      ".swift": "swift",
      ".kt": "kotlin",
    };
    return langMap[extension?.toLowerCase()] || "text";
  }
}

const aiCodeAnalysisService = new AICodeAnalysisService();

// ==================== END AI CODE ANALYSIS SERVICE ====================

let settings = null;

// Load settings from storage
chrome.storage.sync.get(["extensionSettings"], (result) => {
  if (result.extensionSettings) {
    settings = result.extensionSettings;

    // Migration: Replace toggleDarkMode with viewPullRequests
    if (settings.shortcuts && settings.shortcuts.toggleDarkMode !== undefined) {
      console.log(
        "en-git: Migrating old settings - replacing toggleDarkMode with viewPullRequests"
      );
      settings.shortcuts.viewPullRequests = "Ctrl+Alt+P";
      delete settings.shortcuts.toggleDarkMode;
      // Save migrated settings
      chrome.storage.sync.set({ extensionSettings: settings }, () => {
        console.log("en-git: Migration complete, settings saved");
      });
    }

    console.log("en-git: Settings loaded:", settings);
    console.log("en-git: Shortcuts enabled:", settings.shortcuts?.enabled);
    console.log("en-git: Configured shortcuts:", settings.shortcuts);
    applySettings(settings);
  } else {
    console.log("en-git: No settings found in storage");
  }
});

// Listen for settings updates
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "applySettings") {
    settings = request.settings;
    applySettings(settings);
    sendResponse({ success: true });
    return true;
  }
  return false; // Don't keep channel open if we're not handling the message
});

// Apply custom theme and enhancements
function applySettings(settings) {
  if (!settings) return;

  // Apply custom theme
  if (settings.theme && settings.theme.enabled) {
    applyCustomTheme(settings.theme);
  } else {
    removeCustomTheme();
  }

  // Apply custom font
  if (settings.font && settings.font.enabled) {
    applyCustomFont(settings.font);
  } else {
    removeCustomFont();
  }

  // Apply enhancements
  if (settings.enhancements) {
    if (settings.enhancements.contributionStats) {
      enhanceContributionGraph();
    }
    if (settings.enhancements.repoCards) {
      enhanceRepoCards();
    }
    if (settings.enhancements.enhancedProfile) {
      enhanceProfile();
    }
  }
}

// Apply custom theme colors
function applyCustomTheme(theme) {
  let styleEl = document.getElementById("en-git-custom-theme");
  if (!styleEl) {
    styleEl = document.createElement("style");
    styleEl.id = "en-git-custom-theme";
    document.head.appendChild(styleEl);
  }

  styleEl.textContent = `
    /* CSS Variables Override */
    :root,
    [data-color-mode="dark"],
    [data-color-mode="light"] {
      --color-accent-fg: ${theme.primaryColor} !important;
      --color-accent-emphasis: ${theme.accentColor} !important;
      --color-canvas-default: ${theme.backgroundColor} !important;
      --color-canvas-subtle: ${theme.backgroundColor} !important;
      --color-fg-default: ${theme.textColor} !important;
      --color-fg-muted: ${theme.textColor}cc !important;
      --color-border-default: ${theme.primaryColor}33 !important;
      --bgColor-default: ${theme.backgroundColor} !important;
      --fgColor-default: ${theme.textColor} !important;
    }
    
    /* Main body background only */
    body {
      background-color: ${theme.backgroundColor} !important;
      color: ${theme.textColor} !important;
    }
    
    /* Main content areas */
    .application-main,
    #js-repo-pjax-container,
    #js-pjax-container,
    .repository-content,
    main[class*="Layout-main"],
    .Layout-main {
      background-color: ${theme.backgroundColor} !important;
    }
    
    /* Header */
    .Header,
    .AppHeader,
    header[role="banner"] {
      background-color: ${theme.backgroundColor} !important;
      border-bottom-color: ${theme.primaryColor}55 !important;
    }
    
    /* Primary buttons only */
    .btn-primary,
    button.btn-primary,
    a.btn-primary {
      background-color: ${theme.accentColor} !important;
      border-color: ${theme.accentColor} !important;
      color: white !important;
    }
    
    .btn-primary:hover,
    .btn-primary:focus {
      background-color: ${theme.primaryColor} !important;
      border-color: ${theme.primaryColor} !important;
    }
    
    /* Links */
    a:not(.btn):not([class*="Button"]) {
      color: ${theme.primaryColor} !important;
    }
    
    a:not(.btn):not([class*="Button"]):hover {
      color: ${theme.accentColor} !important;
    }
    
    /* Content boxes - be selective */
    .Box:not(.color-bg-default):not(.color-bg-subtle),
    .markdown-body,
    .comment-body {
      background-color: ${theme.backgroundColor}f8 !important;
      border-color: ${theme.primaryColor}22 !important;
    }
    
    /* Navigation tabs */
    .UnderlineNav-item[aria-current],
    .UnderlineNav-item.selected {
      border-bottom-color: ${theme.primaryColor} !important;
      color: ${theme.primaryColor} !important;
    }
    
    /* Code viewer */
    .blob-wrapper,
    .blob-code-inner,
    pre,
    code:not(.hljs *) {
      background-color: ${theme.backgroundColor}ee !important;
      color: ${theme.textColor} !important;
    }
    
    /* Forms */
    input[type="text"]:not([class*="color-bg-"]),
    input[type="search"],
    textarea:not([class*="color-bg-"]) {
      background-color: ${theme.backgroundColor}dd !important;
      color: ${theme.textColor} !important;
      border-color: ${theme.primaryColor}44 !important;
    }
    
    input:focus,
    textarea:focus {
      border-color: ${theme.primaryColor} !important;
      box-shadow: 0 0 0 3px ${theme.primaryColor}33 !important;
    }
    
    /* Dropdowns */
    .SelectMenu-modal,
    .dropdown-menu {
      background-color: ${theme.backgroundColor}f5 !important;
      border-color: ${theme.primaryColor}33 !important;
    }
    
    /* Don't override these - let them keep their natural state */
    .Label,
    .IssueLabel,
    .State,
    [class*="color-bg-"],
    [class*="color-fg-"],
    [data-color-mode] [class*="color-"],
    .avatar,
    img,
    svg {
      /* Preserve original colors for labels, states, and images */
    }
  `;
}

function removeCustomTheme() {
  const styleEl = document.getElementById("en-git-custom-theme");
  if (styleEl) styleEl.remove();
}

// Apply custom font
function applyCustomFont(font) {
  let styleEl = document.getElementById("en-git-custom-font");
  if (!styleEl) {
    styleEl = document.createElement("style");
    styleEl.id = "en-git-custom-font";
    document.head.appendChild(styleEl);
  }

  styleEl.textContent = `
    .blob-code,
    .blob-code-inner,
    textarea,
    pre,
    code,
    .CodeMirror {
      font-family: ${font.family} !important;
      font-size: ${font.size}px !important;
    }
  `;
}

function removeCustomFont() {
  const styleEl = document.getElementById("en-git-custom-font");
  if (styleEl) styleEl.remove();
}

// Enhance contribution graph with detailed stats
function enhanceContributionGraph() {
  const days = document.querySelectorAll(".ContributionCalendar-day");
  days.forEach((day) => {
    const count = day.getAttribute("data-count");
    const date = day.getAttribute("data-date");
    if (count && date) {
      day.addEventListener("mouseenter", () => {
        day.setAttribute("data-tooltip", `${count} contributions on ${date}`);
      });
    }
  });
}

// Enhance repository cards
function enhanceRepoCards() {
  const repoCards = document.querySelectorAll(
    '[data-hovercard-type="repository"]'
  );
  repoCards.forEach((card) => {
    if (card.querySelector(".en-git-enhanced")) return;

    const badge = document.createElement("span");
    badge.className = "en-git-enhanced";
    badge.style.cssText = `
      display: inline-block;
      padding: 2px 6px;
      background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%);
      color: white;
      border-radius: 4px;
      font-size: 10px;
      margin-left: 8px;
    `;
    badge.textContent = "✨ Enhanced";
    card.appendChild(badge);
  });
}

// Enhance profile page
function enhanceProfile() {
  const profileStats = document.querySelector(".js-profile-editable-area");
  if (profileStats && !document.querySelector(".en-git-profile-enhancement")) {
    const enhancement = document.createElement("div");
    enhancement.className = "en-git-profile-enhancement";
    enhancement.style.cssText = `
      margin-top: 16px;
      padding: 12px;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
      border-radius: 8px;
      border: 1px solid rgba(99, 102, 241, 0.3);
    `;
    enhancement.innerHTML = `
      <p style="margin: 0; font-size: 12px; color: #0ea5e9; font-weight: 600;">
        ✨ Enhanced by en-git
      </p>
    `;
    profileStats.prepend(enhancement);
  }

  // Add "Deeper Analysis" button below Profile Score badge
  addDeeperAnalysisButtonToProfile();
}

// Add "Deeper Analysis" button on GitHub profile pages
function addDeeperAnalysisButtonToProfile() {
  // Check if we're on a profile page
  const path = window.location.pathname;
  const match = path.match(/^\/([^\/]+)\/?$/);
  if (!match) return;

  const username = match[1];

  // Skip if it's not a user profile
  if (
    ["orgs", "marketplace", "trending", "explore", "settings"].includes(
      username
    )
  )
    return;

  // Find the profile score badge (injected by our extension)
  const profileScoreBadge = document.querySelector('[class*="en-git"]');
  if (!profileScoreBadge) {
    // Retry after a delay
    setTimeout(addDeeperAnalysisButtonToProfile, 2000);
    return;
  }

  // Check if button already exists
  if (document.querySelector(".en-git-profile-deeper-analysis")) return;

  // Create button
  const button = document.createElement("button");
  button.className = "en-git-profile-deeper-analysis";
  button.style.cssText = `
    display: block;
    width: 100%;
    margin-top: 12px;
    padding: 10px 16px;
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  `;

  button.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 6px;">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
    </svg>
    Deeper Analysis
  `;

  button.onmouseover = () => {
    button.style.transform = "translateY(-2px)";
  };

  button.onmouseout = () => {
    button.style.transform = "translateY(0)";
  };

  button.onclick = () => {
    if (chrome.runtime?.id) {
      chrome.runtime.sendMessage({
        action: "analyzeProfile",
        username: username,
      });
    } else {
      window.open(`https://en-git.vercel.app/stats/${username}`, "_blank");
    }
  };

  // Find where to insert (below the profile score badge)
  const profileContainer =
    profileScoreBadge.closest("div") || profileScoreBadge.parentElement;
  if (profileContainer) {
    profileContainer.appendChild(button);
    console.log("en-git: Added Deeper Analysis button to profile");
  }
}

// Helper function to parse shortcut string
function parseShortcut(shortcutString) {
  if (!shortcutString) return null;
  const parts = shortcutString.split("+").map((p) => p.trim());
  return {
    ctrl: parts.includes("Ctrl"),
    shift: parts.includes("Shift"),
    alt: parts.includes("Alt"),
    key: parts[parts.length - 1],
  };
}

// Helper function to check if pressed keys match shortcut
function matchesShortcut(event, shortcut) {
  if (!shortcut) return false;
  return (
    event.ctrlKey === shortcut.ctrl &&
    event.shiftKey === shortcut.shift &&
    event.altKey === shortcut.alt &&
    event.key.toUpperCase() === shortcut.key.toUpperCase()
  );
}

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
  if (!settings || !settings.shortcuts || !settings.shortcuts.enabled) {
    console.log("en-git: Shortcuts disabled or settings not loaded");
    return;
  }

  const shortcuts = settings.shortcuts;

  // Debug: Log key press (skip if it's just a modifier key)
  if (!["Control", "Shift", "Alt", "Meta"].includes(e.key)) {
    const pressedKeys = [];
    if (e.ctrlKey) pressedKeys.push("Ctrl");
    if (e.shiftKey) pressedKeys.push("Shift");
    if (e.altKey) pressedKeys.push("Alt");
    pressedKeys.push(e.key.toUpperCase());
    console.log("en-git: Key pressed:", pressedKeys.join("+"));
  }

  // Quick search
  const quickSearch = parseShortcut(shortcuts.quickSearch);
  if (quickSearch && matchesShortcut(e, quickSearch)) {
    console.log("en-git: Quick search triggered!");
    e.preventDefault();

    // Try multiple selectors for GitHub's search input
    const searchInput =
      document.querySelector('input[name="q"]') ||
      document.querySelector('input[type="search"]') ||
      document.querySelector('[data-target="qbsearch-input.inputButton"]') ||
      document.querySelector(".header-search-input") ||
      document.querySelector("#query-builder-test");

    if (searchInput) {
      searchInput.focus();
      searchInput.click();
      console.log("en-git: Search input focused");
    } else {
      // Fallback: trigger GitHub's native search shortcut
      console.log(
        "en-git: Search input not found, trying native GitHub search"
      );
      const searchButton = document.querySelector(
        '[data-target="qbsearch-input.inputButton"]'
      );
      if (searchButton) {
        searchButton.click();
      }
    }
    return;
  }

  // New repository
  const newRepo = parseShortcut(shortcuts.newRepo);
  if (newRepo && matchesShortcut(e, newRepo)) {
    console.log("en-git: New repository triggered!");
    e.preventDefault();
    window.location.href = "https://github.com/new";
    return;
  }

  // View issues
  const viewIssues = parseShortcut(shortcuts.viewIssues);
  if (viewIssues && matchesShortcut(e, viewIssues)) {
    console.log("en-git: View issues triggered!");
    e.preventDefault();
    if (window.location.pathname.includes("/")) {
      const parts = window.location.pathname.split("/").filter(Boolean);
      if (parts.length >= 2) {
        window.location.href = `https://github.com/${parts[0]}/${parts[1]}/issues`;
      }
    }
    return;
  }

  // View pull requests
  const viewPullRequests = parseShortcut(shortcuts.viewPullRequests);
  console.log(
    "en-git: viewPullRequests shortcut:",
    shortcuts.viewPullRequests,
    "parsed:",
    viewPullRequests
  );

  if (viewPullRequests && matchesShortcut(e, viewPullRequests)) {
    console.log("en-git: View pull requests triggered!");
    e.preventDefault();
    if (window.location.pathname.includes("/")) {
      const parts = window.location.pathname.split("/").filter(Boolean);
      if (parts.length >= 2) {
        window.location.href = `https://github.com/${parts[0]}/${parts[1]}/pulls`;
        console.log("en-git: Navigating to pull requests");
      } else {
        console.log("en-git: Not on a repository page");
      }
    }
    return;
  }
});

// Function to extract username from GitHub profile page
function getUsernameFromPage() {
  // Check if we're on a user profile page
  const profileLink = document.querySelector(
    'meta[property="profile:username"]'
  );
  if (profileLink) {
    return profileLink.getAttribute("content");
  }

  // Fallback: parse from URL
  const path = window.location.pathname;
  const match = path.match(/^\/([^\/]+)\/?$/);
  return match ? match[1] : null;
}

// Function to extract repo info
function getRepoInfo() {
  const path = window.location.pathname;
  const match = path.match(/^\/([^\/]+)\/([^\/]+)/);
  if (match) {
    return { owner: match[1], repo: match[2] };
  }
  return null;
}

// Profile Score Calculation (simplified for content script)
function calculateProfileScore(stats) {
  if (!stats || !stats.user) return null;

  const { user, publicRepos, totalStars, topLanguages, followers, following } =
    stats;
  let score = 0;

  // Profile Completeness (20 points)
  if (user.name) score += 5;
  if (user.bio) score += 5;
  if (user.location) score += 3;
  if (user.company) score += 3;
  if (user.blog) score += 2;
  if (user.twitter_username) score += 2;

  // Repository Quality (30 points)
  score += Math.min(10, Math.floor((publicRepos / 10) * 10));
  if (totalStars >= 100) score += 20;
  else if (totalStars >= 50) score += 15;
  else if (totalStars >= 10) score += 10;
  else score += Math.floor((totalStars / 100) * 20);

  // Skills & Diversity (20 points)
  const langCount = topLanguages?.length || 0;
  score += Math.min(20, Math.floor((langCount / 5) * 20));

  // Community Engagement (15 points)
  if (followers >= 100) score += 8;
  else if (followers >= 50) score += 6;
  else if (followers >= 10) score += 4;
  else score += Math.floor((followers / 100) * 8);

  if (following >= 20) score += 4;
  else score += Math.floor((following / 20) * 4);

  const gists = user.public_gists || 0;
  score += Math.min(3, Math.floor((gists / 5) * 3));

  // Activity & Consistency (15 points)
  const accountAge = user.created_at
    ? Math.floor(
        (Date.now() - new Date(user.created_at)) / (1000 * 60 * 60 * 24 * 365)
      )
    : 0;
  score += Math.min(5, Math.floor((accountAge / 2) * 5));

  if (publicRepos > 0 && accountAge > 0) {
    const reposPerYear = publicRepos / Math.max(accountAge, 1);
    score += Math.min(10, Math.floor((reposPerYear / 5) * 10));
  }

  // Calculate rating
  let rating = "Beginner";
  let ratingIcon = "🌱";
  let ratingColor = "#f59e0b";

  if (score >= 90) {
    rating = "Elite";
    ratingIcon = "👑";
    ratingColor = "#a855f7";
  } else if (score >= 75) {
    rating = "Expert";
    ratingIcon = "🏆";
    ratingColor = "#3b82f6";
  } else if (score >= 60) {
    rating = "Advanced";
    ratingIcon = "⭐";
    ratingColor = "#10b981";
  } else if (score >= 40) {
    rating = "Intermediate";
    ratingIcon = "📈";
    ratingColor = "#eab308";
  }

  return {
    score: Math.round(score),
    rating,
    ratingIcon,
    ratingColor,
  };
}

// Fetch profile stats and calculate score
async function fetchProfileScore(username) {
  try {
    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${username}`),
      fetch(
        `https://api.github.com/users/${username}/repos?sort=updated&per_page=100`
      ),
    ]);

    if (!userRes.ok) return null;

    const userData = await userRes.json();
    const reposData = await reposRes.json();

    const totalStars = reposData.reduce(
      (sum, repo) => sum + repo.stargazers_count,
      0
    );
    const languages = {};
    reposData.forEach((repo) => {
      if (repo.language) {
        languages[repo.language] = (languages[repo.language] || 0) + 1;
      }
    });
    const topLanguages = Object.keys(languages).slice(0, 5);

    return calculateProfileScore({
      user: userData,
      publicRepos: userData.public_repos,
      totalStars,
      topLanguages,
      followers: userData.followers,
      following: userData.following,
    });
  } catch (error) {
    console.error("Failed to fetch profile score:", error);
    return null;
  }
}

// Add inline profile score badge
async function addProfileScoreBadge() {
  const username = getUsernameFromPage();
  if (!username) {
    console.log("en-git: No username detected on this page");
    return;
  }

  // Check if badge already exists
  if (document.querySelector(".en-git-profile-score-badge")) {
    console.log("en-git: Profile score badge already exists");
    return;
  }

  console.log(`en-git: Adding profile score badge for ${username}`);

  // Find the profile header - try multiple selectors
  const profileHeader =
    document.querySelector(".vcard-names-container") ||
    document.querySelector("h1.vcard-names") ||
    document.querySelector('[itemprop="name"]')?.parentElement;

  if (!profileHeader) return;

  // Create loading badge first
  const badgeContainer = document.createElement("div");
  badgeContainer.className = "en-git-profile-score-badge";
  badgeContainer.style.cssText = `
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-top: 12px;
    padding: 10px 16px;
    background: linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
    border: 2px solid rgba(168, 85, 247, 0.3);
    border-radius: 12px;
    animation: pulse 2s ease-in-out infinite;
  `;

  badgeContainer.innerHTML = `
    <div style="display: flex; align-items: center; gap: 8px;">
      <div style="width: 16px; height: 16px; border: 2px solid #a855f7; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
      <span style="font-size: 13px; font-weight: 600; color: #a855f7;">Loading Profile Score...</span>
    </div>
  `;

  // Add animations
  const style = document.createElement("style");
  style.textContent = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.8; }
    }
    .en-git-profile-score-badge:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(168, 85, 247, 0.3);
      transition: all 0.2s ease;
    }
  `;
  document.head.appendChild(style);

  profileHeader.appendChild(badgeContainer);

  // Fetch the actual score
  const profileScore = await fetchProfileScore(username);

  if (profileScore) {
    // Update badge with actual score
    badgeContainer.style.cssText = `
      display: inline-flex;
      align-items: center;
      gap: 12px;
      margin-top: 12px;
      padding: 12px 20px;
      background: linear-gradient(135deg, ${profileScore.ratingColor}15 0%, ${profileScore.ratingColor}25 100%);
      border: 2px solid ${profileScore.ratingColor}60;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
    `;

    badgeContainer.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${profileScore.ratingColor}" stroke-width="2">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          <span style="font-size: 14px; font-weight: 600; color: ${profileScore.ratingColor};">Profile Score</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px; padding-left: 12px; border-left: 2px solid ${profileScore.ratingColor}40;">
          <span style="font-size: 28px; line-height: 1;">${profileScore.ratingIcon}</span>
          <div style="display: flex; flex-direction: column; gap: 2px;">
            <span style="font-size: 24px; font-weight: 700; color: ${profileScore.ratingColor}; line-height: 1;">${profileScore.score}</span>
            <span style="font-size: 10px; color: ${profileScore.ratingColor}; opacity: 0.8; line-height: 1;">/ 100</span>
          </div>
        </div>
        <div style="padding: 4px 10px; background: ${profileScore.ratingColor}; color: white; border-radius: 6px; font-size: 12px; font-weight: 600;">
          ${profileScore.rating}
        </div>
      </div>
    `;

    // Add click handler to open full analysis
    badgeContainer.onclick = () => {
      if (chrome.runtime?.id) {
        chrome.runtime.sendMessage(
          {
            action: "analyzeProfile",
            username: username,
          },
          (response) => {
            if (chrome.runtime.lastError) {
              console.log(
                "Extension context invalidated, please refresh the page"
              );
            }
          }
        );
      } else {
        window.open(`https://en-git.vercel.app/stats/${username}`, "_blank");
      }
    };

    // Add tooltip
    badgeContainer.title = `Click to view detailed analysis on en-git`;
  } else {
    // Show error state
    badgeContainer.style.cssText = `
      display: inline-flex;
      align-items: center;
      gap: 8px;
      margin-top: 12px;
      padding: 10px 16px;
      background: rgba(239, 68, 68, 0.1);
      border: 2px solid rgba(239, 68, 68, 0.3);
      border-radius: 12px;
    `;
    badgeContainer.innerHTML = `
      <span style="font-size: 13px; font-weight: 600; color: #ef4444;">Failed to load score</span>
    `;
  }
}

// Add "Analyze with en-git" button to GitHub profile pages
function addAnalyzeButton() {
  const username = getUsernameFromPage();
  if (!username) return;

  // Check if button already exists
  if (document.querySelector(".en-git-analyze-btn")) return;

  // Find the profile header
  const profileHeader =
    document.querySelector(".vcard-names-container") ||
    document.querySelector("h1.vcard-names");

  if (!profileHeader) return;

  // Create button container
  const buttonContainer = document.createElement("div");
  buttonContainer.className = "en-git-analyze-btn";
  buttonContainer.style.cssText = "margin-top: 12px;";

  // Create button
  const button = document.createElement("button");
  button.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 6px;">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
    </svg>
    Analyze with en-git
  `;
  button.style.cssText = `
    padding: 8px 16px;
    background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%);
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    display: inline-flex;
    align-items: center;
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
  `;

  // Hover effects
  button.onmouseover = () => {
    button.style.transform = "translateY(-2px)";
    button.style.boxShadow = "0 4px 12px rgba(99, 102, 241, 0.4)";
  };
  button.onmouseout = () => {
    button.style.transform = "translateY(0)";
    button.style.boxShadow = "0 2px 8px rgba(99, 102, 241, 0.3)";
  };

  // Click handler
  button.onclick = () => {
    // Check if extension context is valid before sending message
    if (chrome.runtime?.id) {
      chrome.runtime.sendMessage(
        {
          action: "analyzeProfile",
          username: username,
        },
        (response) => {
          // Handle response or ignore errors if extension was reloaded
          if (chrome.runtime.lastError) {
            console.log(
              "Extension context invalidated, please refresh the page"
            );
          }
        }
      );
    } else {
      alert("Please reload the page - extension was updated");
    }
  };

  buttonContainer.appendChild(button);
  profileHeader.appendChild(buttonContainer);
}

// Add "Deep Dive" button to repository pages
function addRepoDiveButton() {
  const repoInfo = getRepoInfo();
  if (!repoInfo) return;

  // Don't add buttons on non-repository pages (like OAuth, settings, etc.)
  const path = window.location.pathname;
  const hostname = window.location.hostname;

  // Skip if not on github.com or if on special pages
  if (hostname !== "github.com") return;
  if (
    path.includes("/login") ||
    path.includes("/oauth") ||
    path.includes("/settings") ||
    path.includes("/sessions") ||
    path.includes("/authorize") ||
    path.includes("/apps") ||
    path.includes("/marketplace")
  ) {
    console.log("en-git: Skipping button injection on special page:", path);
    return;
  }

  // Check if button already exists
  if (document.querySelector(".en-git-repo-btn")) return;

  // Find repository header actions
  const repoActions =
    document.querySelector(".pagehead-actions") ||
    document.querySelector('[data-view-component="true"] ul');

  if (!repoActions) return;

  // Create button container
  const buttonContainer = document.createElement("div");
  buttonContainer.style.cssText =
    "display: inline-flex; gap: 8px; margin-left: 8px;";

  // Create Deep Dive button
  const diveButton = document.createElement("button");
  diveButton.className = "en-git-repo-btn";
  diveButton.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 4px;">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="16" x2="12" y2="12"></line>
      <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
    Deep Dive
  `;
  diveButton.style.cssText = `
    padding: 6px 12px;
    background: #0ea5e9;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 500;
    display: inline-flex;
    align-items: center;
  `;

  diveButton.onclick = () => {
    // Check if extension context is valid before sending message
    if (chrome.runtime?.id) {
      chrome.runtime.sendMessage(
        {
          action: "analyzeRepo",
          owner: repoInfo.owner,
          repo: repoInfo.repo,
        },
        (response) => {
          // Handle response or ignore errors if extension was reloaded
          if (chrome.runtime.lastError) {
            console.log(
              "Extension context invalidated, please refresh the page"
            );
          }
        }
      );
    } else {
      alert("Please reload the page - extension was updated");
    }
  };

  // Create Bookmark button
  const bookmarkButton = document.createElement("button");
  bookmarkButton.className = "en-git-bookmark-btn";
  bookmarkButton.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle;">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
    </svg>
  `;
  bookmarkButton.style.cssText = `
    padding: 6px 10px;
    background: #06b6d4;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 12px;
    display: inline-flex;
    align-items: center;
  `;

  // Check if already bookmarked
  try {
    if (!isExtensionContextValid()) {
      console.log("en-git: Extension context invalid, skipping bookmark check");
      return;
    }

    chrome.storage.sync.get(["bookmarkedRepos"], (result) => {
      if (chrome.runtime.lastError) {
        console.log("en-git: Extension context invalidated, ignoring...");
        return;
      }

      const bookmarks = result.bookmarkedRepos || [];
      const isBookmarked = bookmarks.some(
        (b) => b.owner === repoInfo.owner && b.repo === repoInfo.repo
      );

      if (isBookmarked) {
        bookmarkButton.style.background = "#22c55e";
        bookmarkButton.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" style="vertical-align: middle;">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
          </svg>
        `;
      }
    });
  } catch (error) {
    console.log("en-git: Error checking bookmarks:", error.message);
  }

  bookmarkButton.onclick = () => {
    if (!isExtensionContextValid()) {
      alert("Extension was reloaded. Please refresh the page.");
      return;
    }

    chrome.storage.sync.get(["bookmarkedRepos"], (result) => {
      if (chrome.runtime.lastError) {
        console.log("en-git: Extension context invalidated");
        return;
      }

      let bookmarks = result.bookmarkedRepos || [];
      const index = bookmarks.findIndex(
        (b) => b.owner === repoInfo.owner && b.repo === repoInfo.repo
      );

      if (index > -1) {
        // Remove bookmark
        bookmarks.splice(index, 1);
        bookmarkButton.style.background = "#06b6d4";
        bookmarkButton.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle;">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
          </svg>
        `;
      } else {
        // Add bookmark
        const repoName =
          document.querySelector("strong[itemprop='name'] a")?.textContent ||
          repoInfo.repo;
        bookmarks.push({
          owner: repoInfo.owner,
          repo: repoInfo.repo,
          name: repoName,
          url: window.location.href,
        });
        bookmarkButton.style.background = "#22c55e";
        bookmarkButton.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" style="vertical-align: middle;">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
          </svg>
        `;
      }

      chrome.storage.sync.set({ bookmarkedRepos: bookmarks });
    });
  };

  buttonContainer.appendChild(diveButton);
  buttonContainer.appendChild(bookmarkButton);
  repoActions.prepend(buttonContainer);
}

// Run when page loads
function init() {
  const path = window.location.pathname;
  const hostname = window.location.hostname;

  // Skip initialization on non-GitHub pages or special pages
  if (hostname !== "github.com") return;
  if (
    path.includes("/login") ||
    path.includes("/oauth") ||
    path.includes("/settings") ||
    path.includes("/sessions") ||
    path.includes("/authorize") ||
    path.includes("/apps") ||
    path.includes("/marketplace")
  ) {
    console.log("en-git: Skipping initialization on special page:", path);
    return;
  }

  // Profile page
  if (path.match(/^\/[^\/]+\/?$/)) {
    setTimeout(() => {
      addProfileScoreBadge(); // Add profile score badge
      addAnalyzeButton();
    }, 1000);
  }

  // Repository page
  if (path.match(/^\/[^\/]+\/[^\/]+/)) {
    setTimeout(addRepoDiveButton, 1000);
  }
}

// Initialize
init();

// Re-run on navigation (GitHub uses PJAX)
let lastUrl = location.href;

// Method 1: MutationObserver (detects DOM changes)
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    console.log("en-git: URL changed (MutationObserver), re-initializing...");
    init(); // Old features
    setTimeout(() => initCodeQuality(), 500); // Code quality badges
    setTimeout(() => initCodeQuality(), 1500); // Retry
  }
}).observe(document, { subtree: true, childList: true });

// Method 2: Listen for popstate events (browser back/forward)
window.addEventListener("popstate", () => {
  console.log("en-git: Navigation detected (popstate), re-initializing...");
  setTimeout(() => {
    init();
    initCodeQuality();
  }, 500);
});

// Method 3: Listen for pushstate/replacestate (PJAX navigation)
const originalPushState = history.pushState;
const originalReplaceState = history.replaceState;

history.pushState = function (...args) {
  originalPushState.apply(this, args);
  console.log("en-git: Navigation detected (pushState), re-initializing...");
  setTimeout(() => {
    init();
    initCodeQuality();
  }, 500);
  setTimeout(() => initCodeQuality(), 1500); // Retry
};

history.replaceState = function (...args) {
  originalReplaceState.apply(this, args);
  console.log("en-git: Navigation detected (replaceState), re-initializing...");
  setTimeout(() => {
    init();
    initCodeQuality();
  }, 500);
  setTimeout(() => initCodeQuality(), 1500); // Retry
};

// ==================== CODE QUALITY INDICATORS ====================

/**
 * Inject code quality badges on repository file listings
 * Note: CSS is loaded via manifest.json content_scripts
 */
async function injectCodeQualityBadges() {
  // Check if we're on a repository page with file listings
  const isRepoPage = window.location.pathname.match(/^\/[^\/]+\/[^\/]+/);
  if (!isRepoPage) return;

  // Check if feature is enabled in settings
  if (settings && settings.codeQuality && !settings.codeQuality.enabled) return;

  console.log("en-git: Injecting code quality badges...");

  // Strategy: Find file links and work backwards to their containers
  const fileLinks = document.querySelectorAll('a[href*="/blob/"]');
  console.log("en-git: Found file links:", fileLinks.length);

  if (fileLinks.length === 0) {
    console.log("en-git: No file links found. Waiting for page to load...");
    return;
  }

  // Get unique parent rows for each file link
  const fileRows = new Set();
  fileLinks.forEach((link) => {
    // Try to find the row container (could be parent, grandparent, etc.)
    let current = link;
    for (let i = 0; i < 5; i++) {
      current = current.parentElement;
      if (!current) break;

      // Check if this looks like a row container
      const className = current.className || "";
      const tagName = current.tagName.toLowerCase();

      if (
        tagName === "tr" ||
        className.includes("Box-row") ||
        className.includes("react-directory") ||
        className.includes("file-row") ||
        current.hasAttribute("role")
      ) {
        fileRows.add(current);
        break;
      }
    }
  });

  const fileRowsArray = Array.from(fileRows);
  console.log(`en-git: Found ${fileRowsArray.length} unique file rows`);

  if (fileRowsArray.length === 0) {
    console.log("en-git: Could not find file row containers");
    return;
  }

  await processFileRows(fileRowsArray);
}

/**
 * Process file rows and add badges
 */
async function processFileRows(fileRows) {
  const repoInfo = getRepoInfo();
  if (!repoInfo) return;

  // Process files in batches to avoid overwhelming the API
  const batchSize = 5;
  for (let i = 0; i < Math.min(fileRows.length, 20); i += batchSize) {
    const batch = Array.from(fileRows).slice(i, i + batchSize);
    await Promise.all(batch.map((row) => processFileRow(row, repoInfo)));

    // Small delay between batches
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
}

/**
 * Process a single file row
 */
async function processFileRow(fileRow, repoInfo) {
  // Check if already processed
  if (fileRow.querySelector(".en-git-quality-badges")) {
    console.log("en-git: Row already processed, skipping");
    return;
  }

  // Extract file information
  const fileInfo = extractFileInfo(fileRow);
  if (!fileInfo) {
    console.log("en-git: Could not extract file info from row");
    return;
  }

  console.log("en-git: Processing file:", fileInfo.name);

  if (!isCodeFile(fileInfo.name)) {
    console.log("en-git: Not a code file, skipping:", fileInfo.name);
    return;
  }

  // Add "Analyze" button first
  console.log("en-git: Adding analyze button for:", fileInfo.name);
  addAnalyzeButton(fileRow, fileInfo, repoInfo);
}

/**
 * Extract file information from row
 */
function extractFileInfo(fileRow) {
  try {
    // Try multiple selectors for file links
    let fileLink = fileRow.querySelector('a[href*="/blob/"]');

    if (!fileLink) {
      fileLink = fileRow.querySelector('a[href*="/tree/"]');
    }

    if (!fileLink) {
      fileLink = fileRow.querySelector(".Link--primary");
    }

    if (!fileLink) {
      fileLink = fileRow.querySelector("a.Link");
    }

    if (!fileLink) {
      fileLink = fileRow.querySelector("a[title]");
    }

    if (!fileLink) {
      console.log("en-git: No file link found in row");
      return null;
    }

    const fileName = fileLink.textContent.trim();
    const filePath = fileLink.getAttribute("href");

    // Skip if it's a directory
    if (filePath && filePath.includes("/tree/")) {
      console.log("en-git: Skipping directory:", fileName);
      return null;
    }

    const extension = fileName.includes(".") ? fileName.split(".").pop() : "";

    console.log("en-git: Extracted file info:", {
      fileName,
      filePath,
      extension,
    });

    return {
      name: fileName,
      path: filePath,
      extension: extension,
    };
  } catch (error) {
    console.error("en-git: Error extracting file info:", error);
    return null;
  }
}

/**
 * Check if file is a code file that should be analyzed
 */
function isCodeFile(fileName) {
  const codeExtensions = [
    "js",
    "jsx",
    "ts",
    "tsx",
    "py",
    "java",
    "cpp",
    "c",
    "h",
    "hpp",
    "cs",
    "go",
    "rs",
    "rb",
    "php",
    "swift",
    "kt",
    "scala",
    "r",
    "m",
    "mm",
    "vue",
    "svelte",
    "dart",
    "lua",
    "pl",
    "sh",
    "bash",
  ];

  const ext = fileName.split(".").pop().toLowerCase();
  return codeExtensions.includes(ext);
}

/**
 * Add "Analyze" button to file row
 */
function addAnalyzeButton(fileRow, fileInfo, repoInfo) {
  const button = document.createElement("button");
  button.className = "en-git-analyze-button";
  button.innerHTML = `
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M9 11l3 3L22 4"></path>
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
    </svg>
    Analyze Quality
  `;

  button.onclick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await analyzeAndShowBadges(fileRow, fileInfo, repoInfo, button);
  };

  // Try multiple strategies to find where to insert the button
  let insertTarget = null;

  // Strategy 1: Find the file name cell
  insertTarget = fileRow.querySelector('[role="gridcell"]');

  // Strategy 2: Find any td element
  if (!insertTarget) {
    insertTarget = fileRow.querySelector("td");
  }

  // Strategy 3: Find the first div with the file name
  if (!insertTarget) {
    insertTarget = fileRow.querySelector('div[class*="react-directory"]');
  }

  // Strategy 4: Just append to the row itself
  if (!insertTarget) {
    insertTarget = fileRow;
  }

  if (insertTarget) {
    console.log("en-git: Adding button to:", insertTarget.className);
    insertTarget.appendChild(button);
  } else {
    console.log("en-git: Could not find place to insert button");
  }
}

/**
 * Analyze file and show quality badges
 */
async function analyzeAndShowBadges(fileRow, fileInfo, repoInfo, button) {
  // Disable button and show loading
  button.disabled = true;
  button.innerHTML = `
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="en-git-spinner">
      <circle cx="12" cy="12" r="10"></circle>
    </svg>
    Analyzing...
  `;

  try {
    // Fetch file content
    const content = await fetchFileContent(
      repoInfo.owner,
      repoInfo.repo,
      fileInfo.path
    );

    if (!content) {
      throw new Error("Could not fetch file content");
    }

    // Analyze code quality
    const metrics = await codeQualityAnalyzer.analyzeFile(content, fileInfo);

    // Set initial AI analysis status
    metrics.aiAnalysis = { status: "analyzing" };

    console.log("en-git: Starting AI analysis for", fileInfo.name);

    // Trigger AI analysis in background (don't wait for it)
    const aiAnalysisPromise = aiCodeAnalysisService
      .analyzeWithAI(content, fileInfo, metrics)
      .then((aiAnalysis) => {
        metrics.aiAnalysis = aiAnalysis;
        console.log("AI analysis completed:", aiAnalysis);
        return aiAnalysis;
      })
      .catch((error) => {
        console.error("AI analysis failed:", error);
        metrics.aiAnalysis = {
          enabled: false,
          error: error.message,
        };
        return metrics.aiAnalysis;
      });

    // Remove analyze button
    button.remove();

    // Create and inject badges
    const badgeContainer = createBadgeContainer(metrics, fileInfo, content);

    // Add click handler to show detail modal
    badgeContainer.querySelector(".en-git-quality-badge").onclick = async (
      e
    ) => {
      e.preventDefault();
      e.stopPropagation();

      // Wait for AI analysis if it's still running
      if (metrics.aiAnalysis?.status === "analyzing") {
        console.log("Waiting for AI analysis to complete...");
        await aiAnalysisPromise;
        console.log("AI analysis complete. Final state:", metrics.aiAnalysis);
      } else {
        console.log(
          "AI analysis state when opening modal:",
          metrics.aiAnalysis
        );
      }

      showQualityDetailModal(fileInfo, metrics);
    };

    // Find a good place to insert badges
    const fileNameCell =
      fileRow.querySelector('[role="gridcell"]') || fileRow.querySelector("td");
    if (fileNameCell) {
      fileNameCell.appendChild(badgeContainer);
    }
  } catch (error) {
    console.error("Error analyzing file:", error);
    button.disabled = false;
    button.innerHTML = `
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      Retry
    `;
  }
}

/**
 * Fetch file content from GitHub
 */
async function fetchFileContent(owner, repo, filePath) {
  try {
    // Extract the actual file path from the href
    const pathMatch = filePath.match(/\/blob\/[^\/]+\/(.+)/);
    if (!pathMatch) return null;

    const actualPath = pathMatch[1];
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${actualPath}`;

    const response = await fetch(apiUrl);
    if (!response.ok) return null;

    const data = await response.json();

    // Decode base64 content
    const content = atob(data.content);
    return content;
  } catch (error) {
    console.error("Error fetching file content:", error);
    return null;
  }
}

/**
 * Create badge container with all badges
 */
function createBadgeContainer(metrics, fileInfo, content) {
  const container = document.createElement("div");
  container.className = "en-git-quality-badges";

  // Quality Score Badge
  const scoreBadge = createScoreBadge(metrics.qualityScore);
  container.appendChild(scoreBadge);

  // Complexity Badge
  const complexityBadge = createComplexityBadge(metrics.complexity);
  container.appendChild(complexityBadge);

  // Size Badge
  const sizeBadge = createSizeBadge(content.length);
  container.appendChild(sizeBadge);

  return container;
}

/**
 * Create quality score badge
 */
function createScoreBadge(score) {
  const badge = document.createElement("span");
  badge.className = "en-git-quality-badge";
  badge.textContent = score;
  badge.title = `Quality Score: ${score}/100`;

  // Color based on score
  if (score >= 80) {
    badge.classList.add("en-git-badge-excellent");
  } else if (score >= 60) {
    badge.classList.add("en-git-badge-good");
  } else if (score >= 40) {
    badge.classList.add("en-git-badge-fair");
  } else {
    badge.classList.add("en-git-badge-poor");
  }

  return badge;
}

/**
 * Create complexity badge
 */
function createComplexityBadge(complexity) {
  const badge = document.createElement("span");
  badge.className = "en-git-quality-badge";
  badge.textContent = complexity;
  badge.title = `Complexity: ${complexity}`;

  if (complexity === "Low") {
    badge.classList.add("en-git-badge-low");
  } else if (complexity === "Medium") {
    badge.classList.add("en-git-badge-medium");
  } else {
    badge.classList.add("en-git-badge-high");
  }

  return badge;
}

/**
 * Create size badge
 */
function createSizeBadge(bytes) {
  const badge = document.createElement("span");
  badge.className = "en-git-quality-badge";

  const kb = bytes / 1024;
  badge.textContent = kb < 1 ? `${bytes}B` : `${kb.toFixed(1)}KB`;
  badge.title = `File Size: ${badge.textContent}`;

  if (kb < 5) {
    badge.classList.add("en-git-badge-small");
  } else {
    badge.classList.add("en-git-badge-large");
  }

  return badge;
}

/**
 * Show detailed quality modal
 */
function showQualityDetailModal(fileInfo, metrics) {
  // Create modal overlay
  const overlay = document.createElement("div");
  overlay.className = "en-git-quality-modal-overlay";

  // Create modal (make it larger for more content)
  const modal = document.createElement("div");
  modal.className = "en-git-quality-modal";
  modal.style.maxWidth = "900px";
  modal.style.maxHeight = "90vh";
  modal.style.overflow = "auto";

  // Modal header
  const header = document.createElement("div");
  header.className = "en-git-modal-header";
  header.innerHTML = `
    <h2 class="en-git-modal-title">${fileInfo.name}</h2>
    <button class="en-git-modal-close">×</button>
  `;

  // Close button handler
  header.querySelector(".en-git-modal-close").onclick = () => {
    overlay.remove();
  };

  // Click outside to close
  overlay.onclick = (e) => {
    if (e.target === overlay) {
      overlay.remove();
    }
  };

  // Modal content
  const content = document.createElement("div");

  // Score section with metrics overview
  const scoreSection = document.createElement("div");
  scoreSection.className = "en-git-modal-score";
  const scoreColor = getScoreColor(metrics.qualityScore);
  scoreSection.innerHTML = `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; margin-bottom: 20px;">
      <div style="text-align: center; padding: 15px; background: linear-gradient(135deg, ${scoreColor}22 0%, ${scoreColor}11 100%); border-radius: 8px; border: 2px solid ${scoreColor};">
        <div class="en-git-modal-score-value" style="color: ${scoreColor}; font-size: 42px; font-weight: bold;">
          ${metrics.qualityScore}
        </div>
        <div class="en-git-modal-score-label" style="font-size: 12px; text-transform: uppercase; opacity: 0.7;">Quality Score</div>
      </div>
      ${
        metrics.security
          ? `
      <div style="text-align: center; padding: 15px; background: ${
        metrics.security.critical > 0 ? "#ef444422" : "#10b98122"
      }; border-radius: 8px; border: 2px solid ${
              metrics.security.critical > 0 ? "#ef4444" : "#10b981"
            };">
        <div style="font-size: 42px; font-weight: bold; color: ${
          metrics.security.critical > 0 ? "#ef4444" : "#10b981"
        };">
          ${metrics.security.score}
        </div>
        <div style="font-size: 12px; text-transform: uppercase; opacity: 0.7;">Security</div>
        <div style="font-size: 10px; margin-top: 4px;">
          ${
            metrics.security.critical +
            metrics.security.high +
            metrics.security.medium
          } issues
        </div>
      </div>`
          : ""
      }
      ${
        metrics.maintainability
          ? `
      <div style="text-align: center; padding: 15px; background: ${getScoreColor(
        metrics.maintainability.index
      )}22; border-radius: 8px; border: 2px solid ${getScoreColor(
              metrics.maintainability.index
            )};">
        <div style="font-size: 42px; font-weight: bold; color: ${getScoreColor(
          metrics.maintainability.index
        )};">
          ${metrics.maintainability.index}
        </div>
        <div style="font-size: 12px; text-transform: uppercase; opacity: 0.7;">Maintainability</div>
        <div style="font-size: 10px; margin-top: 4px;">
          ${metrics.maintainability.rating}
        </div>
      </div>`
          : ""
      }
      <div style="text-align: center; padding: 15px; background: #8b5cf622; border-radius: 8px; border: 2px solid #8b5cf6;">
        <div style="font-size: 42px; font-weight: bold; color: #8b5cf6;">
          ${metrics.complexity}
        </div>
        <div style="font-size: 12px; text-transform: uppercase; opacity: 0.7;">Complexity</div>
        <div style="font-size: 10px; margin-top: 4px;">
          ${metrics.linesOfCode} LOC
        </div>
      </div>
    </div>
  `;

  // Create tabs
  const tabsContainer = document.createElement("div");
  tabsContainer.style.cssText =
    "display: flex; gap: 8px; margin-bottom: 16px; border-bottom: 2px solid #e5e7eb; overflow-x: auto;";

  const tabs = [
    { id: "overview", label: "Overview", icon: "" },
    { id: "ai", label: "AI Insights", icon: "" },
    { id: "security", label: "Security", icon: "" },
    { id: "performance", label: "Performance", icon: "" },
    { id: "quality", label: "Quality", icon: "" },
    { id: "metrics", label: "Metrics", icon: "" },
  ];

  let activeTab = "overview";

  tabs.forEach((tab) => {
    const tabBtn = document.createElement("button");
    tabBtn.textContent = tab.label;
    tabBtn.style.cssText = `
      padding: 10px 16px;
      border: none;
      background: transparent;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      border-bottom: 2px solid transparent;
      transition: all 0.2s;
      white-space: nowrap;
    `;
    if (tab.id === activeTab) {
      tabBtn.style.borderBottom = "2px solid #667eea";
      tabBtn.style.color = "#667eea";
    }
    tabBtn.onclick = () => {
      document.querySelectorAll(".en-git-tab-btn").forEach((b) => {
        b.style.borderBottom = "2px solid transparent";
        b.style.color = "inherit";
      });
      tabBtn.style.borderBottom = "2px solid #667eea";
      tabBtn.style.color = "#667eea";

      document
        .querySelectorAll(".en-git-tab-content")
        .forEach((c) => (c.style.display = "none"));
      document.getElementById(`en-git-tab-${tab.id}`).style.display = "block";
    };
    tabBtn.className = "en-git-tab-btn";
    tabsContainer.appendChild(tabBtn);
  });

  // Tab contents container
  const tabContents = document.createElement("div");

  // Debug: Log metrics to see what's available
  console.log("en-git: Metrics object:", metrics);
  console.log("en-git: Has security?", !!metrics.security);
  console.log("en-git: Has performance?", !!metrics.performance);
  console.log("en-git: Has codeSmells?", !!metrics.codeSmells);
  console.log("en-git: Has bestPractices?", !!metrics.bestPractices);
  console.log("en-git: Has detailedMetrics?", !!metrics.detailedMetrics);
  console.log("en-git: Has maintainability?", !!metrics.maintainability);

  // Overview Tab
  const overviewTab = document.createElement("div");
  overviewTab.id = "en-git-tab-overview";
  overviewTab.className = "en-git-tab-content";

  const breakdownSection = document.createElement("div");
  breakdownSection.className = "en-git-modal-section";
  breakdownSection.innerHTML = `<div class="en-git-modal-section-title">Score Breakdown</div>`;
  for (const [key, value] of Object.entries(metrics.breakdown)) {
    const item = document.createElement("div");
    item.className = "en-git-breakdown-item";
    const label = key.charAt(0).toUpperCase() + key.slice(1);
    const color = getScoreColor(value);
    item.innerHTML = `
      <span class="en-git-breakdown-label">${label}</span>
      <div class="en-git-breakdown-bar">
        <div class="en-git-breakdown-fill" style="width: ${value}%; background: ${color};"></div>
      </div>
      <span class="en-git-breakdown-value" style="color: ${color};">${value}</span>
    `;
    breakdownSection.appendChild(item);
  }
  overviewTab.appendChild(breakdownSection);

  if (metrics.issues && metrics.issues.length > 0) {
    const issuesSection = document.createElement("div");
    issuesSection.className = "en-git-modal-section";
    issuesSection.innerHTML = `<div class="en-git-modal-section-title">Issues Found (${metrics.issues.length})</div>`;
    metrics.issues.slice(0, 5).forEach((issue) => {
      const item = document.createElement("div");
      item.className = "en-git-issue-item";
      item.innerHTML = `<span class="en-git-issue-icon">!</span><span>${issue.message}</span>`;
      issuesSection.appendChild(item);
    });
    overviewTab.appendChild(issuesSection);
  }

  if (metrics.suggestions && metrics.suggestions.length > 0) {
    const suggestionsSection = document.createElement("div");
    suggestionsSection.className = "en-git-modal-section";
    suggestionsSection.innerHTML = `<div class="en-git-modal-section-title">Top Suggestions</div>`;
    metrics.suggestions.slice(0, 5).forEach((suggestion) => {
      const item = document.createElement("div");
      item.className = "en-git-suggestion-item";
      item.innerHTML = `<span class="en-git-suggestion-icon">→</span><span>${suggestion}</span>`;
      suggestionsSection.appendChild(item);
    });
    overviewTab.appendChild(suggestionsSection);
  }

  // Security Tab
  const securityTab = document.createElement("div");
  securityTab.id = "en-git-tab-security";
  securityTab.className = "en-git-tab-content";
  securityTab.style.display = "none";

  if (metrics.security) {
    securityTab.innerHTML = `
      <div class="en-git-modal-section">
        <div class="en-git-modal-section-title">Security Analysis</div>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px;">
          <div style="padding: 12px; background: #ef444422; border-radius: 8px; text-align: center;">
            <div style="font-size: 24px; font-weight: bold; color: #ef4444;">${
              metrics.security.critical
            }</div>
            <div style="font-size: 12px; opacity: 0.7;">Critical</div>
          </div>
          <div style="padding: 12px; background: #f9731622; border-radius: 8px; text-align: center;">
            <div style="font-size: 24px; font-weight: bold; color: #f97316;">${
              metrics.security.high
            }</div>
            <div style="font-size: 12px; opacity: 0.7;">High</div>
          </div>
          <div style="padding: 12px; background: #eab30822; border-radius: 8px; text-align: center;">
            <div style="font-size: 24px; font-weight: bold; color: #eab308;">${
              metrics.security.medium
            }</div>
            <div style="font-size: 12px; opacity: 0.7;">Medium</div>
          </div>
        </div>
        ${metrics.security.issues
          .map(
            (issue) => `
          <div style="padding: 12px; margin-bottom: 8px; background: ${
            issue.severity === "critical" ? "#ef444411" : "#f9731611"
          }; border-left: 3px solid ${
              issue.severity === "critical" ? "#ef4444" : "#f97316"
            }; border-radius: 4px;">
            <div style="font-weight: 600; margin-bottom: 4px; color: ${
              issue.severity === "critical" ? "#ef4444" : "#f97316"
            };">
              ${issue.category} - ${issue.severity.toUpperCase()}
            </div>
            <div style="font-size: 14px; margin-bottom: 4px;">${
              issue.message
            }</div>
            <div style="font-size: 12px; opacity: 0.7;">${
              issue.description
            }</div>
          </div>
        `
          )
          .join("")}
        ${
          metrics.security.issues.length === 0
            ? '<div style="text-align: center; padding: 20px; opacity: 0.6;">No security issues detected!</div>'
            : ""
        }
      </div>
    `;
  } else {
    securityTab.innerHTML = `
      <div class="en-git-modal-section" style="text-align: center; padding: 40px;">
        <p style="opacity: 0.6;">Security analysis not available for this file</p>
      </div>
    `;
  }

  // Performance Tab
  const performanceTab = document.createElement("div");
  performanceTab.id = "en-git-tab-performance";
  performanceTab.className = "en-git-tab-content";
  performanceTab.style.display = "none";
  if (metrics.performance) {
    performanceTab.innerHTML = `
      <div class="en-git-modal-section">
        <div class="en-git-modal-section-title">Performance Analysis</div>
        <div style="padding: 12px; background: ${getScoreColor(
          metrics.performance.score
        )}22; border-radius: 8px; margin-bottom: 16px; text-align: center;">
          <div style="font-size: 32px; font-weight: bold; color: ${getScoreColor(
            metrics.performance.score
          )};">${metrics.performance.score}</div>
          <div style="font-size: 12px;">Performance Score</div>
          <div style="font-size: 11px; margin-top: 4px; opacity: 0.7;">${
            metrics.performance.optimizationOpportunities
          } optimization opportunities</div>
        </div>
        ${metrics.performance.issues
          .map(
            (issue) => `
          <div style="padding: 12px; margin-bottom: 8px; background: #f9731611; border-left: 3px solid #f97316; border-radius: 4px;">
            <div style="font-weight: 600; margin-bottom: 4px;">${issue.message}</div>
            <div style="font-size: 12px; opacity: 0.8; margin-bottom: 4px;">${issue.description}</div>
            <div style="font-size: 11px; color: #f97316;">Impact: ${issue.impact}</div>
          </div>
        `
          )
          .join("")}
        ${
          metrics.performance.issues.length === 0
            ? '<div style="text-align: center; padding: 20px; opacity: 0.6;">No performance issues detected!</div>'
            : ""
        }
      </div>
    `;
  } else {
    performanceTab.innerHTML = `
      <div class="en-git-modal-section" style="text-align: center; padding: 40px;">
        <p style="opacity: 0.6;">Performance analysis not available for this file</p>
      </div>
    `;
  }

  // Quality Tab
  const qualityTab = document.createElement("div");
  qualityTab.id = "en-git-tab-quality";
  qualityTab.className = "en-git-tab-content";
  qualityTab.style.display = "none";
  if (metrics.codeSmells && metrics.bestPractices) {
    qualityTab.innerHTML = `
      <div class="en-git-modal-section">
        <div class="en-git-modal-section-title">Code Smells</div>
        ${metrics.codeSmells.smells
          .map(
            (smell) => `
          <div style="padding: 12px; margin-bottom: 8px; background: #eab30811; border-left: 3px solid #eab308; border-radius: 4px;">
            <div style="font-weight: 600; margin-bottom: 4px;">${smell.type}</div>
            <div style="font-size: 13px; margin-bottom: 4px;">${smell.message}</div>
            <div style="font-size: 12px; opacity: 0.7;">${smell.description}</div>
          </div>
        `
          )
          .join("")}
        ${
          metrics.codeSmells.smells.length === 0
            ? '<div style="text-align: center; padding: 20px; opacity: 0.6;">No code smells detected!</div>'
            : ""
        }
      </div>
      <div class="en-git-modal-section">
        <div class="en-git-modal-section-title">Best Practices</div>
        ${metrics.bestPractices.violations
          .map(
            (v) => `
          <div style="padding: 12px; margin-bottom: 8px; background: #3b82f611; border-left: 3px solid #3b82f6; border-radius: 4px;">
            <div style="font-weight: 600; margin-bottom: 4px;">${v.rule}</div>
            <div style="font-size: 13px;">${v.message}</div>
          </div>
        `
          )
          .join("")}
        ${
          metrics.bestPractices.violations.length === 0
            ? '<div style="text-align: center; padding: 20px; opacity: 0.6;">All best practices followed!</div>'
            : ""
        }
      </div>
    `;
  } else {
    qualityTab.innerHTML = `
      <div class="en-git-modal-section" style="text-align: center; padding: 40px;">
        <p style="opacity: 0.6;">Quality analysis not available for this file</p>
      </div>
    `;
  }

  // Metrics Tab
  const metricsTab = document.createElement("div");
  metricsTab.id = "en-git-tab-metrics";
  metricsTab.className = "en-git-tab-content";
  metricsTab.style.display = "none";
  if (metrics.detailedMetrics && metrics.maintainability) {
    const m = metrics.detailedMetrics;
    metricsTab.innerHTML = `
      <div class="en-git-modal-section">
        <div class="en-git-modal-section-title">Code Metrics</div>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
          <div style="padding: 12px; background: #f3f4f6; border-radius: 8px; color: #1f2937;">
            <div style="font-size: 11px; opacity: 0.6; text-transform: uppercase; color: #6b7280;">Total Lines</div>
            <div style="font-size: 20px; font-weight: 600; color: #1f2937;">${
              m.totalLines
            }</div>
          </div>
          <div style="padding: 12px; background: #f3f4f6; border-radius: 8px; color: #1f2937;">
            <div style="font-size: 11px; opacity: 0.6; text-transform: uppercase; color: #6b7280;">Code Lines</div>
            <div style="font-size: 20px; font-weight: 600; color: #1f2937;">${
              m.codeLines
            }</div>
          </div>
          <div style="padding: 12px; background: #f3f4f6; border-radius: 8px; color: #1f2937;">
            <div style="font-size: 11px; opacity: 0.6; text-transform: uppercase; color: #6b7280;">Comment Lines</div>
            <div style="font-size: 20px; font-weight: 600; color: #1f2937;">${
              m.commentLines
            }</div>
          </div>
          <div style="padding: 12px; background: #f3f4f6; border-radius: 8px; color: #1f2937;">
            <div style="font-size: 11px; opacity: 0.6; text-transform: uppercase; color: #6b7280;">Blank Lines</div>
            <div style="font-size: 20px; font-weight: 600; color: #1f2937;">${
              m.blankLines
            }</div>
          </div>
          <div style="padding: 12px; background: #f3f4f6; border-radius: 8px; color: #1f2937;">
            <div style="font-size: 11px; opacity: 0.6; text-transform: uppercase; color: #6b7280;">Functions</div>
            <div style="font-size: 20px; font-weight: 600; color: #1f2937;">${
              m.functions
            }</div>
          </div>
          <div style="padding: 12px; background: #f3f4f6; border-radius: 8px; color: #1f2937;">
            <div style="font-size: 11px; opacity: 0.6; text-transform: uppercase; color: #6b7280;">Classes</div>
            <div style="font-size: 20px; font-weight: 600; color: #1f2937;">${
              m.classes
            }</div>
          </div>
          <div style="padding: 12px; background: #f3f4f6; border-radius: 8px; color: #1f2937;">
            <div style="font-size: 11px; opacity: 0.6; text-transform: uppercase; color: #6b7280;">Cyclomatic Complexity</div>
            <div style="font-size: 20px; font-weight: 600; color: #1f2937;">${
              m.cyclomaticComplexity
            }</div>
          </div>
          <div style="padding: 12px; background: #f3f4f6; border-radius: 8px; color: #1f2937;">
            <div style="font-size: 11px; opacity: 0.6; text-transform: uppercase; color: #6b7280;">Avg Line Length</div>
            <div style="font-size: 20px; font-weight: 600; color: #1f2937;">${
              m.avgLineLength
            }</div>
          </div>
        </div>
      </div>
      <div class="en-git-modal-section">
        <div class="en-git-modal-section-title">Maintainability</div>
        <div style="padding: 16px; background: ${getScoreColor(
          metrics.maintainability.index
        )}22; border-radius: 8px; text-align: center;">
          <div style="font-size: 32px; font-weight: bold; color: ${getScoreColor(
            metrics.maintainability.index
          )};">${metrics.maintainability.index}</div>
          <div style="font-size: 14px; font-weight: 600; margin-top: 4px; color: #1f2937;">${
            metrics.maintainability.rating
          }</div>
        </div>
        <div style="margin-top: 12px; padding: 12px; background: #f3f4f6; border-radius: 8px; color: #1f2937;">
          <div style="font-weight: 600; margin-bottom: 8px; color: #1f2937;">Estimated Technical Debt</div>
          <div style="font-size: 13px; color: #4b5563;">Time to refactor: ~${
            metrics.maintainability.technicalDebt.hours
          } hours (${metrics.maintainability.technicalDebt.days} days)</div>
          <div style="font-size: 12px; margin-top: 4px; color: ${
            metrics.maintainability.technicalDebt.priority === "High"
              ? "#ef4444"
              : metrics.maintainability.technicalDebt.priority === "Medium"
              ? "#f97316"
              : "#10b981"
          };">
            Priority: ${metrics.maintainability.technicalDebt.priority}
          </div>
        </div>
      </div>
    `;
  } else {
    metricsTab.innerHTML = `
      <div class="en-git-modal-section" style="text-align: center; padding: 40px;">
        <p style="opacity: 0.6;">Detailed metrics not available for this file</p>
      </div>
    `;
  }

  // AI Insights Tab
  const aiTab = document.createElement("div");
  aiTab.id = "en-git-tab-ai";
  aiTab.className = "en-git-tab-content";
  aiTab.style.display = "none";

  if (metrics.aiAnalysis) {
    if (metrics.aiAnalysis.status === "analyzing") {
      aiTab.innerHTML = `
        <div class="en-git-modal-section" style="text-align: center; padding: 40px;">
          <div style="font-size: 48px; margin-bottom: 16px;">AI</div>
          <h3 style="margin-bottom: 8px;">AI Agents Analyzing...</h3>
          <p style="opacity: 0.7; margin-bottom: 20px;">Multiple AI agents are examining your code for deep insights</p>
          <div style="display: flex; flex-direction: column; gap: 8px; max-width: 400px; margin: 0 auto;">
            <div style="padding: 12px; background: #667eea22; border-radius: 8px; text-align: left;">
              <div style="font-size: 12px; opacity: 0.7;">Security Sentinel</div>
              <div style="font-size: 11px;">Scanning for vulnerabilities...</div>
            </div>
            <div style="padding: 12px; background: #f9731622; border-radius: 8px; text-align: left;">
              <div style="font-size: 12px; opacity: 0.7;">Performance Optimizer</div>
              <div style="font-size: 11px;">Analyzing efficiency...</div>
            </div>
            <div style="padding: 12px; background: #10b98122; border-radius: 8px; text-align: left;">
              <div style="font-size: 12px; opacity: 0.7;">Architecture Advisor</div>
              <div style="font-size: 11px;">Evaluating design patterns...</div>
            </div>
            <div style="padding: 12px; background: #8b5cf622; border-radius: 8px; text-align: left;">
              <div style="font-size: 12px; opacity: 0.7;">Standards Guardian</div>
              <div style="font-size: 11px;">Checking best practices...</div>
            </div>
            <div style="padding: 12px; background: #ec489922; border-radius: 8px; text-align: left;">
              <div style="font-size: 12px; opacity: 0.7;">Refactoring Specialist</div>
              <div style="font-size: 11px;">Generating suggestions...</div>
            </div>
          </div>
          <p style="font-size: 12px; opacity: 0.5; margin-top: 20px;">This may take 10-30 seconds...</p>
        </div>
      `;
    } else if (metrics.aiAnalysis.enabled && metrics.aiAnalysis.agents) {
      const ai = metrics.aiAnalysis;
      aiTab.innerHTML = `
        <div class="en-git-modal-section">
          <div class="en-git-modal-section-title">AI-Powered Analysis</div>
          
          <!-- Overall Summary -->
          <div style="padding: 16px; background: linear-gradient(135deg, #667eea22 0%, #f97316 22 100%); border-radius: 12px; margin-bottom: 20px;">
            <div style="display: grid; grid-template-columns: 1fr auto; gap: 16px; align-items: center;">
              <div>
                <h3 style="margin: 0 0 8px 0; font-size: 18px;">Overall Assessment: ${
                  ai.summary?.overallRating || "Analysis Complete"
                }</h3>
                <div style="font-size: 13px; opacity: 0.8;">
                  ${ai.summary?.totalFindings || 0} findings across ${
        Object.keys(ai.agents).length
      } AI agents
                </div>
              </div>
              <div style="text-align: center; padding: 12px; background: white; border-radius: 8px;">
                <div style="font-size: 24px; font-weight: bold; color: ${
                  ai.summary?.bySeverity?.critical > 0 ? "#ef4444" : "#10b981"
                };">
                  ${ai.summary?.bySeverity?.critical || 0}
                </div>
                <div style="font-size: 10px; opacity: 0.6;">Critical</div>
              </div>
            </div>
            
            ${
              ai.summary?.topPriorities?.length > 0
                ? `
              <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.2);">
                <div style="font-weight: 600; margin-bottom: 8px; font-size: 13px;">Top Priority Actions:</div>
                ${ai.summary.topPriorities
                  .map(
                    (action, idx) => `
                  <div style="padding: 8px; background: rgba(255,255,255,0.5); border-radius: 6px; margin-bottom: 6px; font-size: 12px;">
                    ${idx + 1}. ${action}
                  </div>
                `
                  )
                  .join("")}
              </div>
            `
                : ""
            }
          </div>

          <!-- Agent Findings -->
          ${Object.entries(ai.agents)
            .map(([agentKey, agentData]) => {
              const agentIcons = {
                security: "[SEC]",
                performance: "[PERF]",
                architecture: "[ARCH]",
                bestPractices: "[STD]",
                refactoring: "[REF]",
              };
              const agentNames = {
                security: "Security Sentinel",
                performance: "Performance Optimizer",
                architecture: "Architecture Advisor",
                bestPractices: "Standards Guardian",
                refactoring: "Refactoring Specialist",
              };

              if (!agentData.findings || agentData.findings.length === 0)
                return "";

              return `
              <div style="margin-bottom: 20px;">
                <h4 style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px; font-size: 15px;">
                  <span style="font-size: 20px;">${agentIcons[agentKey]}</span>
                  ${agentNames[agentKey]}
                  <span style="padding: 2px 8px; background: #667eea22; border-radius: 12px; font-size: 11px; font-weight: normal;">
                    ${agentData.findings.length} finding${
                agentData.findings.length > 1 ? "s" : ""
              }
                  </span>
                </h4>
                
                ${
                  agentData.overallAssessment
                    ? `
                  <div style="padding: 12px; background: #f3f4f6; border-radius: 8px; margin-bottom: 12px; font-size: 13px; font-style: italic;">
                    ${agentData.overallAssessment}
                  </div>
                `
                    : ""
                }
                
                ${agentData.findings
                  .map((finding) => {
                    const severityColors = {
                      Critical: "#ef4444",
                      High: "#f97316",
                      Medium: "#eab308",
                      Low: "#10b981",
                    };
                    const bgColors = {
                      Critical: "#ef444411",
                      High: "#f9731611",
                      Medium: "#eab30811",
                      Low: "#10b98111",
                    };

                    return `
                    <div style="padding: 14px; margin-bottom: 10px; background: ${
                      bgColors[finding.severity] || "#f3f4f6"
                    }; border-left: 4px solid ${
                      severityColors[finding.severity] || "#667eea"
                    }; border-radius: 6px;">
                      <div style="display: flex; justify-content: between; align-items: start; margin-bottom: 8px;">
                        <h5 style="margin: 0; font-size: 14px; font-weight: 600; flex: 1;">${
                          finding.title
                        }</h5>
                        <span style="padding: 2px 8px; background: ${
                          severityColors[finding.severity]
                        }22; color: ${
                      severityColors[finding.severity]
                    }; border-radius: 12px; font-size: 10px; font-weight: 600; white-space: nowrap;">
                          ${finding.severity}
                        </span>
                      </div>
                      
                      ${
                        finding.location
                          ? `
                        <div style="font-size: 11px; opacity: 0.7; margin-bottom: 8px; font-family: monospace;">
                          Location: ${finding.location}
                        </div>
                      `
                          : ""
                      }
                      
                      <div style="font-size: 13px; margin-bottom: 10px; line-height: 1.5;">
                        ${finding.description}
                      </div>
                      
                      ${
                        finding.recommendation
                          ? `
                        <div style="padding: 10px; background: white; border-radius: 6px; margin-bottom: 8px;">
                          <div style="font-weight: 600; font-size: 12px; margin-bottom: 4px;">Recommendation:</div>
                          <div style="font-size: 12px; line-height: 1.4;">${finding.recommendation}</div>
                        </div>
                      `
                          : ""
                      }
                      
                      ${
                        finding.impact
                          ? `
                        <div style="font-size: 11px; opacity: 0.7; padding: 8px; background: rgba(255,255,255,0.5); border-radius: 4px;">
                          Impact: ${finding.impact}
                        </div>
                      `
                          : ""
                      }
                    </div>
                  `;
                  })
                  .join("")}
              </div>
            `;
            })
            .join("")}
          
          <div style="text-align: center; padding: 16px; opacity: 0.6; font-size: 12px;">
            <div>Powered by Gemini 2.5 Flash with Multi-Agent Analysis</div>
            <div style="font-size: 11px; margin-top: 4px;">Analysis completed at ${new Date(
              ai.timestamp
            ).toLocaleTimeString()}</div>
          </div>
        </div>
      `;
    } else {
      aiTab.innerHTML = `
        <div class="en-git-modal-section" style="text-align: center; padding: 40px;">
          <div style="font-size: 48px; margin-bottom: 16px;">AI</div>
          <h3 style="margin-bottom: 8px;">AI Analysis Unavailable</h3>
          <p style="opacity: 0.7;">${
            metrics.aiAnalysis.message || "AI analysis is not enabled"
          }</p>
        </div>
      `;
    }
  } else {
    aiTab.innerHTML = `
      <div class="en-git-modal-section" style="text-align: center; padding: 40px;">
        <div style="font-size: 48px; margin-bottom: 16px;">AI</div>
        <h3 style="margin-bottom: 8px;">AI Analysis</h3>
        <p style="opacity: 0.7;">Click "Analyze Code Quality" to trigger AI analysis</p>
      </div>
    `;
  }

  tabContents.appendChild(overviewTab);
  tabContents.appendChild(aiTab);
  tabContents.appendChild(securityTab);
  tabContents.appendChild(performanceTab);
  tabContents.appendChild(qualityTab);
  tabContents.appendChild(metricsTab);

  // Listen for AI analysis completion
  const aiUpdateHandler = (event) => {
    if (event.detail.fileInfo.path === fileInfo.path) {
      // Update AI tab content
      const aiTabElement = document.getElementById("en-git-tab-ai");
      if (aiTabElement && event.detail.aiInsights.enabled) {
        // Re-render AI tab with new data
        const tempMetrics = { ...metrics, aiAnalysis: event.detail.aiInsights };

        // Show notification
        const notification = document.createElement("div");
        notification.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 16px 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 12px;
          box-shadow: 0 8px 16px rgba(0,0,0,0.2);
          z-index: 10001;
          animation: slideIn 0.3s ease-out;
          font-size: 14px;
          font-weight: 500;
        `;
        notification.innerHTML = `
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 24px;">🤖</span>
            <div>
              <div>AI Analysis Complete!</div>
              <div style="font-size: 12px; opacity: 0.9; margin-top: 2px;">Check the AI Insights tab for detailed findings</div>
            </div>
          </div>
        `;
        document.body.appendChild(notification);

        // Auto-remove notification after 5 seconds
        setTimeout(() => notification.remove(), 5000);

        // Highlight AI tab
        const aiTabBtn = Array.from(
          document.querySelectorAll(".en-git-tab-btn")
        ).find((btn) => btn.textContent.includes("AI Insights"));
        if (aiTabBtn) {
          aiTabBtn.style.animation = "pulse 1s ease-in-out 3";
        }
      }
    }
  };

  window.addEventListener("en-git-ai-analysis-complete", aiUpdateHandler);

  // Clean up listener when modal closes
  const originalClose = header.querySelector(".en-git-modal-close").onclick;
  header.querySelector(".en-git-modal-close").onclick = () => {
    window.removeEventListener("en-git-ai-analysis-complete", aiUpdateHandler);
    originalClose();
  };

  const originalOverlayClick = overlay.onclick;
  overlay.onclick = (e) => {
    if (e.target === overlay) {
      window.removeEventListener(
        "en-git-ai-analysis-complete",
        aiUpdateHandler
      );
    }
    originalOverlayClick(e);
  };

  // Assemble modal
  content.appendChild(scoreSection);
  content.appendChild(tabsContainer);
  content.appendChild(tabContents);
  modal.appendChild(header);
  modal.appendChild(content);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
}

/**
 * Get color based on score
 */
function getScoreColor(score) {
  if (score >= 80) return "#10b981";
  if (score >= 60) return "#eab308";
  if (score >= 40) return "#f97316";
  return "#ef4444";
}

/**
 * Add quality badge for single file view (PR reviews, code reading)
 */
async function addSingleFileQualityBadge() {
  console.log("en-git: Adding quality badge to single file view...");

  // Check if already added - remove old ones first
  const existingBadges = document.querySelectorAll(
    ".en-git-file-quality-badge"
  );
  if (existingBadges.length > 0) {
    console.log("en-git: Removing", existingBadges.length, "existing badges");
    existingBadges.forEach((badge) => badge.remove());
  }

  // Get file info from URL
  const path = window.location.pathname;
  const match = path.match(/^\/([^\/]+)\/([^\/]+)\/blob\/[^\/]+\/(.+)$/);

  if (!match) {
    console.log("en-git: Could not parse file path");
    return;
  }

  const [, owner, repo, filePath] = match;
  const fileName = filePath.split("/").pop();

  console.log("en-git: File info:", { owner, repo, fileName, filePath });

  // Check if it's a code file
  if (!isCodeFile(fileName)) {
    console.log("en-git: Not a code file, skipping");
    return;
  }

  // Find the file header area - try multiple selectors
  let fileHeader =
    document.querySelector(".file-header") ||
    document.querySelector('[data-testid="file-header"]') ||
    document.querySelector(".Box-header") ||
    document.querySelector('[class*="react-code-view-header"]') ||
    document.querySelector("div.Box");

  if (!fileHeader) {
    console.log("en-git: Could not find file header, trying alternative...");
    // Try to find any header-like element near the top
    const headers = document.querySelectorAll("div[class*='Box']");
    if (headers.length > 0) {
      fileHeader = headers[0];
    }
  }

  if (!fileHeader) {
    console.log("en-git: Could not find file header");
    return;
  }

  console.log("en-git: Found file header:", fileHeader.className);

  // Create badge container
  const badgeContainer = document.createElement("div");
  badgeContainer.className = "en-git-file-quality-badge";
  badgeContainer.style.cssText = `
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-left: 12px;
    padding: 8px 16px;
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    color: white;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  `;

  badgeContainer.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M9 11l3 3L22 4"></path>
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
    </svg>
    <span>Analyze Code Quality</span>
  `;

  badgeContainer.onmouseover = () => {
    badgeContainer.style.transform = "translateY(-2px)";
  };

  badgeContainer.onmouseout = () => {
    badgeContainer.style.transform = "translateY(0)";
  };

  badgeContainer.onclick = async () => {
    badgeContainer.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;">
        <circle cx="12" cy="12" r="10"></circle>
      </svg>
      <span>Analyzing...</span>
    `;

    try {
      // Try multiple selectors to get file content
      let codeLines = document.querySelectorAll(".blob-code-inner");
      console.log("en-git: Found code lines (selector 1):", codeLines.length);

      if (codeLines.length === 0) {
        codeLines = document.querySelectorAll("[data-code-text]");
        console.log("en-git: Found code lines (selector 2):", codeLines.length);
      }

      if (codeLines.length === 0) {
        codeLines = document.querySelectorAll("td.blob-code");
        console.log("en-git: Found code lines (selector 3):", codeLines.length);
      }

      if (codeLines.length === 0) {
        codeLines = document.querySelectorAll('[class*="react-code-text"]');
        console.log("en-git: Found code lines (selector 4):", codeLines.length);
      }

      if (codeLines.length === 0) {
        // Try to get from pre/code elements
        const preElement =
          document.querySelector("pre") || document.querySelector("code");
        if (preElement) {
          const content = preElement.textContent;
          console.log(
            "en-git: Extracted from pre/code, length:",
            content.length
          );

          if (content.length > 0) {
            await analyzeAndShowResults(
              content,
              fileName,
              filePath,
              badgeContainer
            );
            return;
          }
        }
        throw new Error("Could not find code content on page");
      }

      // Extract content from page
      const content = Array.from(codeLines)
        .map((line) => line.textContent)
        .join("\n");

      console.log("en-git: Extracted content, length:", content.length);

      await analyzeAndShowResults(content, fileName, filePath, badgeContainer);

      // Analyze
      const metrics = await codeQualityAnalyzer.analyzeFile(content, {
        name: fileName,
        extension: fileName.split(".").pop(),
        path: filePath,
      });

      console.log("en-git: Analysis complete:", metrics);

      // Update badge with results
      const scoreColor = getScoreColor(metrics.qualityScore);

      badgeContainer.style.background = `linear-gradient(135deg, ${scoreColor} 0%, ${scoreColor}dd 100%)`;
      badgeContainer.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
        <span>Score: ${metrics.qualityScore}/100</span>
        <span style="opacity: 0.8;">•</span>
        <span>${metrics.complexity}</span>
        <span style="opacity: 0.8;">•</span>
        <span>Click for Details</span>
      `;

      badgeContainer.onclick = () => {
        showQualityDetailModal(
          { name: fileName, extension: fileName.split(".").pop() },
          metrics
        );
      };
    } catch (error) {
      console.error("en-git: Error analyzing file:", error);
      badgeContainer.style.background =
        "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)";
      badgeContainer.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <span>Error - Click to Retry</span>
      `;
    }
  };

  // Add to header
  fileHeader.appendChild(badgeContainer);
  console.log("en-git: Badge added successfully!");

  // Helper function to analyze and show results
  async function analyzeAndShowResults(
    content,
    fileName,
    filePath,
    badgeContainer
  ) {
    // Analyze
    const fileInfo = {
      name: fileName,
      extension: fileName.split(".").pop(),
      path: filePath,
    };

    const metrics = await codeQualityAnalyzer.analyzeFile(content, fileInfo);

    console.log("en-git: Analysis complete:", metrics);

    // Set initial AI analysis status
    metrics.aiAnalysis = { status: "analyzing" };

    console.log("en-git: Starting AI analysis for", fileInfo.name);

    // Trigger AI analysis in background
    const aiAnalysisPromise = aiCodeAnalysisService
      .analyzeWithAI(content, fileInfo, metrics)
      .then((aiAnalysis) => {
        metrics.aiAnalysis = aiAnalysis;
        console.log("en-git: AI analysis completed:", aiAnalysis);

        // Dispatch event so modal can update if open
        window.dispatchEvent(
          new CustomEvent("en-git-ai-analysis-complete", {
            detail: { fileInfo, aiInsights: aiAnalysis },
          })
        );

        return aiAnalysis;
      })
      .catch((error) => {
        console.error("en-git: AI analysis failed:", error);
        metrics.aiAnalysis = {
          enabled: false,
          error: error.message,
        };
        return metrics.aiAnalysis;
      });

    // Update badge with results
    const scoreColor = getScoreColor(metrics.qualityScore);

    badgeContainer.style.background = `linear-gradient(135deg, ${scoreColor} 0%, ${scoreColor}dd 100%)`;
    badgeContainer.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
      <span>Score: ${metrics.qualityScore}/100</span>
      <span style="opacity: 0.8;">•</span>
      <span>${metrics.complexity}</span>
      <span style="opacity: 0.8;">•</span>
      <span>Click for Details</span>
    `;

    // Make badge clickable to show modal
    badgeContainer.style.cursor = "pointer";
    badgeContainer.onclick = async () => {
      // Wait for AI analysis if still running
      if (metrics.aiAnalysis?.status === "analyzing") {
        console.log("en-git: Waiting for AI analysis to complete...");
        await aiAnalysisPromise;
        console.log(
          "en-git: AI analysis complete. Final state:",
          metrics.aiAnalysis
        );
      } else {
        console.log(
          "en-git: AI analysis state when opening modal:",
          metrics.aiAnalysis
        );
      }

      showQualityDetailModal(fileInfo, metrics);
    };
  }
}

// Initialize code quality badges when on repo page
function initCodeQuality() {
  const path = window.location.pathname;

  console.log("en-git: Current path:", path);

  // Check if we're viewing a single file - ADD QUALITY BADGE HERE!
  if (path.includes("/blob/")) {
    console.log("en-git: ✅ Single file view detected - adding quality badge");
    setTimeout(addSingleFileQualityBadge, 1500);
    setTimeout(addSingleFileQualityBadge, 3000); // Retry
    return;
  }

  // For file listings, we don't add code quality badges anymore
  // (Only show on single file view for PR reviews)
  console.log("en-git: Not on single file view, skipping code quality badges");
}

// Run code quality initialization
initCodeQuality();
