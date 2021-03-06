var path = require('path');

module.exports = function(grunt) {
	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		handlebars: {
			compile: {
				options: {
					namespace: false,
					commonjs: true,
					processName: function(filename) {
						return filename.replace('app/templates/', '').replace('.hbs', '');
					}
				},
				src: "app/templates/**/*.hbs",
				dest: "app/templates/compiledTemplates.js",
				filter: function(filepath) {
					var filename = path.basename(filepath);
					// Exclude files that begin with '__' from being sent to the client,
					// i.e. __layout.hbs.
					return filename.slice(0, 2) !== '__';
				}
			}
		},

		watch: {
			scripts: {
				files: 'app/**/*.js',
				tasks: ['browserify', 'uglify'],
				options: {
					interrupt: true
				}
			},
			templates: {
				files: 'app/**/*.hbs',
				tasks: ['handlebars'],
				options: {
					interrupt: true
				}
			}
		},

		uglify: {
			options: {
				compress: {
					drop_console: true
				},
				mangle: true
			},
			bundle: {
				files: {
					'public/bundle.min.js': ['public/bundle.js']
				}
			}
		},

		browserify: {
			options: {
				debug: false,
				alias: [
					'node_modules/rendr-handlebars/index.js:rendr-handlebars'
				],
				transforms: [ require('browserify-handlebars') ],
				aliasMappings: [
					{
						cwd: 'app/',
						src: ['**/*.js'],
						dest: 'app/'
					}
				],
				shim: {
					jquery: {
						path: 'assets/vendor/zepto',
						exports: '$'
					}
				}
			},
			app: {
				src: [ 'app/**/*.js' ],
				dest: 'public/bundle.js'
			},
			tests: {
				src: [
					'test/helper.js',
					'test/app/**/*.js'
				],
				dest: 'public/testBundle.js'
			}
		}
	});

	grunt.loadNpmTasks('grunt-browserify');
	grunt.loadNpmTasks('grunt-contrib-handlebars');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-uglify');

	grunt.registerTask('runNode', function () {
		grunt.util.spawn({
			cmd: 'node',
			args: ['./node_modules/nodemon/nodemon.js', 'index.js'],
			opts: {
				stdio: 'inherit'
			}
		}, function () {
			grunt.fail.fatal(new Error("nodemon quit"));
		});
	});


	grunt.registerTask('compile', ['handlebars', 'browserify', 'uglify']);

	// Run the server and watch for file changes
	grunt.registerTask('server', ['compile', 'runNode', 'watch']);

	// Default task(s).
	grunt.registerTask('default', ['compile']);
};
