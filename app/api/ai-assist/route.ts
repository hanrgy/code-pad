import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface AIRequest {
  action: 'fix' | 'refactor' | 'explain' | 'test'
  code: string
  language: string
  selection?: {
    start: number
    end: number
  }
  context?: string
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    const body: AIRequest = await request.json()
    const { action, code, language, selection, context } = body

    if (!action || !code) {
      return NextResponse.json(
        { error: 'Missing required fields: action and code' },
        { status: 400 }
      )
    }

    // Extract selected code if selection is provided
    const selectedCode = selection 
      ? code.substring(selection.start, selection.end)
      : code

    const contextInfo = selectedCode !== code 
      ? `\n\nFull context:\n\`\`\`${language}\n${code}\n\`\`\``
      : ''

    // Create prompts based on action type
    const prompts = {
      fix: `You are an expert ${language} developer. Analyze the following code and fix any bugs, errors, or issues you find. Provide the corrected code and explain what was wrong.

Code to fix:
\`\`\`${language}
${selectedCode}
\`\`\`${contextInfo}

Please respond with:
1. The fixed code (in a code block)
2. A clear explanation of what was wrong and how you fixed it
3. Any additional suggestions for improvement

Focus on:
- Syntax errors
- Logic errors  
- Runtime errors
- Best practices violations
- Performance issues`,

      refactor: `You are an expert ${language} developer. Refactor the following code to improve its quality, readability, and maintainability while preserving its functionality.

Code to refactor:
\`\`\`${language}
${selectedCode}
\`\`\`${contextInfo}

Please respond with:
1. The refactored code (in a code block)
2. A clear explanation of the improvements made
3. Why these changes make the code better

Focus on:
- Code readability and clarity
- Removing code duplication
- Improving naming conventions
- Better error handling
- Performance optimizations
- Following best practices`,

      explain: `You are an expert ${language} developer and teacher. Explain the following code in detail, helping someone understand what it does and how it works.

Code to explain:
\`\`\`${language}
${selectedCode}
\`\`\`${contextInfo}

Please provide:
1. A high-level overview of what the code does
2. Line-by-line or section-by-section explanation
3. Key concepts or patterns used
4. Potential use cases or applications
5. Any notable implementation details

Make your explanation clear and educational, suitable for developers learning ${language}.`,

      test: `You are an expert ${language} developer. Generate comprehensive unit tests for the following code. Create tests that verify the functionality and handle edge cases.

Code to test:
\`\`\`${language}
${selectedCode}
\`\`\`${contextInfo}

Please respond with:
1. Complete unit tests (in a code block)
2. Explanation of what each test verifies
3. Coverage of edge cases and error conditions
4. Setup/teardown if needed

Use appropriate testing frameworks for ${language} (e.g., Jest for JavaScript, pytest for Python, etc.).`
    }

    const systemPrompt = `You are an expert software developer and code reviewer with deep knowledge of ${language} and software engineering best practices. You provide helpful, accurate, and actionable code assistance. Always format code properly and explain your reasoning clearly.`

    const userPrompt = prompts[action]

    console.log(`AI Assistant: ${action} request for ${language} code`)

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 2000,
      temperature: 0.1, // Lower temperature for more consistent, focused responses
    })

    const response = completion.choices[0]?.message?.content

    if (!response) {
      return NextResponse.json(
        { error: 'No response from AI' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      suggestion: response,
      action,
      language,
      timestamp: new Date().toISOString(),
      usage: {
        prompt_tokens: completion.usage?.prompt_tokens,
        completion_tokens: completion.usage?.completion_tokens,
        total_tokens: completion.usage?.total_tokens
      }
    })

  } catch (error) {
    console.error('AI Assistant Error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to process AI request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
