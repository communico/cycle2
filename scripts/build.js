#!/usr/bin/env node
'use strict';

const fs = require('fs/promises');
const path = require('path');
const { minify } = require('terser');

const rootDir = path.resolve(__dirname, '..');
const srcDir = path.join(rootDir, 'src');
const buildDir = path.join(rootDir, 'build');
const pkg = require(path.join(rootDir, 'package.json'));

const now = new Date();
const pad = (n) => String(n).padStart(2, '0');
const dateStamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
const mainBanner = `/*!\n* jQuery Cycle2; version: ${pkg.version} build: ${dateStamp}\n* http://jquery.malsup.com/cycle2/\n* Copyright (c) ${now.getFullYear()} M. Alsup; Dual licensed: MIT/GPL\n*/`;
const pluginBanner = `/* Plugin for Cycle2; Copyright (c) 2012 M. Alsup; v${dateStamp} */`;
const tcycleBanner = `/* tCycle; (c) 2012 M. Alsup; MIT/GPL; v${dateStamp} */`;

const mainSources = [
  'jquery.cycle2.core.js',
  'jquery.cycle2.autoheight.js',
  'jquery.cycle2.caption.js',
  'jquery.cycle2.command.js',
  'jquery.cycle2.hash.js',
  'jquery.cycle2.loader.js',
  'jquery.cycle2.pager.js',
  'jquery.cycle2.prevnext.js',
  'jquery.cycle2.progressive.js',
  'jquery.cycle2.tmpl.js'
];

const pluginTargets = [
  { src: 'jquery.cycle2.core.js', dest: ['core', 'jquery.cycle2.core.min.js'], banner: mainBanner },
  { src: 'jquery.cycle2.autoheight.js', dest: ['core', 'jquery.cycle2.autoheight.min.js'], banner: pluginBanner },
  { src: 'jquery.cycle2.caption.js', dest: ['core', 'jquery.cycle2.caption.min.js'], banner: pluginBanner },
  { src: 'jquery.cycle2.command.js', dest: ['core', 'jquery.cycle2.command.min.js'], banner: pluginBanner },
  { src: 'jquery.cycle2.hash.js', dest: ['core', 'jquery.cycle2.hash.min.js'], banner: pluginBanner },
  { src: 'jquery.cycle2.loader.js', dest: ['core', 'jquery.cycle2.loader.min.js'], banner: pluginBanner },
  { src: 'jquery.cycle2.pager.js', dest: ['core', 'jquery.cycle2.pager.min.js'], banner: pluginBanner },
  { src: 'jquery.cycle2.prevnext.js', dest: ['core', 'jquery.cycle2.prevnext.min.js'], banner: pluginBanner },
  { src: 'jquery.cycle2.progressive.js', dest: ['core', 'jquery.cycle2.progressive.min.js'], banner: pluginBanner },
  { src: 'jquery.cycle2.tmpl.js', dest: ['core', 'jquery.cycle2.tmpl.min.js'], banner: pluginBanner },
  { src: 'jquery.cycle2.caption2.js', dest: ['plugin', 'jquery.cycle2.caption2.min.js'], banner: pluginBanner },
  { src: 'jquery.cycle2.carousel.js', dest: ['plugin', 'jquery.cycle2.carousel.min.js'], banner: pluginBanner },
  { src: 'jquery.cycle2.center.js', dest: ['plugin', 'jquery.cycle2.center.min.js'], banner: pluginBanner },
  { src: 'jquery.cycle2.flip.js', dest: ['plugin', 'jquery.cycle2.flip.min.js'], banner: pluginBanner },
  { src: 'jquery.cycle2.ie-fade.js', dest: ['plugin', 'jquery.cycle2.ie-fade.min.js'], banner: pluginBanner },
  { src: 'jquery.cycle2.scrollVert.js', dest: ['plugin', 'jquery.cycle2.scrollVert.min.js'], banner: pluginBanner },
  { src: 'jquery.cycle2.shuffle.js', dest: ['plugin', 'jquery.cycle2.shuffle.min.js'], banner: pluginBanner },
  { src: 'jquery.cycle2.swipe.js', dest: ['plugin', 'jquery.cycle2.swipe.min.js'], banner: pluginBanner },
  { src: 'jquery.cycle2.tile.js', dest: ['plugin', 'jquery.cycle2.tile.min.js'], banner: pluginBanner },
  { src: 'jquery.cycle2.video.js', dest: ['plugin', 'jquery.cycle2.video.min.js'], banner: pluginBanner },
  { src: 'jquery.tcycle.js', dest: ['tcycle', 'jquery.tcycle.min.js'], banner: tcycleBanner }
];

const terserBaseOptions = {
  ecma: 5,
  compress: true,
  mangle: true,
  toplevel: false
};

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function buildMainBundle() {
  const sourceContents = await Promise.all(
    mainSources.map((file) => fs.readFile(path.join(srcDir, file), 'utf8'))
  );
  const mainBody = sourceContents.join('\n');
  const bundle = `${mainBanner}\n\n${mainBody}`;

  await ensureDir(buildDir);
  await fs.writeFile(path.join(buildDir, 'jquery.cycle2.js'), bundle, 'utf8');

  const terserInput = Object.fromEntries(
    mainSources.map((file, index) => [`src/${file}`, sourceContents[index]])
  );

  const minified = await minify(terserInput, {
    ...terserBaseOptions,
    format: {
      preamble: mainBanner,
      comments: /^!/i
    },
    sourceMap: {
      filename: 'jquery.cycle2.min.js',
      url: 'jquery.cycle2.js.map',
      root: 'http://malsup.github.io/'
    }
  });

  if (!minified.code || !minified.map) {
    throw new Error('Failed to generate minified main bundle.');
  }

  await fs.writeFile(path.join(buildDir, 'jquery.cycle2.min.js'), minified.code, 'utf8');
  await fs.writeFile(path.join(buildDir, 'jquery.cycle2.js.map'), minified.map, 'utf8');
}

async function buildIndividualPlugins() {
  for (const target of pluginTargets) {
    const sourcePath = path.join(srcDir, target.src);
    const destinationDir = path.join(buildDir, target.dest[0]);
    const destinationPath = path.join(destinationDir, target.dest[1]);

    await ensureDir(destinationDir);
    const sourceCode = await fs.readFile(sourcePath, 'utf8');
    const result = await minify(sourceCode, {
      ...terserBaseOptions,
      format: {
        preamble: target.banner
      }
    });

    if (!result.code) {
      throw new Error(`Failed to minify ${target.src}`);
    }

    await fs.writeFile(destinationPath, result.code, 'utf8');
  }
}

async function run() {
  await buildMainBundle();
  await buildIndividualPlugins();
  console.log('Build complete.');
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
