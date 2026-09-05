import markdownit from 'markdown-it';
import { full as emoji } from 'markdown-it-emoji';
import { RenderPlugin } from '@11ty/eleventy';
import fs from 'node:fs'; import path from 'node:path';

const src = "_src";
const paths = ["css", "js", "assets", "*.md"];

export default async function(eleventyConfig) {
// CONFIG :3

paths.forEach(path => {
    // This automatically copies each path in "paths"
    // (and auto-watches with --serve)
    eleventyConfig.addPassthroughCopy(`./${src}/${path}`);
});



const emoji = {
    path: `./${src}/assets/emojis`,
    defs: {}
};

if (fs.existsSync(emoji.path)) {
    fs.readdirSync(emoji.path).forEach(file => {
        if (file.match(/\.(png|jpg|jpeg|gif|webp|svg)$/i)) {
            const ogName = path.parse(file).name;
            const name = ogName.toLowerCase();
            emoji.defs[name] = `
            <img class="emote"
            src="/assets/emojis/${file}"
            alt="${name}" title="${name}"
            loading="lazy">
            `;
        }
    })
};

eleventyConfig.addTransform("emojis", function(content) {
    if (this.page.outputPath && this.page.outputPath.endsWith(".html")) {
        return content.replace(/:=([a-zA-Z0-9_-]+):/g, (match, name) => {
            const query = name.toLowerCase();
            if (emoji.defs[query]) {
                return emoji.defs[query];
            } else {
                return match;
            }
        });
    }
    return content;
});

eleventyConfig.addPlugin(RenderPlugin, {tagNameFile: "renderFile"});
    
    return {
        dir: {
            input: src,
            output: "__public",
            includes: "_includes/",
            layouts: "_layouts",
            data: "../_data"
        }
    }
};

// this is a javascript file.
// code below is incase i try typescript again.
// eleventyConfig.addTemplateFormats("11ty.ts")

// eleventyConfig.addExtension("ts", {
//     outputFileExtension: "js",
//     compile: async function (inputContent: string, inputPath: string) {
//         return async () => {
//             const result = await esbuild.build({
//                 entryPoints: [inputPath],
//                 bundle: true,
//                 write: false,
//                 // minify: process.env.NODE_ENV === "production",
//                 target: "es2020",
//             });
//             return result.outputFiles[0].text;
//         };
//     },
// });