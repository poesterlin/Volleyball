// @ts-check

require('svelte/register');

const { renderMail } = require('svelte-mail');
const { readdir } = require("fs/promises");
const { join, sep } = require('path');

const AWS = require("aws-sdk");
AWS.config.update({ region: 'eu-central-1' });

const dir = "./templates";
const data = { user: "{{user}}" }

async function compute() {
    const ses = new AWS.SES({ apiVersion: '2010-12-01' });

    const existing = (await ses.listTemplates().promise()).TemplatesMetadata.map(t => t.Name);

    const templates = await readdir(dir);

    for (const template of templates) {
        console.log("compiling", join(dir, template))
        const component = require("." + sep + join(dir, template));
        const { html, text } = await renderMail(component.default, { data });

        const params = {
            TemplateName: template.replace(".svelte", ""),
            SubjectPart: "{{subject}}",
            HtmlPart: html,
            TextPart: text
        }

        if (existing.includes(params.TemplateName)) {
            await ses.updateTemplate({ Template: params }).promise();
        } else {
            await ses.createTemplate({ Template: params }).promise();
        }
    }
}

compute();