// Script to update common color patterns to Lakshya theme
import fs from 'fs';
import path from 'path';

// Color mappings from old indigo theme to new Lakshya theme
const colorMappings = [
  // Button colors
  { from: 'bg-indigo-600 hover:bg-indigo-700', to: 'bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700' },
  { from: 'bg-indigo-600', to: 'bg-primary-600' },
  { from: 'hover:bg-indigo-700', to: 'hover:bg-primary-700' },
  
  // Text colors
  { from: 'text-indigo-600', to: 'text-primary-600' },
  { from: 'text-indigo-700', to: 'text-primary-700' },
  { from: 'text-indigo-900', to: 'text-primary-900' },
  { from: 'hover:text-indigo-900', to: 'hover:text-primary-900' },
  { from: 'hover:text-indigo-500', to: 'hover:text-primary-500' },
  
  // Border colors
  { from: 'border-indigo-300', to: 'border-primary-300' },
  { from: 'border-indigo-500', to: 'border-primary-500' },
  
  // Focus ring colors
  { from: 'focus:ring-indigo-500', to: 'focus:ring-primary-500' },
  { from: 'focus:border-indigo-500', to: 'focus:border-primary-500' },
  { from: 'focus:ring-offset-2 focus:ring-indigo-500', to: 'focus:ring-offset-2 focus:ring-primary-500' },
  
  // Background colors
  { from: 'bg-indigo-50', to: 'bg-primary-50' },
  { from: 'bg-indigo-100', to: 'bg-primary-100' },
  { from: 'hover:bg-indigo-200', to: 'hover:bg-primary-200' },
  
  // Gray backgrounds to gradient cards
  { from: 'bg-gray-50', to: 'bg-gradient-subtle' },
  { from: 'bg-white shadow', to: 'bg-gradient-card border border-primary-200 shadow-lg' },
  
  // Update rounded corners for modern look
  { from: 'rounded-md', to: 'rounded-lg' },
  { from: 'sm:rounded-md', to: 'rounded-xl' },
];

function updateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;
    
    colorMappings.forEach(mapping => {
      const regex = new RegExp(mapping.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      if (content.includes(mapping.from)) {
        content = content.replace(regex, mapping.to);
        hasChanges = true;
      }
    });
    
    if (hasChanges) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error updating ${filePath}:`, error.message);
  }
}

function walkDirectory(dirPath) {
  const items = fs.readdirSync(dirPath);
  
  items.forEach(item => {
    const itemPath = path.join(dirPath, item);
    const stat = fs.statSync(itemPath);
    
    if (stat.isDirectory() && item !== 'node_modules' && item !== '.git') {
      walkDirectory(itemPath);
    } else if (stat.isFile() && (item.endsWith('.jsx') || item.endsWith('.js')) && !item.endsWith('.config.js')) {
      updateFile(itemPath);
    }
  });
}

console.log('Starting Lakshya theme color update...');
walkDirectory('./src');
console.log('Theme update completed!');
