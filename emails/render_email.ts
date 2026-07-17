import { render } from '@react-email/render';
import { ContactAutoReplyEmail } from './ContactAutoReplyEmail';
import * as fs from 'fs';
import * as React from 'react';

async function main() {
  const html = await render(React.createElement(ContactAutoReplyEmail, { 
    name: '{escaped_name}', 
    subject: '{escaped_subject}', 
    message: '{escaped_message}' 
  }));

  fs.writeFileSync('rendered_email.html', html);
  console.log('Email rendered to rendered_email.html');
}

main().catch(console.error);
