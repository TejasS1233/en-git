/**
 * AI-Powered Code Analysis Service
 * Uses multiple Gemini 2.5 Flash agents for comprehensive code analysis
 */

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

  /**
   * Initialize with API key
   */
  async initialize() {
    // Try to get API key from backend
    try {
      const response = await fetch(
        "https://en-git.vercel.app/api/v1/extension/api-key",
        {
          credentials: "include",
        }
      );
      if (response.ok) {
        const data = await response.json();
        this.apiKey = data.apiKey;
      }
    } catch (error) {
      console.warn("Could not fetch API key from backend:", error);
    }
  }

  /**
   * Security Analysis Agent
   */
  createSecurityAgent() {
    return {
      name: "Security Sentinel",
      role: "security-expert",
      systemPrompt: `You are a cybersecurity expert specializing in code security analysis. Your mission is to identify security vulnerabilities, potential exploits, and insecure coding patterns.

Focus on:
- SQL/NoSQL injection vulnerabilities
- Cross-Site Scripting (XSS) risks
- Authentication and authorization flaws
- Cryptographic weaknesses
- Input validation issues
- Sensitive data exposure
- Insecure dependencies
- Code injection risks

Provide:
1. Severity level (Critical/High/Medium/Low)
2. Specific vulnerability description
3. Affected code patterns
4. Exploit scenario
5. Remediation steps
6. Security best practice recommendation

Be precise, actionable, and prioritize by risk level.`,
    };
  }

  /**
   * Performance Analysis Agent
   */
  createPerformanceAgent() {
    return {
      name: "Performance Optimizer",
      role: "performance-expert",
      systemPrompt: `You are a performance optimization expert focusing on runtime efficiency, memory usage, and scalability.

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

  /**
   * Architecture Analysis Agent
   */
  createArchitectureAgent() {
    return {
      name: "Architecture Advisor",
      role: "architecture-expert",
      systemPrompt: `You are a software architect evaluating code design, structure, and maintainability.

Evaluate:
- Design patterns and anti-patterns
- SOLID principles adherence
- Separation of concerns
- Code coupling and cohesion
- Modularity and reusability
- Scalability considerations
- Technical debt indicators
- Code organization

Provide:
1. Design issue severity
2. Architectural smell description
3. Impact on maintainability
4. Refactoring approach
5. Design pattern recommendation
6. Long-term implications

Think about system evolution and team collaboration.`,
    };
  }

  /**
   * Best Practices Agent
   */
  createBestPracticesAgent() {
    return {
      name: "Standards Guardian",
      role: "best-practices-expert",
      systemPrompt: `You are a coding standards expert ensuring adherence to industry best practices and language-specific idioms.

Check for:
- Language-specific conventions
- Framework best practices
- Code style consistency
- Documentation quality
- Error handling patterns
- Testing considerations
- Accessibility standards
- Modern language features usage

Provide:
1. Practice violation type
2. Current vs. recommended approach
3. Reasoning for best practice
4. Code example of proper usage
5. Learning resources
6. Team adoption strategy

Be educational and constructive.`,
    };
  }

  /**
   * Refactoring Agent
   */
  createRefactoringAgent() {
    return {
      name: "Refactoring Specialist",
      role: "refactoring-expert",
      systemPrompt: `You are a refactoring expert who provides concrete, step-by-step code improvement suggestions.

Focus on:
- Code readability improvements
- Complexity reduction strategies
- Function/method extraction
- Variable/function naming
- Code duplication elimination
- Simplification opportunities
- Modern syntax adoption
- Test-friendly refactoring

Provide:
1. Refactoring priority (High/Medium/Low)
2. Current code issue
3. Step-by-step refactoring plan
4. Before/after code comparison
5. Benefits of refactoring
6. Potential risks and mitigation

Be specific and provide actionable refactoring steps.`,
    };
  }

  /**
   * Analyze code with multiple AI agents
   */
  async analyzeWithAI(code, fileInfo, basicMetrics) {
    if (!this.apiKey) {
      await this.initialize();
    }

    if (!this.apiKey) {
      return {
        enabled: false,
        message: "AI analysis not available - API key not configured",
      };
    }

    try {
      // Prepare code context
      const codeContext = this.prepareCodeContext(code, fileInfo, basicMetrics);

      // Run agents in parallel for faster results
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

      // Synthesize results
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

  /**
   * Prepare code context for AI analysis
   */
  prepareCodeContext(code, fileInfo, basicMetrics) {
    // Truncate very long files for API limits
    const maxCodeLength = 8000;
    const truncatedCode =
      code.length > maxCodeLength
        ? code.substring(0, maxCodeLength) + "\n... (truncated)"
        : code;

    return {
      fileName: fileInfo.name,
      extension: fileInfo.extension,
      path: fileInfo.path,
      code: truncatedCode,
      metrics: {
        linesOfCode: basicMetrics.linesOfCode,
        complexity: basicMetrics.complexity,
        qualityScore: basicMetrics.qualityScore,
        issuesFound: basicMetrics.issues?.length || 0,
      },
      language: this.detectLanguage(fileInfo.extension),
    };
  }

  /**
   * Run a specific agent
   */
  async runAgent(agent, context) {
    const prompt = `${agent.systemPrompt}

FILE INFORMATION:
- Name: ${context.fileName}
- Language: ${context.language}
- Lines of Code: ${context.metrics.linesOfCode}
- Current Complexity: ${context.metrics.complexity}
- Quality Score: ${context.metrics.qualityScore}/100

CODE TO ANALYZE:
\`\`\`${context.language}
${context.code}
\`\`\`

Provide a structured JSON response with the following format:
{
  "findings": [
    {
      "severity": "Critical|High|Medium|Low",
      "title": "Brief issue title",
      "description": "Detailed description",
      "location": "Specific code location or pattern",
      "recommendation": "How to fix",
      "impact": "What happens if not fixed"
    }
  ],
  "overallAssessment": "Summary of findings",
  "priorityActions": ["Most important action 1", "Most important action 2"]
}

Analyze thoroughly but be concise. Focus on the most impactful issues.`;

    try {
      const response = await fetch(`${this.apiEndpoint}?key=${this.apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.4, // Lower temperature for more focused analysis
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const text = data.candidates[0]?.content?.parts[0]?.text || "{}";

      // Extract JSON from markdown code blocks if present
      const jsonMatch =
        text.match(/```json\s*([\s\S]*?)\s*```/) ||
        text.match(/```\s*([\s\S]*?)\s*```/);
      const jsonText = jsonMatch ? jsonMatch[1] : text;

      return JSON.parse(jsonText);
    } catch (error) {
      console.error(`Agent ${agent.name} error:`, error);
      return {
        findings: [],
        overallAssessment: `Analysis failed: ${error.message}`,
        priorityActions: [],
      };
    }
  }

  /**
   * Extract result from Promise.allSettled
   */
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

  /**
   * Generate overall summary
   */
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

  /**
   * Detect programming language from extension
   */
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

// Export singleton instance
export const aiCodeAnalysisService = new AICodeAnalysisService();
