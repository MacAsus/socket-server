const shell = require("shelljs");

shell.cp("-Rf", "src/public/js", "dist/public/js/");
shell.cp("-Rf", "src/public/fonts", "dist/public/");
shell.cp("-Rf", "src/public/images", "dist/public/");
shell.cp("-Rf", "src/public/index.html", "dist/public/index.html");
shell.cp("-Rf", "src/public/assets", "dist/public/assets");