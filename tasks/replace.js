/*
 * replace some content for js file
 * http://gruntjs.com/
 *
 * Copyright (c) 2018 renlong
 * Licensed under the MIT license.
 * https://github.com/coolKillers/grunt-replace-some-content
 */
'use strict';
module.exports = function (grunt) {
    var path = require('path');
    var fs = require('fs');
    var chalk = require('chalk');
    var fileSyncCmp = require('file-sync-cmp');
    var isWindows = process.platform === 'win32';
    grunt.registerMultiTask('replace', 'replace some content in js file', function() {
        var options = this.options({
            encoding: grunt.file.defaultEncoding
        });

        var detectDestType = function(dest) {
            if (grunt.util._.endsWith(dest, '/')) {
                return 'directory';
            } else {
                return 'file';
            }
        };

        var unixifyPath = function(filepath) {
            if (isWindows) {
                return filepath.replace(/\\/g, '/');
            } else {
                return filepath;
            }
        };

        var isExpandedPair;
        var dirs = {};
        var tally = {
            dirs: 0,
            files: 0
        };

        this.files.forEach(function(filePair) {
            isExpandedPair = filePair.orig.expand || false;
            filePair.src.forEach(function(src) {
                src = unixifyPath(src);
                var dest = unixifyPath(filePair.dest);
                if (detectDestType(dest) === 'directory') {
                    dest = isExpandedPair ? dest : path.join(dest, src);
                }
                if (grunt.file.isDir(src)) {
                    grunt.verbose.writeln('Creating ' + chalk.cyan(dest));
                    grunt.file.mkdir(dest);
                    tally.dirs++;
                } else {
                    grunt.verbose.writeln('Replacing ' + chalk.cyan(src) + ' -> ' + chalk.cyan(dest));
                    var contents = grunt.file.read(src);
                    if (filePair.reg) {
                        console.log(filePair.reg, filePair.replaceContent);
                        contents = contents.replace(filePair.reg, filePair.replaceContent);
                    }
                    if (grunt.file.isDir(dest)) {
                        var filename = path.basename(src);
                        dest = path.join(dest, filename);
                    }
                    console.log(dest);
                    grunt.file.write(dest, contents);
                    tally.files++;
                }
            });
        });

        if (tally.dirs) {
            grunt.log.write('Created ' + chalk.cyan(tally.dirs.toString()) + (tally.dirs === 1 ? ' directory' : ' directories'));
        }

        if (tally.files) {
            grunt.log.write((tally.dirs ? ', replace ' : 'replacing ') + chalk.cyan(tally.files.toString()) + (tally.files === 1 ? ' file' : ' files'));
        }

        grunt.log.writeln();
    });
};