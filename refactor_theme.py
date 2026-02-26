import os
import re

directory = 'app'

# Find all tsx files
tsx_files = []
for root, dirs, files in os.walk(directory):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            tsx_files.append(os.path.join(root, file))

for filepath in tsx_files:
    with open(filepath, 'r') as f:
        content = f.read()

    # Skip files that don't use Colors or are already refactored
    if 'Colors.' not in content and 'Colors[' not in content:
        continue

    # Add useColorScheme import if missing
    if "useColorScheme" not in content and "react-native" in content:
        content = re.sub(r'import {([^}]+)} from "react-native";\n', r'import {\1, useColorScheme } from "react-native";\n', content)
        if "useColorScheme" not in content:
            content = 'import { useColorScheme } from "react-native";\n' + content

    # Replace StyleSheet.create
    if "const styles = StyleSheet.create({" in content:
        content = content.replace("const styles = StyleSheet.create({", "const createStyles = (theme: any) => StyleSheet.create({")
        
        # Now find the main component and insert usage
        # This regex looks for `export default function Name() {`
        # and inserts the theme logic.
        
        lines = content.split('\n')
        new_lines = []
        for line in lines:
            if re.match(r'^export default function \w+\(.*\) \{', line):
                new_lines.append(line)
                new_lines.append('  const colorScheme = useColorScheme() ?? "light";')
                new_lines.append('  const theme = Colors[colorScheme];')
                new_lines.append('  const styles = createStyles(theme);')
            else:
                new_lines.append(line)
        content = '\n'.join(new_lines)

    # Replace Colors.xxx with theme.xxx ONLY inside the styles block or component body
    # Actually, if we just replace `Colors.` with `theme.` globally, it breaks the `theme = Colors[colorScheme]` line.
    # So let's replace `Colors.` with `theme.` except in the import and theme assignment.
    
    # regex replace Colors.xxx -> theme.xxx
    # but don't touch imports or `Colors[`
    # We can do negative lookbehind/lookahead, or just simple split string logic.
    new_content = ""
    target_lines = content.split('\n')
    for i, line in enumerate(target_lines):
        if "import " in line and "Colors" in line:
            new_content += line + "\n"
            continue
        if "const theme =" in line:
            new_content += line + "\n"
            continue
        # Also need to replace Colors inside any global constants, like STATUS_CONFIG.
        # If STATUS_CONFIG is outside the component, it won't have access to `theme`.
        # So we have to turn STATUS_CONFIG into a React hook or move it inside the component.
        # This script might get too complex. Let's do it manually on the key files.
        new_content += line + "\n"
        
    # Write back
    # f.write(new_content)
