/*
 * Modular - JavaScript AMD Framework
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/modular/
 *
 * Implements the AMD specification - see https://github.com/amdjs/amdjs-api/wiki/AMD
 *
 * Released under the MIT license
 * https://github.com/asmblah/modular/raw/master/MIT-LICENSE.txt
 */

/*global define */
define([
    "vendor/chai/chai",
    "root/modular"
], function (
    chai,
    modular
) {
    "use strict";

    var expect = chai.expect;

    describe("CommonJS scoped require()", function () {
        var loader;

        beforeEach(function (done) {
            modular.require([
                "Modular"
            ], function (
                Modular
            ) {
                loader = new Modular();
                done();
            });
        });

        it("should inherit mappings from its parent", function (done) {
            var paths = {
                "from": "to"
            };

            loader.require({
                paths: paths
            }, [
                "require"
            ], function (
                require
            ) {
                require([
                    "module"
                ], function (
                    module
                ) {
                    expect(module.config.paths).to.deep.equal(paths);
                    done();
                });
            });
        });

        it("should make use of inherited mappings from its parent", function (done) {
            var theMystic = {};

            loader.define("into/the/mystic", theMystic);

            loader.require({
                paths: {
                    "from": "into"
                }
            }, [
                "require"
            ], function (
                require
            ) {
                require([
                    "from/the/mystic"
                ], function (
                    importedMystic
                ) {
                    expect(importedMystic).to.equal(theMystic);
                    done();
                });
            });
        });
    });
});
