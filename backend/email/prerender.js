// @ts-check

require('svelte/register');

const { renderMail } = require('svelte-mail');
const { readdir, readFile } = require("fs/promises");
const { join, sep } = require('path');
const { Axios } = require("axios");

const dir = "./templates";
const data = {
    subject: "a spot opened up!",
    name: "{{name}}",
    key: "{{key}}",
    course: "{{course}}",
    time: "{{time}}",
    date: "{{date}}",
}

/**
 * @param {Axios} axios
 * @param {any} template
 * @param {boolean} update
 */
async function templateHandler(axios, template, update) {
    const { statusText, data: json } = await axios.request({ method: update ? "PUT" : "POST", url: "/api/v1/email_template", data: JSON.stringify(template) })
    const { data } = JSON.parse(json);
    console.log(data.id)
}


async function compute() {
    const { key } = JSON.parse((await readFile("./config.json")).toString());
    const axios = new Axios({
        baseURL: "https://app.jetsend.com",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "X-API-KEY": key,
            Authorization: "Bearer " + key
        }
    });

    const { data: res } = await axios.get("/api/v1/email_templates");
    const existing = JSON.parse(res).data?.map(e => e.name) ?? [];

    const templates = await readdir(dir);

    for (const template of templates) {
        console.log("compiling", join(dir, template))
        const component = require("." + sep + join(dir, template));
        const { html, text } = await renderMail(component.default, { data });

        const params = {
            name: template,
            email_template: {
                name: template,
                html,
                text,
                subject: "{{subject}}",
                from_name: "Volleyball Registration Service",
                from_email: "volleyball@oesterlin.dev",
            }
        }
        await templateHandler(axios, params, existing && existing.includes(params.name));
    }
}

compute();