import os
import re

directory = 'app'

tsx_files = []
for root, dirs, files in os.walk(directory):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            tsx_files.append(os.path.join(root, file))

for filepath in tsx_files:
    with open(filepath, 'r') as f:
        content = f.read()

    # Only process if it uses Colors and we haven't already refactored it
    if 'Colors.' not in content:
        continue

    # 1. Ensure useColorScheme is imported
    if "useColorScheme" not in content and "react-native" in content:
        content = re.sub(r'import {([^}]+)} from "react-native";', r'import {\1, useColorScheme } from "react-native";', content)

    # 2. Extract StyleSheet.create to dynamic function if not already done
    if "const styles = StyleSheet.create({" in content:
        content = content.replace("const styles = StyleSheet.create({", "const createStyles = (theme: any) => StyleSheet.create({")
        
        # 3. Inside the React component, inject hook and theme
        lines = content.split('\n')
        new_lines = []
        in_component = False
        for line in lines:
            # Match Component Export
            if re.match(r'^export default function \w+\(.*\) \{', line) or re.match(r'^export function \w+\(.*\) \{', line):
                new_lines.append(line)
                new_lines.append('  const colorScheme = useColorScheme() ?? "light";')
                new_lines.append('  const theme = Colors[colorScheme];')
                new_lines.append('  const styles = createStyles(theme);')
                in_component = True
            elif in_component and "const styles = " in line:
                # remove old style declarations inside components if any
                pass
            else:
                new_lines.append(line)
        content = '\n'.join(new_lines)
    
    # 4. Replace Colors.xxx with theme.xxx everywhere EXCEPT imports, const theme =, and STATUS_CONFIG
    lines = content.split('\n')
    new_lines = []
    in_global_config = False
    
    for line in lines:
        if "import " in line and "Colors" in line:
            new_lines.append(line)
        elif "const theme =" in line:
            new_lines.append(line)
        elif "STATUS_CONFIG" in line:
            in_global_config = True
            new_lines.append(line)
        elif in_global_config and "};" in line:
            in_global_config = False
            new_lines.append(line)
        elif in_global_config:
            # Don't touch Colors inside global config, we'll refactor STATUS_CONFIG manually
            new_lines.append(line)
        else:
            # Replace Colors.xxx with theme.xxx
            # But only if it's not a type declaration like Colors['light']
            updated_line = re.sub(r'Colors\.(?!\b(light|dark)\b)', 'theme.', line)
            new_lines.append(updated_line)
            
    with open(filepath, 'w') as f:
        f.write('\n'.join(new_lines))

