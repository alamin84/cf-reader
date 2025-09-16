
import { Problem, Content } from '../types';

const API_URL = 'https://codeforces.com/api/problemset.problems';
// Switched to a more reliable CORS proxy to fix fetching issues.
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

interface CodeforcesResponse {
  status: string;
  result: {
    problems: Problem[];
  };
}

/**
 * Checks if a string is likely a section heading.
 * @param text The text to check.
 * @returns True if the text resembles a heading.
 */
const isHeadingLike = (text: string): boolean => {
    const trimmed = text.trim();
    if (trimmed.endsWith(':')) return true;
    // Short text that is common as a heading.
    if (trimmed.length < 20 && /^(Input|Output|Note|Notes|Example|Examples|Scoring)$/i.test(trimmed)) {
        return true;
    }
    return false;
};


/**
 * Cleans Codeforces HTML in-place by replacing non-semantic style spans with
 * semantic tags (strong, em, code), removing MathJax previews, stripping font tags,
 * and merging adjacent paragraphs that appear to be split mid-sentence.
 * @param contentEl The root DOM element to clean.
 */
const cleanCodeforcesHtml = (contentEl: Element): void => {
    // Trim leading space from header values (e.g., " 1 second" -> "1 second")
    // This complements the CSS `::after { content: ': ' }` to prevent double spaces.
    contentEl.querySelectorAll('.property-title').forEach(titleEl => {
      const nextSibling = titleEl.nextSibling;
      if (nextSibling && nextSibling.nodeType === Node.TEXT_NODE) {
        nextSibling.textContent = nextSibling.textContent?.trimStart() || '';
      }
    });
    
    // Remove MathJax preview spans
    contentEl.querySelectorAll('span.MathJax_Preview').forEach(el => el.remove());

    // Remove font tags which cause color issues, but keep their content.
    contentEl.querySelectorAll('font').forEach(font => {
        const parent = font.parentNode;
        if (parent) {
            while (font.firstChild) {
                parent.insertBefore(font.firstChild, font);
            }
            parent.removeChild(font);
        }
    });

    // Replace styling spans with semantic tags
    const styleMap: { [key:string]: string } = {
        'tex-font-style-bf': 'strong',
        'tex-font-style-it': 'em',
        'tex-font-style-tt': 'code',
    };
    contentEl.querySelectorAll('span').forEach(span => {
        if (span.closest('pre')) return;
        for (const className in styleMap) {
            if (span.classList.contains(className)) {
                const newTag = document.createElement(styleMap[className]);
                while (span.firstChild) newTag.appendChild(span.firstChild);
                span.parentNode?.replaceChild(newTag, span);
                break; 
            }
        }
    });
    
    // Merge adjacent block elements (<p>, <div>) that are part of the same paragraph.
    // This addresses the core issue of extra newlines from split paragraphs.
    const blocks = Array.from(contentEl.children);
    for (let i = 0; i < blocks.length - 1; i++) {
        const current = blocks[i];
        const next = blocks[i+1];

        // Only consider merging <p> and <div> tags that are direct siblings
        if (!['P', 'DIV'].includes(current.tagName) || current.nextElementSibling !== next) {
            continue;
        }
        if (!['P', 'DIV'].includes(next.tagName)) {
            continue;
        }
        
        // Skip anything inside a sample test container.
        if (current.closest('.sample-test') || next.closest('.sample-test')) {
            continue;
        }

        const currentText = current.textContent?.trim() || '';
        const nextText = next.textContent?.trim() || '';

        if (!currentText || !nextText) continue;

        // Refined rule: merge if the current line doesn't end with a sentence terminator.
        if (currentText.endsWith('.') || currentText.endsWith('?')) {
            continue;
        }
        
        if (isHeadingLike(currentText)) {
            continue; // Looks like a heading.
        }
        
        const nextStartsWithCapital = /^[A-Z0-9]/.test(nextText);
        const currentEndsWithColon = currentText.endsWith(':');

        // Merge if the current line ends with a colon, or if it doesn't end
        // with punctuation and the next line doesn't start a new sentence.
        if (currentEndsWithColon || !nextStartsWithCapital) {
            current.append(' '); // Add a space
            while (next.firstChild) {
                current.appendChild(next.firstChild);
            }
            next.remove();
            
            // Re-evaluate the current element against its new sibling.
            blocks.splice(i + 1, 1);
            i--;
        }
    }

    // Clean up <br> tags used for spacing, which also cause unwanted newlines.
    contentEl.querySelectorAll('br').forEach(br => {
        if (br.closest('pre')) return;
        br.parentNode?.replaceChild(document.createTextNode(' '), br);
    });
    
    // Remove empty paragraphs that might have been created
    contentEl.querySelectorAll('p, div').forEach(el => {
        if (!el.textContent?.trim() && !el.querySelector('img')) {
            el.remove();
        }
    });
};


export const fetchProblems = async (): Promise<Problem[]> => {
  try {
    // Note: The Codeforces API supports CORS, so no proxy is needed here.
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data: CodeforcesResponse = await response.json();
    if (data.status !== 'OK') {
      throw new Error('Codeforces API returned an error');
    }
    // Filter out problems without a rating and sort by latest (higher contestId first)
    return data.result.problems
      .filter(p => p.rating)
      .sort((a, b) => b.contestId - a.contestId);
  } catch (error) {
    console.error('Failed to fetch problems from Codeforces:', error);
    return []; // Return empty array on error
  }
};

const fetchWithTimeout = async (url: string, timeout = 15000): Promise<Response> => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

/**
 * Fixes relative URLs in a DOM element.
 * @param contentEl The DOM element to process.
 */
const fixRelativeUrls = (contentEl: Element): void => {
    contentEl.querySelectorAll('img, a').forEach(el => {
        const attribute = el.tagName.toLowerCase() === 'img' ? 'src' : 'href';
        const value = el.getAttribute(attribute);
        if (value && !value.startsWith('http') && !value.startsWith('#')) {
            el.setAttribute(attribute, `https://codeforces.com${value}`);
        }
    });
};


interface ProblemStatementPayload {
  problemHtml: string;
  tutorialUrl: string | null;
}

export const fetchProblemStatementHTML = async (contestId: number, index: string): Promise<ProblemStatementPayload | { error: string }> => {
  const problemUrl = `https://codeforces.com/problemset/problem/${contestId}/${index}`;
  try {
    const response = await fetchWithTimeout(`${CORS_PROXY}${encodeURIComponent(problemUrl)}`);
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }
    const html = await response.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const problemStatementNode = doc.querySelector('.problem-statement, .problem-material');

    if (!problemStatementNode) {
      throw new Error('Could not find problem statement in the fetched HTML.');
    }
    
    fixRelativeUrls(problemStatementNode);

    // Reformat sample test cases from divs to plain text for correct <pre> tag rendering
    problemStatementNode.querySelectorAll('.sample-test pre').forEach(pre => {
        if (pre.querySelector('.test-example-line')) {
            const textContent = Array.from(pre.querySelectorAll('.test-example-line'))
                                     .map(line => line.textContent)
                                     .join('\n');
            pre.innerHTML = ''; // Clear original content (the divs)
            pre.textContent = textContent;
        }
    });
    
    // Clean the HTML using local DOM manipulation
    cleanCodeforcesHtml(problemStatementNode);
    const cleanedHtml = problemStatementNode.innerHTML;

    const allLinks = Array.from(doc.querySelectorAll('a'));
    const tutorialLink = allLinks.find(a => 
      (a.textContent || '').trim().toLowerCase().startsWith('tutorial') && 
      (a.getAttribute('href') || '').includes('/blog/entry/')
    );

    const tutorialUrl = tutorialLink ? `https://codeforces.com${tutorialLink.getAttribute('href')}` : null;

    return {
      problemHtml: cleanedHtml,
      tutorialUrl: tutorialUrl,
    };
  } catch (error: any) {
    let errorMessage = `Error fetching problem statement. The original problem can be viewed <a href="${problemUrl}" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:underline">here</a>.`;
    if (error.name === 'AbortError') {
      errorMessage = `<p>Fetching the problem statement timed out after 15 seconds. Please try again.</p>${errorMessage}`;
    } else if (error instanceof Error && error.message.includes('find problem statement')) {
        errorMessage = `<p>Successfully fetched the page, but failed to parse the problem statement. The page structure might have changed.</p>${errorMessage}`;
    } else if (error instanceof Error) {
        errorMessage = `<p>An error occurred: ${error.message}.</p>${errorMessage}`;
    }
    return { error: errorMessage };
  }
};

interface EditorialPayload {
  solution: string;
  code: {
    content: string;
    language: 'cpp' | 'python' | 'text';
  };
}

export const fetchEditorial = async (tutorialUrl: string, contestId: number, problemId: string): Promise<EditorialPayload | { error: string }> => {
    try {
        const response = await fetchWithTimeout(`${CORS_PROXY}${encodeURIComponent(tutorialUrl)}`);
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        const html = await response.text();

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const editorialNode = doc.querySelector('.ttypography');

        if (!editorialNode) {
            throw new Error('Could not find editorial content (.ttypography) in the fetched HTML.');
        }

        const problemLinks = Array.from(editorialNode.querySelectorAll('a'));
        
        const problemAnchor = problemLinks.find(a => {
            const text = (a.textContent || '').trim();
            const href = (a.getAttribute('href') || '');

            // Priority 1: Href attribute is the most reliable identifier
            if (href.includes(`/contest/${contestId}/problem/${problemId}`) || href.endsWith(`/problem/${problemId}`)) {
                return true;
            }

            // Priority 2: Text matches common Codeforces patterns
            const fullProblemId = `${contestId}${problemId}`;
            const textPatterns = [
                `^${fullProblemId}`,             // e.g., "1234C"
                `^${problemId}[\\s.:-]`,         // e.g., "C.", "C:", "C -"
                `^${problemId}$`,                // e.g., "C"
                `^Problem\\s+${problemId}\\b`    // e.g., "Problem C"
            ];
            const regex = new RegExp(textPatterns.join('|'), 'i');
            
            if (regex.test(text)) {
                return true;
            }
            
            return false;
        });

        if (!problemAnchor) {
            throw new Error(`Could not find a section for problem ${problemId} in the editorial.`);
        }

        const solutionParts: Element[] = [];
        const foundCodes: { title: string, content: string, language: 'cpp' | 'python' }[] = [];
        
        let startNode = problemAnchor.closest('p, h1, h2, h3, h4, h5, h6');
        let currentNode = startNode ? startNode.nextElementSibling : null;

        let parsingState: 'solution' | 'code' = 'solution';

        while (currentNode) {
            // Stop if we encounter a heading for a different problem or a horizontal rule.
            const potentialHeaderLink = currentNode.querySelector('a');
            if (potentialHeaderLink) {
                const href = potentialHeaderLink.getAttribute('href') || '';
                const isProblemLink = href.includes('/contest/') && href.includes('/problem/');
                const isCurrentProblemLink = href.includes(`/contest/${contestId}/problem/${problemId}`);
                
                // This heuristic assumes that a link to another problem in a top-level element marks a new section.
                if (isProblemLink && !isCurrentProblemLink) {
                    const parentText = (currentNode.textContent || '').trim();
                    const linkText = (potentialHeaderLink.textContent || '').trim();
                    if (parentText.startsWith(linkText)) {
                        break;
                    }
                }
            }
            
            if (currentNode.tagName.toLowerCase() === 'hr') {
                break;
            }

            // Determine if the current node is a code spoiler
            let isCodeNode = false;
            let codeInfo = null;

            if (currentNode.classList.contains('spoiler')) {
                const titleEl = currentNode.querySelector('.spoiler-title');
                const contentEl = currentNode.querySelector('.spoiler-content');
                const preTag = contentEl?.querySelector('pre');

                if (titleEl && contentEl && preTag) {
                    const titleText = (titleEl.textContent || '').toLowerCase().trim();
                    const isCpp = titleText.includes('c++') || titleText.includes('cpp');
                    const isPython = titleText.includes('python');
                    const isSolutionCode = /^solution\s*\d*$/.test(titleText);
                    const isGenericCode = titleText.includes('code');

                    if (isCpp || isPython || isSolutionCode || isGenericCode) {
                        isCodeNode = true;
                        const codeContent = preTag.textContent || '';
                        const language = isCpp ? 'cpp' : isPython ? 'python' : 'cpp';
                        codeInfo = {
                            title: titleEl.textContent || 'Code',
                            content: codeContent,
                            language: language,
                        };
                    }
                }
            }

            // If we find a code node for the first time, switch state
            if (isCodeNode && parsingState === 'solution') {
                parsingState = 'code';
            }

            // Process based on state
            if (parsingState === 'solution') {
                // In solution state, append everything to solutionParts
                if (currentNode.classList.contains('spoiler')) {
                    const titleEl = currentNode.querySelector('.spoiler-title');
                    const contentEl = currentNode.querySelector('.spoiler-content');
                    if(titleEl && contentEl) {
                        const details = document.createElement('details');
                        details.open = true;
                        details.classList.add('editorial-spoiler');
                        
                        const summary = document.createElement('summary');
                        summary.textContent = titleEl.textContent;
                        details.appendChild(summary);

                        const contentWrapper = document.createElement('div');
                        contentWrapper.className = 'spoiler-content-wrapper';
                        
                        let contentSourceEl = contentEl;
                        // Handle cases where content is wrapped in another .ttypography div
                        const nestedTypography = contentEl.querySelector('.ttypography');
                        if (nestedTypography) {
                           contentSourceEl = nestedTypography;
                        }

                        // More robustly copy the content instead of moving nodes
                        contentWrapper.innerHTML = contentSourceEl.innerHTML;
                        
                        details.appendChild(contentWrapper);
                        solutionParts.push(details);
                    }
                } else {
                    solutionParts.push(currentNode);
                }
            } 
            
            if (isCodeNode && codeInfo) {
                // If the node is code, always add it to foundCodes,
                // regardless of whether we just switched state or were already in code state.
                foundCodes.push(codeInfo);
            }
            
            currentNode = currentNode.nextElementSibling;
        }

        const solutionContainer = document.createElement('div');
        solutionParts.forEach(part => solutionContainer.appendChild(part.cloneNode(true)));
        
        fixRelativeUrls(solutionContainer);

        // Apply cleaning to the main container AND to the content of each spoiler
        cleanCodeforcesHtml(solutionContainer);
        solutionContainer.querySelectorAll('.editorial-spoiler .spoiler-content-wrapper').forEach(spoilerContent => {
            cleanCodeforcesHtml(spoilerContent);
        });

        let finalSolution = solutionContainer.innerHTML;

        if (!finalSolution.trim()) {
          finalSolution = `<p>Could not automatically parse the solution text for problem <b>${problemId}</b>. The editorial might use a non-standard format.</p>`;
        }
        
        let finalCode: EditorialPayload['code'] = { content: `// Could not find code for problem ${problemId}.`, language: 'text' };

        if (foundCodes.length > 0) {
            const finalCodeContent = foundCodes.map(c => 
                `// Source: ${c.title}\n\n${c.content.trim()}`
            ).join('\n\n// --- End of Code Block ---\n\n');
            
            const finalCodeLanguage = foundCodes.some(c => c.language === 'cpp') ? 'cpp' : foundCodes[0].language;

            finalCode = { content: finalCodeContent, language: finalCodeLanguage };
        }

        return { solution: finalSolution, code: finalCode };
    } catch (error) {
        const message = `Failed to fetch or parse the editorial for ${problemId}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error('Failed to fetch editorial:', error);
        return { error: message };
    }
};

/**
 * Fetches the full content (problem statement, solution, code) for a given problem.
 * This function is for viewing content online and does not save it for offline use.
 */
export const fetchProblemContent = async (contestId: number, index: string): Promise<Content | { error: string }> => {
    try {
        const statementPayload = await fetchProblemStatementHTML(contestId, index);
        if ('error' in statementPayload) {
            return { error: statementPayload.error };
        }
        
        const { problemHtml, tutorialUrl } = statementPayload;

        let solutionContent = '<p>No official editorial link found on the problem page.</p>';
        let codeContent: Content['Code'] = { content: '// No official editorial found.', language: 'text' };

        if (tutorialUrl) {
            const editorialPayload = await fetchEditorial(tutorialUrl, contestId, index);
            if ('error' in editorialPayload) {
                solutionContent = `<p>Failed to load editorial: ${editorialPayload.error}</p>`;
            } else {
                solutionContent = editorialPayload.solution;
                codeContent = editorialPayload.code;
            }
        }

        const content: Content = {
            Problem: problemHtml,
            Solution: solutionContent,
            Code: codeContent,
        };

        return content;
    } catch (error: any) {
        const message = `An unexpected error occurred while fetching problem content: ${error.message || 'Unknown error'}`;
        console.error(message, error);
        return { error: message };
    }
};
