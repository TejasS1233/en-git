import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Checkbox } from "../ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Alert, AlertDescription } from "../ui/alert";
import {
  Download,
  Copy,
  Play,
  Settings,
  Code,
  CheckCircle,
  AlertTriangle,
  Zap,
  FileText,
  Github,
  Container,
  Shield,
  Clock,
} from "lucide-react";

const WorkflowTemplateGenerator = ({ pipeline }) => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [generatedWorkflow, setGeneratedWorkflow] = useState("");
  const [customizationOptions, setCustomizationOptions] = useState({
    nodeVersion: "18",
    os: "ubuntu-latest",
    includeTests: true,
    includeSecurity: true,
    includePerformance: false,
    includeDeployment: false,
    cacheDependencies: true,
    parallelJobs: false,
    notifications: true,
    customSteps: [],
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Predefined workflow templates
  const workflowTemplates = [
    {
      id: "basic-ci",
      name: "Basic CI Pipeline",
      description: "Essential CI workflow with linting, building, and testing",
      icon: <Code className="h-5 w-5" />,
      features: ["Linting", "Building", "Testing", "Caching"],
      estimatedTime: "5-10 minutes",
      complexity: "Low",
      cost: "Low",
    },
    {
      id: "full-ci-cd",
      name: "Full CI/CD Pipeline",
      description: "Complete pipeline with CI, CD, security scanning, and deployment",
      icon: <Github className="h-5 w-5" />,
      features: [
        "CI/CD",
        "Security Scanning",
        "Performance Testing",
        "Deployment",
        "Notifications",
      ],
      estimatedTime: "15-25 minutes",
      complexity: "High",
      cost: "High",
    },
    {
      id: "security-focused",
      name: "Security-Focused Pipeline",
      description: "Pipeline optimized for security scanning and compliance",
      icon: <Shield className="h-5 w-5" />,
      features: ["Dependency Scanning", "Code Analysis", "Container Scanning", "License Check"],
      estimatedTime: "10-15 minutes",
      complexity: "Medium",
      cost: "Medium",
    },
    {
      id: "performance-optimized",
      name: "Performance-Optimized Pipeline",
      description: "Pipeline designed for maximum performance and efficiency",
      icon: <Zap className="h-5 w-5" />,
      features: [
        "Parallel Jobs",
        "Advanced Caching",
        "Resource Optimization",
        "Performance Testing",
      ],
      estimatedTime: "8-12 minutes",
      complexity: "Medium",
      cost: "Medium",
    },
    {
      id: "docker-based",
      name: "Docker-Based Pipeline",
      description: "Containerized workflow with Docker build and push",
      icon: <Container className="h-5 w-5" />,
      features: ["Docker Build", "Container Registry", "Multi-Platform", "Container Security"],
      estimatedTime: "12-18 minutes",
      complexity: "High",
      cost: "High",
    },
    {
      id: "minimal",
      name: "Minimal Pipeline",
      description: "Lightweight pipeline for simple projects",
      icon: <FileText className="h-5 w-5" />,
      features: ["Basic Build", "Simple Testing"],
      estimatedTime: "3-5 minutes",
      complexity: "Low",
      cost: "Very Low",
    },
  ];

  const generateWorkflow = (templateId, options) => {
    const templates = {
      "basic-ci": generateBasicCI(options),
      "full-ci-cd": generateFullCICD(options),
      "security-focused": generateSecurityFocused(options),
      "performance-optimized": generatePerformanceOptimized(options),
      "docker-based": generateDockerBased(options),
      minimal: generateMinimal(options),
    };

    return templates[templateId] || "";
  };

  const generateBasicCI = (options) => {
    return `name: Basic CI Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

env:
  NODE_VERSION: '${options.nodeVersion}'

jobs:
  lint-and-test:
    name: Lint and Test
    runs-on: ${options.os}
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: \${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run tests
        run: npm test

  build:
    name: Build Application
    runs-on: ${options.os}
    needs: lint-and-test
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: \${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build

      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: build-files
          path: dist/
          retention-days: 7`;
  };

  const generateFullCICD = (options) => {
    return `name: Full CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]
  workflow_dispatch:

env:
  NODE_VERSION: '${options.nodeVersion}'

jobs:
  lint:
    name: Lint & Format Check
    runs-on: ${options.os}
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: \${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

      - name: Check Prettier formatting
        run: npx prettier --check .

  test:
    name: Run Tests
    runs-on: ${options.os}
    needs: lint
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: \${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:unit

      - name: Run integration tests
        run: npm run test:integration

      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info

  build:
    name: Build Application
    runs-on: ${options.os}
    needs: test
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: \${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build

      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: build-files
          path: dist/
          retention-days: 7

  security-scan:
    name: Security Scan
    runs-on: ${options.os}
    needs: build
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'sarif'
          output: 'trivy-results.sarif'

      - name: Upload Trivy scan results
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: 'trivy-results.sarif'

  deploy-staging:
    name: Deploy to Staging
    runs-on: ${options.os}
    needs: [build, security-scan]
    if: github.ref == 'refs/heads/develop'
    environment: staging
    steps:
      - name: Download build artifacts
        uses: actions/download-artifact@v4
        with:
          name: build-files

      - name: Install Vercel CLI
        run: npm install -g vercel@latest

      - name: Deploy to Vercel Staging
        run: |
          echo "Deploying to Vercel staging environment..."
          vercel --token=\${{ secrets.VERCEL_TOKEN }} --scope=\${{ secrets.VERCEL_SCOPE }} --env=staging --prod=false
        env:
          VERCEL_PROJECT_ID: \${{ secrets.VERCEL_PROJECT_ID }}
          VERCEL_ORG_ID: \${{ secrets.VERCEL_ORG_ID }}

  deploy-production:
    name: Deploy to Production
    runs-on: ${options.os}
    needs: [build, security-scan]
    if: github.ref == 'refs/heads/main'
    environment: production
    steps:
      - name: Download build artifacts
        uses: actions/download-artifact@v4
        with:
          name: build-files

      - name: Install Vercel CLI
        run: npm install -g vercel@latest

      - name: Deploy to Vercel Production
        run: |
          echo "Deploying to Vercel production environment..."
          vercel --token=\${{ secrets.VERCEL_TOKEN }} --scope=\${{ secrets.VERCEL_SCOPE }} --prod
        env:
          VERCEL_PROJECT_ID: \${{ secrets.VERCEL_PROJECT_ID }}
          VERCEL_ORG_ID: \${{ secrets.VERCEL_ORG_ID }}

      - name: Run Post-Deployment Tests
        run: |
          echo "Running post-deployment tests..."
          # Add your post-deployment test commands here

      - name: Notify deployment
        uses: 8398a7/action-slack@v3
        with:
          status: \${{ job.status }}
          channel: '#deployments'
          webhook_url: \${{ secrets.SLACK_WEBHOOK }}`;
  };

  const generateSecurityFocused = (options) => {
    return `name: Security-Focused Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]
  schedule:
    - cron: '0 2 * * 1' # Weekly on Monday at 2 AM

env:
  NODE_VERSION: '${options.nodeVersion}'

jobs:
  dependency-scan:
    name: Dependency Vulnerability Scan
    runs-on: ${options.os}
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: \${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run npm audit
        run: npm audit --audit-level=moderate

      - name: Run Snyk to check for vulnerabilities
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: \${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high

  code-scan:
    name: Code Security Scan
    runs-on: ${options.os}
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'sarif'
          output: 'trivy-results.sarif'

      - name: Upload Trivy scan results
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: 'trivy-results.sarif'

      - name: Run CodeQL Analysis
        uses: github/codeql-action/analyze@v3
        with:
          languages: javascript

  container-scan:
    name: Container Security Scan
    runs-on: ${options.os}
    if: github.event_name == 'pull_request'
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Build Docker image
        run: docker build -t app-security-scan .

      - name: Run Trivy container scan
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: 'app-security-scan'
          format: 'sarif'
          output: 'trivy-container-results.sarif'

      - name: Upload Trivy container scan results
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: 'trivy-container-results.sarif'

  license-check:
    name: License Compliance Check
    runs-on: ${options.os}
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: \${{ env.NODE_VERSION }}

      - name: Install dependencies
        run: npm ci

      - name: Check licenses
        run: |
          npx license-checker --onlyAllow 'MIT;Apache-2.0;BSD-2-Clause;BSD-3-Clause;ISC;Unlicense'`;
  };

  const generatePerformanceOptimized = (options) => {
    return `name: Performance-Optimized Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

env:
  NODE_VERSION: '${options.nodeVersion}'
  NPM_CACHE_FOLDER: ~/.npm
  NPM_CACHE_KEY: \${{ runner.os }}-node-\${{ hashFiles('**/package-lock.json') }}

jobs:
  lint:
    name: Lint & Format Check
    runs-on: ${options.os}
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: \${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

  build-client:
    name: Build Client
    runs-on: ${options.os}
    needs: lint
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: \${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build

      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: client-build
          path: dist/
          retention-days: 7

  build-server:
    name: Build Server
    runs-on: ${options.os}
    needs: lint
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: \${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build server
        run: npm run build:server

      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: server-build
          path: server/dist/
          retention-days: 7

  test:
    name: Run Tests
    runs-on: ${options.os}
    needs: [build-client, build-server]
    strategy:
      matrix:
        test-type: [unit, integration, e2e]
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: \${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Download build artifacts
        uses: actions/download-artifact@v4
        with:
          name: client-build

      - name: Download server artifacts
        uses: actions/download-artifact@v4
        with:
          name: server-build

      - name: Run \${{ matrix.test-type }} tests
        run: npm run test:\${{ matrix.test-type }}

  performance-test:
    name: Performance Test
    runs-on: ${options.os}
    needs: [build-client, build-server]
    if: github.event_name == 'pull_request'
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: \${{ env.NODE_VERSION }}

      - name: Install dependencies
        run: npm ci

      - name: Download build artifacts
        uses: actions/download-artifact@v4
        with:
          name: client-build

      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v10
        with:
          configPath: './.lighthouserc.json'
          uploadArtifacts: true
          temporaryPublicStorage: true`;
  };

  const generateDockerBased = (options) => {
    return `name: Docker-Based Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: \${{ github.repository }}

jobs:
  build-and-push:
    name: Build and Push Docker Image
    runs-on: ${options.os}
    permissions:
      contents: read
      packages: write
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: \${{ env.REGISTRY }}
          username: \${{ github.actor }}
          password: \${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: \${{ env.REGISTRY }}/\${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=sha,prefix={{branch}}-
            type=raw,value=latest,enable={{is_default_branch}}

      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          platforms: linux/amd64,linux/arm64
          push: true
          tags: \${{ steps.meta.outputs.tags }}
          labels: \${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  security-scan:
    name: Container Security Scan
    runs-on: ${options.os}
    needs: build-and-push
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: \${{ env.REGISTRY }}/\${{ env.IMAGE_NAME }}:\${{ github.sha }}
          format: 'sarif'
          output: 'trivy-results.sarif'

      - name: Upload Trivy scan results
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: 'trivy-results.sarif'

  deploy:
    name: Deploy Container
    runs-on: ${options.os}
    needs: [build-and-push, security-scan]
    if: github.ref == 'refs/heads/main'
    environment: production
    steps:
      - name: Deploy to production
        run: |
          echo "Deploying Docker container to production..."
          # Add your deployment commands here`;
  };

  const generateMinimal = (options) => {
    return `name: Minimal Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-test:
    name: Build and Test
    runs-on: ${options.os}
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '${options.nodeVersion}'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build application
        run: npm run build`;
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setIsGenerating(true);

    // Simulate generation delay
    setTimeout(() => {
      const workflow = generateWorkflow(template.id, customizationOptions);
      setGeneratedWorkflow(workflow);
      setIsGenerating(false);
    }, 1000);
  };

  const handleCustomizationChange = (key, value) => {
    setCustomizationOptions((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedWorkflow);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const downloadWorkflow = () => {
    const blob = new Blob([generatedWorkflow], { type: "text/yaml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${selectedTemplate?.id || "workflow"}.yml`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getComplexityColor = (complexity) => {
    switch (complexity) {
      case "Low":
        return "bg-green-100 text-green-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "High":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCostColor = (cost) => {
    switch (cost) {
      case "Very Low":
        return "bg-green-100 text-green-800";
      case "Low":
        return "bg-blue-100 text-blue-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "High":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Template Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Workflow Template Generator</CardTitle>
          <CardDescription>
            Generate GitHub Actions workflows with one-click templates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workflowTemplates.map((template) => (
              <div
                key={template.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedTemplate?.id === template.id
                    ? "border-blue-500 bg-blue-50"
                    : "hover:bg-gray-50"
                }`}
                onClick={() => handleTemplateSelect(template)}
              >
                <div className="flex items-start space-x-3">
                  <div className="text-blue-500">{template.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{template.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-1">
                        {template.features.map((feature, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-3 w-3" />
                          <span>{template.estimatedTime}</span>
                        </div>
                        <div className="flex space-x-1">
                          <Badge className={getComplexityColor(template.complexity)}>
                            {template.complexity}
                          </Badge>
                          <Badge className={getCostColor(template.cost)}>{template.cost}</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Customization Options */}
      {selectedTemplate && (
        <Card>
          <CardHeader>
            <CardTitle>Customization Options</CardTitle>
            <CardDescription>Customize your workflow before generation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="nodeVersion">Node.js Version</Label>
                <Select
                  value={customizationOptions.nodeVersion}
                  onValueChange={(value) => handleCustomizationChange("nodeVersion", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="16">Node.js 16</SelectItem>
                    <SelectItem value="18">Node.js 18</SelectItem>
                    <SelectItem value="20">Node.js 20</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="os">Operating System</Label>
                <Select
                  value={customizationOptions.os}
                  onValueChange={(value) => handleCustomizationChange("os", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ubuntu-latest">Ubuntu Latest</SelectItem>
                    <SelectItem value="windows-latest">Windows Latest</SelectItem>
                    <SelectItem value="macos-latest">macOS Latest</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Features</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeTests"
                      checked={customizationOptions.includeTests}
                      onCheckedChange={(checked) =>
                        handleCustomizationChange("includeTests", checked)
                      }
                    />
                    <Label htmlFor="includeTests">Include Tests</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeSecurity"
                      checked={customizationOptions.includeSecurity}
                      onCheckedChange={(checked) =>
                        handleCustomizationChange("includeSecurity", checked)
                      }
                    />
                    <Label htmlFor="includeSecurity">Include Security</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includePerformance"
                      checked={customizationOptions.includePerformance}
                      onCheckedChange={(checked) =>
                        handleCustomizationChange("includePerformance", checked)
                      }
                    />
                    <Label htmlFor="includePerformance">Include Performance</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeDeployment"
                      checked={customizationOptions.includeDeployment}
                      onCheckedChange={(checked) =>
                        handleCustomizationChange("includeDeployment", checked)
                      }
                    />
                    <Label htmlFor="includeDeployment">Include Deployment</Label>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Button
                onClick={() => handleTemplateSelect(selectedTemplate)}
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating Workflow...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Generate Workflow
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generated Workflow */}
      {generatedWorkflow && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Generated Workflow</CardTitle>
                <CardDescription>Your customized GitHub Actions workflow is ready</CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={copyToClipboard}>
                  {copied ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
                <Button variant="outline" size="sm" onClick={downloadWorkflow}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="preview" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="code">Code</TabsTrigger>
              </TabsList>
              <TabsContent value="preview" className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    This workflow is ready to be saved as{" "}
                    <code>.github/workflows/{selectedTemplate?.id || "workflow"}.yml</code> in your
                    repository.
                  </AlertDescription>
                </Alert>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Workflow Features:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {selectedTemplate?.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>
              </TabsContent>
              <TabsContent value="code">
                <div className="relative">
                  <pre className="p-4 bg-gray-900 text-gray-100 rounded-lg overflow-x-auto text-sm">
                    <code>{generatedWorkflow}</code>
                  </pre>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Implementation Guide */}
      {selectedTemplate && (
        <Card>
          <CardHeader>
            <CardTitle>Implementation Guide</CardTitle>
            <CardDescription>Steps to implement your generated workflow</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">1. Save the Workflow</h4>
                  <p className="text-sm text-muted-foreground">
                    Create a new file in your repository at{" "}
                    <code>.github/workflows/{selectedTemplate.id}.yml</code> and paste the generated
                    content.
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">2. Configure Secrets</h4>
                  <p className="text-sm text-muted-foreground">
                    Add any required secrets in your repository settings under Settings → Secrets
                    and variables → Actions.
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">3. Test the Workflow</h4>
                  <p className="text-sm text-muted-foreground">
                    Create a test branch and push changes to trigger the workflow and verify it
                    works correctly.
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">4. Monitor Performance</h4>
                  <p className="text-sm text-muted-foreground">
                    Use the CI/CD Pipeline dashboard to monitor performance and optimize as needed.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WorkflowTemplateGenerator;
