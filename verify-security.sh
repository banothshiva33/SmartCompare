#!/bin/bash
# Security Verification Script
# Run this before committing code or deploying

set -e

echo "🔒 Smart Compare Security Verification"
echo "========================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0

# Function to print results
check_passed() {
    echo -e "${GREEN}✅ PASSED${NC}: $1"
    ((PASSED++))
}

check_failed() {
    echo -e "${RED}❌ FAILED${NC}: $1"
    ((FAILED++))
}

check_warning() {
    echo -e "${YELLOW}⚠️  WARNING${NC}: $1"
}

# ========== Environment File Checks ==========
echo ""
echo "📋 Environment Files Check"
echo "─────────────────────────"

if [ -f ".env.local" ]; then
    check_warning ".env.local exists (should not be in git)"
    if git check-ignore .env.local > /dev/null 2>&1; then
        check_passed ".env.local is in .gitignore"
    else
        check_failed ".env.local is NOT in .gitignore - THIS IS A SECURITY RISK!"
    fi
else
    check_passed ".env.local not found (good for repo)"
fi

if [ -f ".env.example" ]; then
    check_passed ".env.example exists for reference"
else
    check_failed ".env.example not found"
fi

# ========== Git Security Checks ==========
echo ""
echo "🔐 Git Security Check"
echo "────────────────────"

if git rev-parse --git-dir > /dev/null 2>&1; then
    # Check for hardcoded secrets in staged files
    if git diff --cached | grep -i "password\|api_key\|secret\|mongodb+srv" > /dev/null; then
        check_failed "Hardcoded secrets found in staged files!"
        echo "  Run: git diff --cached | grep -i 'password\\|api_key\\|secret'"
    else
        check_passed "No hardcoded secrets in staged files"
    fi

    # Check .env files in git history
    if git log --all --name-only | grep -E "\.env\." > /dev/null; then
        check_warning ".env files found in git history"
        echo "  Consider: git filter-branch to remove sensitive files"
    else
        check_passed "No .env files in git history"
    fi
else
    check_warning "Not in a git repository - skipping git checks"
fi

# ========== NPM Security Checks ==========
echo ""
echo "📦 Dependency Security Check"
echo "───────────────────────────"

if command -v npm &> /dev/null; then
    # Check for npm audit
    if npm audit --production 2>/dev/null | grep -q "vulnerabilities"; then
        VULN_COUNT=$(npm audit --production 2>/dev/null | grep vulnerabilities | head -1)
        check_failed "Security vulnerabilities found: $VULN_COUNT"
        echo "  Run: npm audit fix"
    else
        check_passed "No high-severity vulnerabilities in npm audit"
    fi

    # Check for crypto-js
    if npm ls crypto-js 2>/dev/null | grep -q "crypto-js"; then
        check_failed "crypto-js found (has known vulnerabilities - remove it!)"
    else
        check_passed "crypto-js not installed (good!)"
    fi

    # Check for node_modules
    if [ -d "node_modules" ]; then
        check_passed "node_modules exists"
    else
        check_warning "node_modules not found - run 'npm install'"
    fi
else
    check_warning "npm not found - skipping npm checks"
fi

# ========== Code Quality Checks ==========
echo ""
echo "🔍 Code Quality Check"
echo "────────────────────"

# Check for validation.ts
if [ -f "src/lib/validation.ts" ]; then
    check_passed "Input validation module exists"
else
    check_failed "Input validation module not found"
fi

# Check for security.ts
if [ -f "src/lib/security.ts" ]; then
    check_passed "Security utilities module exists"
else
    check_failed "Security utilities module not found"
fi

# Check for middleware.ts
if [ -f "src/middleware.ts" ]; then
    check_passed "Security middleware exists"
else
    check_failed "Security middleware not found"
fi

# Check for env.ts
if [ -f "src/lib/env.ts" ]; then
    check_passed "Environment validation module exists"
else
    check_failed "Environment validation module not found"
fi

# ========== File Permission Checks ==========
echo ""
echo "🔐 File Permission Check"
echo "───────────────────────"

if [ -f ".env.example" ]; then
    PERMS=$(stat -f%A .env.example 2>/dev/null || stat -c %a .env.example)
    check_passed ".env.example has permissions: $PERMS"
fi

# ========== Distribution Readiness ==========
echo ""
echo "🚀 Distribution Readiness Check"
echo "───────────────────────────────"

# Check for build directory
if [ -f "next.config.ts" ]; then
    check_passed "Next.js configuration exists"
else
    check_failed "Next.js configuration not found"
fi

# Check tsconfig
if [ -f "tsconfig.json" ]; then
    check_passed "TypeScript configuration exists"
else
    check_failed "TypeScript configuration not found"
fi

# ========== Summary ==========
echo ""
echo "📊 Summary"
echo "────────"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "Failed: $([ $FAILED -eq 0 ] && echo -e "${GREEN}$FAILED${NC}" || echo -e "${RED}$FAILED${NC}")${NC}"

echo ""
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All security checks passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some security checks failed!${NC}"
    echo "Please fix the issues above before deploying."
    exit 1
fi
