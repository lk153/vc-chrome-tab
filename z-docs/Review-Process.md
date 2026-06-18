# Notable factors that increase review time

Reviews may take longer for extensions that request broad host permissions or sensitive execution permissions, or which include a lot of code or hard-to-review code.

### Broad host permissions
- Host permissions patterns like *://*/*, https://*/*, and <all_urls> give extensions extensive access to the user's web activity, especially when combined with other permissions. Extensions with this kind of access can collect a user's browsing history, hijack web search behavior, scrape data from banking websites, harvest credentials, or exploit users in other ways.
### Sensitive execution permissions
- Permissions grant extensions special data access and manipulation rights. Some permissions do this directly (for example, tabs and downloads) while others must be combined with host permissions grants (for example, cookies and webRequest). Review must verify that each requested permission is actually necessary and is used appropriately. Requesting powerful and potentially dangerous capabilities takes more time to review.
### Amount and formatting of code
- The more code an extension contains, the more work it takes to verify that code is safe. Obfuscation is disallowed as it increases the complexity of the validation process. Minification is allowed, but it can also make reviewing extension code more difficult. Where possible, consider submitting your code as authored. You may also want to consider structuring your code in a way that is easy for others to understand.