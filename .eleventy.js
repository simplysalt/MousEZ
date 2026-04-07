import { RenderPlugin } from "@11ty/eleventy";

const src = "_src";
const paths = ["css", "js", "assets"];

export default async function(eleventyConfig) {
    paths.forEach(path => {
        eleventyConfig.addPassthroughCopy(`./${src}/${path}`);
    });

eleventyConfig.addPlugin(RenderPlugin, {tagNameFile: "renderFile"}); // Change the renderFile shortcode name

    return {
    dir: {
    input: src,
    output: "_public",
    includes: "_includes",
    layouts: "_layouts"
    }}; // Configure Eleventy build and access paths

};