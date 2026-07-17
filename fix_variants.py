import os
import glob

files = glob.glob('frontend/src/**/*.tsx', recursive=True)
for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    new_content = content.replace('ease: [0.16, 1, 0.3, 1]', 'ease: [0.16, 1, 0.3, 1] as any')
    new_content = new_content.replace("type: 'spring'", "type: 'spring' as any")
    
    if new_content != content:
        with open(f, 'w', encoding='utf-8') as file:
            file.write(new_content)
        print(f"Updated {f}")
