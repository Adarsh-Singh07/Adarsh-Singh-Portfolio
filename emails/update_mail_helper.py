import sys

with open('../backend/mail_helper.py', 'r', encoding='utf-8') as f:
    content = f.read()

import re

# Find the html_visitor block
# It starts with 'html_visitor = f"""' or 'html_visitor = """' and ends with '"""'
start_idx = content.find('    html_visitor = f\"\"\"')
if start_idx == -1:
    start_idx = content.find('    html_visitor = \"\"\"')

end_idx = content.find('\"\"\"', start_idx + 25) + 3

with open('rendered_email.html', 'r', encoding='utf-8') as f:
    html_content = f.read()

new_html_visitor = '    html_visitor = \"\"\"\\n' + html_content + '\\n    \"\"\".replace(\"{escaped_name}\", escaped_name).replace(\"{escaped_subject}\", escaped_subject).replace(\"{escaped_message}\", escaped_message)'

new_content = content[:start_idx] + new_html_visitor + content[end_idx:]

with open('../backend/mail_helper.py', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Updated mail_helper.py successfully")
