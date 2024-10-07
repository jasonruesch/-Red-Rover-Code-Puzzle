export type Item = string | Record<string, Item[]>;

/**
 * Parse the input string into an array of items.
 * @param input The input string to parse.
 * @returns The array of items.
 */
export function parseInput(input: string): Item[] {
  let items: Item[] = [];
  let buffer = ''; // Buffer to collect characters for the current item or nested structure
  let depth = 0; // Track the depth of nested parentheses

  for (const char of input) {
    if (char === '(') {
      // Opening parenthesis indicates entering a new nested structure
      buffer = buffer.trim(); // Trim leading/trailing whitespace from the buffer
      // If depth is 0 and buffer has content, it means we are starting a nested structure for the current item
      if (depth === 0 && buffer) {
        items.push({ [buffer]: [] });
        buffer = ''; // Clear buffer to prepare for nested content
      }
      buffer += char; // Add the parenthesis to the buffer
      depth++; // Increase depth to indicate entering a nested structure
    } else if (char === ')') {
      // Closing parenthesis indicates exiting a nested structure
      depth--; // Decrease depth as we exit the nested structure
      buffer += char; // Add the closing parenthesis to the buffer

      // If depth is 0, we have exited a complete nested structure
      if (depth === 0) {
        buffer = buffer.trim();
        // Parse the content inside parentheses recursively
        const children = parseInput(buffer.slice(1, -1)); // Remove the outermost parentheses of the buffer and parse recursively
        const lastItem = items[items.length - 1] as Record<string, Item[]>;
        if (lastItem) {
          // If there is a last parent item, add the children to it
          const key = Object.keys(lastItem)[0];
          lastItem[key] = children;
        } else {
          // If there is no last parent item, add the children as top-level items
          items = children;
        }
        buffer = ''; // Clear buffer for the next sibling item
      }
    } else if (char === ',' && depth === 0) {
      buffer = buffer.trim();
      // Comma outside of any nested structure indicates the separation of sibling items
      if (buffer) {
        items.push(buffer); // Add the buffered item to the array
      }
      buffer = ''; // Clear buffer for the next item
    } else {
      // Collect all other characters into the buffer
      buffer += char;
    }
  }

  buffer = buffer.trim();
  // If buffer has remaining content after parsing, push it as the last item
  if (buffer) {
    items.push(buffer);
  }

  return items; // Return the array of parsed items
}

/**
 * Sort the items alphabetically.
 * @param items The array of items to sort.
 */
export function sortItems(items: Item[]): void {
  // Sort the items in-place using a custom comparator function.
  const alphabetically = (a: Item, b: Item) => {
    const aKey = typeof a === 'string' ? a : Object.keys(a)[0];
    const bKey = typeof b === 'string' ? b : Object.keys(b)[0];
    return aKey.localeCompare(bKey);
  };
  items.sort(alphabetically);

  // Iterate through each item in the sorted array.
  for (const item of items) {
    // Check if the current item is an object (i.e., has nested children).
    if (typeof item === 'object') {
      const children = Object.values(item)[0];
      sortItems(children);
    }
  }
}

/**
 * Print the items in hierarchical format.
 * @param items The array of items to print.
 * @param indent The indentation level.
 */
export function printItems(items: Item[], indent = 0): void {
  // Create an indentation string based on the current depth level (`indent`).
  // Each level of indentation is represented by two spaces.
  const indentation = '  '.repeat(indent);

  for (const item of items) {
    if (typeof item === 'string') {
      // If the item is a string, it's a leaf node (no children).
      console.log(`${indentation}- ${item}`);
    } else if (typeof item === 'object') {
      // If the item is an object, it represents a parent node with children.
      const [key, children] = Object.entries(item)[0];
      console.log(`${indentation}- ${key}`);

      // Recursively call `printItems` to print the children of this node.
      // Increase the `indent` level by 1 to indicate a deeper level of nesting.
      printItems(children, indent + 1);
    }
  }
}

// Usage example:

// Input string
const input =
  '(id, name, email, type(id, name, customFields(c1, c2, c3)), externalId)';

// Parse the input string
const items = parseInput(input);

// Display the parsed items
console.log('\nRaw items array:\n');
console.log(JSON.stringify(items, null, 2));

// Display the items in hierarchical format
console.log('\nItems hierarchy:\n');
printItems(items);

// Sort alphabetically and display the items in hierarchical format
console.log('\nSorted items hierarchy:\n');
sortItems(items);
printItems(items);
